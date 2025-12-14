import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { assertStripeEnv, getStripePriceIds } from '@/lib/billing/stripe-env';
import { randomUUID } from 'crypto';

type ProfileQueryResult = {
  id?: string
  stripe_customer_id: string | null
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const email = user.primaryEmailAddress?.emailAddress;
    if (!email) {
      return NextResponse.json({ error: 'Email not found' }, { status: 400 });
    }

    const supabase = await createClient();

    // Fetch or create profile
    let { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, stripe_customer_id')
      .eq('clerk_user_id', userId)
      .maybeSingle();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    const profile = profileData as ProfileQueryResult | null;
    let stripeCustomerId = profile?.stripe_customer_id;

    // Create Stripe customer if doesn't exist
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { kruno_user_id: userId },
      });

      stripeCustomerId = customer.id;

      // Generate UUID for new profiles, use existing id for updates
      const profileId = profile?.id || randomUUID();

      // Update profile with Stripe customer ID
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: profileId,
          clerk_user_id: userId,
          email,
          stripe_customer_id: stripeCustomerId,
        } as any, {
          onConflict: 'clerk_user_id',
        });

      if (updateError) {
        console.error('Error updating profile with Stripe customer ID:', updateError);
        return NextResponse.json({ error: 'Failed to save customer ID' }, { status: 500 });
      }
    }

    // Validate Stripe environment variables
    assertStripeEnv();
    const { proYearly: priceId } = getStripePriceIds();

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: process.env.STRIPE_CANCEL_URL || `${req.nextUrl.origin}/settings`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('POST /billing/checkout/subscription error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
