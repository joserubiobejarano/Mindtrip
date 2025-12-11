import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

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
          const { error: updateError } = await supabase
            .from('trips')
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
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ is_pro: isPro })
          .eq('stripe_customer_id', customerId);

        if (updateError) {
          console.error('Error updating profile is_pro:', updateError);
          return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
        }

        console.log(`Updated profile is_pro=${isPro} for customer ${customerId}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Set is_pro to false
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ is_pro: false })
          .eq('stripe_customer_id', customerId);

        if (updateError) {
          console.error('Error updating profile is_pro:', updateError);
          return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
        }

        console.log(`Set profile is_pro=false for customer ${customerId}`);
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
