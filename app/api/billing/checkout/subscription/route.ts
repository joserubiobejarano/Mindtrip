import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { assertStripeEnv, getStripePriceIds } from '@/lib/billing/stripe-env';
import { randomUUID } from 'crypto';

type ProfileQueryResult = {
  id?: string
  stripe_customer_id: string | null
}

type UtmPayload = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
};

const normalizeString = (value: unknown, maxLength: number) => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength) return undefined;
  return trimmed;
};

const buildMetadata = (entries: Record<string, string | undefined>) =>
  Object.fromEntries(
    Object.entries(entries).filter(
      (entry): entry is [string, string] => entry[1] !== undefined && entry[1] !== ''
    )
  );

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { returnUrl, couponCode: rawCouponCode, utm: rawUtm } = body as {
      returnUrl?: string;
      couponCode?: string;
      utm?: UtmPayload;
    };

    const couponCode = normalizeString(rawCouponCode, 32);
    const utm = {
      utm_source: normalizeString(rawUtm?.utm_source, 100),
      utm_medium: normalizeString(rawUtm?.utm_medium, 100),
      utm_campaign: normalizeString(rawUtm?.utm_campaign, 100),
      utm_content: normalizeString(rawUtm?.utm_content, 100),
    };

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

    // Determine return URL - use provided returnUrl or default to /settings
    const baseReturnUrl = returnUrl || `${req.nextUrl.origin}/settings`;
    const successUrl = `${process.env.STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}&return_url=${encodeURIComponent(baseReturnUrl)}`;
    const cancelUrl = baseReturnUrl;

    const metadata = buildMetadata({
      app: 'kruno',
      user_id: userId,
      coupon_code: couponCode,
      utm_source: utm.utm_source,
      utm_medium: utm.utm_medium,
      utm_campaign: utm.utm_campaign,
      utm_content: utm.utm_content,
    });

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
    };

    if (couponCode) {
      try {
        const promotions = await stripe.promotionCodes.list({
          code: couponCode,
          active: true,
          limit: 1,
        });
        const promotion = promotions.data[0];
        if (promotion) {
          sessionParams.discounts = [{ promotion_code: promotion.id }];
        } else {
          sessionParams.allow_promotion_codes = true;
        }
      } catch (error) {
        console.warn('Failed to lookup promotion code:', error);
        sessionParams.allow_promotion_codes = true;
      }
    } else {
      sessionParams.allow_promotion_codes = true;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('POST /billing/checkout/subscription error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
