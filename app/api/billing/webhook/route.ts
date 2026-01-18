import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { clerkClient } from '@clerk/nextjs/server';
import {
  sendProUpgradeEmail,
  sendSubscriptionCanceledEmail,
} from '@/lib/email/resend';
import { getFirstNameFromFullName, normalizeEmailLanguage } from '@/lib/email/language';

// Disable body parsing for webhook - we need raw body for signature verification
export const runtime = 'nodejs';

// Next.js 15: disable body parsing to get raw body
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const sig = req.headers.get('stripe-signature');

    if (!sig) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('STRIPE_WEBHOOK_SECRET is not set');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    // Read raw body
    const buf = Buffer.from(await req.arrayBuffer());

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        buf,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err: any) {
      console.error('Stripe webhook signature verification error:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const supabase = await createClient();

    type ProfileEmailInfo = {
      id: string;
      email: string;
      full_name: string | null;
      clerk_user_id: string | null;
      pro_upgrade_email_sent_at: string | null;
      subscription_canceled_email_sent_at: string | null;
    };

    async function loadProfileByCustomerId(customerId: string) {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, clerk_user_id, pro_upgrade_email_sent_at, subscription_canceled_email_sent_at')
        .eq('stripe_customer_id', customerId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile by stripe_customer_id:', error);
        return null;
      }

      return profile as ProfileEmailInfo | null;
    }

    async function loadClerkEmailDetails(clerkUserId: string | null) {
      if (!clerkUserId) return null;
      try {
        const client = await clerkClient();
        const user = await client.users.getUser(clerkUserId);
        return {
          email: user.primaryEmailAddress?.emailAddress || null,
          firstName: user.firstName || getFirstNameFromFullName(user.fullName),
          locale: (user.publicMetadata as { locale?: string } | undefined)?.locale || null,
        };
      } catch (error) {
        console.warn('Failed to load Clerk user for email details:', error);
        return null;
      }
    }

    async function sendProUpgradeIfNeeded(customerId: string) {
      const profile = await loadProfileByCustomerId(customerId);
      if (!profile) return;

      if (profile.pro_upgrade_email_sent_at) {
        console.log(`Pro upgrade email already sent for customer ${customerId}`);
        return;
      }

      const clerkDetails = await loadClerkEmailDetails(profile.clerk_user_id);
      const language = normalizeEmailLanguage(clerkDetails?.locale);
      const firstName = clerkDetails?.firstName || getFirstNameFromFullName(profile.full_name);
      const userEmail = clerkDetails?.email || profile.email;
      const appUrl = process.env.APP_URL ?? 'https://kruno.app';
      const billingUrl = `${appUrl}/settings/billing`;

      if (!userEmail) {
        console.warn(`No email available for customer ${customerId}. Skipping pro upgrade email.`);
        return;
      }

      await sendProUpgradeEmail({
        userEmail,
        firstName,
        billingUrl,
        language,
      });

      // Type assertion needed because Supabase type inference can fail for update calls
      const { error: updateError } = await (supabase
        .from('profiles') as any)
        .update({ pro_upgrade_email_sent_at: new Date().toISOString() })
        .eq('id', profile.id);

      if (updateError) {
        console.error('Error updating pro_upgrade_email_sent_at:', updateError);
      }
    }

    async function sendSubscriptionCanceledIfNeeded(customerId: string) {
      const profile = await loadProfileByCustomerId(customerId);
      if (!profile) return;

      if (profile.subscription_canceled_email_sent_at) {
        console.log(`Subscription canceled email already sent for customer ${customerId}`);
        return;
      }

      const clerkDetails = await loadClerkEmailDetails(profile.clerk_user_id);
      const language = normalizeEmailLanguage(clerkDetails?.locale);
      const firstName = clerkDetails?.firstName || getFirstNameFromFullName(profile.full_name);
      const userEmail = clerkDetails?.email || profile.email;

      if (!userEmail) {
        console.warn(`No email available for customer ${customerId}. Skipping cancellation email.`);
        return;
      }

      await sendSubscriptionCanceledEmail({
        userEmail,
        firstName,
        language,
      });

      // Type assertion needed because Supabase type inference can fail for update calls
      const { error: updateError } = await (supabase
        .from('profiles') as any)
        .update({ subscription_canceled_email_sent_at: new Date().toISOString() })
        .eq('id', profile.id);

      if (updateError) {
        console.error('Error updating subscription_canceled_email_sent_at:', updateError);
      }
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Handle trip unlock
        if (session.mode === 'payment' && session.metadata?.kruno_checkout_type === 'trip_unlock') {
          const tripId = session.metadata.kruno_trip_id;
          const userId = session.metadata.kruno_user_id;
          const paymentIntentId = session.payment_intent as string;

          if (!tripId || !userId || !paymentIntentId) {
            console.error('Missing metadata in trip unlock checkout session:', { tripId, userId, paymentIntentId });
            return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
          }

          // Verify trip belongs to user
          const { data: trip, error: tripError } = await supabase
            .from('trips')
            .select('id, owner_id')
            .eq('id', tripId)
            .eq('owner_id', userId)
            .single();

          if (tripError || !trip) {
            console.error('Trip not found or access denied:', tripError);
            return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
          }

          // Update trip with Pro status
          const { error: updateError } = await (supabase
            .from('trips') as any)
            .update({
              has_trip_pro: true,
              stripe_trip_payment_id: paymentIntentId,
            })
            .eq('id', tripId);

          if (updateError) {
            console.error('Error updating trip Pro status:', updateError);
            return NextResponse.json({ error: 'Failed to update trip' }, { status: 500 });
          }

          console.log(`Trip ${tripId} unlocked for user ${userId}`);
        }
        // For subscription checkouts, the customer.subscription.* events will handle is_pro
        if (session.mode === 'subscription' && session.customer) {
          const customerId = session.customer as string;
          try {
            await sendProUpgradeIfNeeded(customerId);
          } catch (error) {
            console.error('Error sending pro upgrade email from checkout.session.completed:', error);
          }
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const status = subscription.status;

        // Map subscription status to is_pro
        const isPro = status === 'active' || status === 'trialing';

        // Update profile
        const { error: updateError } = await (supabase
          .from('profiles') as any)
          .update({ is_pro: isPro })
          .eq('stripe_customer_id', customerId);

        if (updateError) {
          console.error('Error updating profile is_pro:', updateError);
          return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
        }

        console.log(`Updated profile is_pro=${isPro} for customer ${customerId}`);
        if (event.type === 'customer.subscription.created' && isPro) {
          try {
            await sendProUpgradeIfNeeded(customerId);
          } catch (error) {
            console.error('Error sending pro upgrade email from subscription.created:', error);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Set is_pro to false
        const { error: updateError } = await (supabase
          .from('profiles') as any)
          .update({ is_pro: false })
          .eq('stripe_customer_id', customerId);

        if (updateError) {
          console.error('Error updating profile is_pro:', updateError);
          return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
        }

        console.log(`Set profile is_pro=false for customer ${customerId}`);
        try {
          await sendSubscriptionCanceledIfNeeded(customerId);
        } catch (error) {
          console.error('Error sending subscription canceled email:', error);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook error:', err);
    return NextResponse.json(
      { error: err.message || 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
