import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { getUserSubscriptionStatus } from '@/lib/supabase/user-subscription';
import { assertStripeEnv, getStripePriceIds } from '@/lib/billing/stripe-env';
import { getProfileId } from '@/lib/auth/getProfileId';
import { randomUUID } from 'crypto';

type TripQueryResult = {
  id: string
  owner_id: string
}

type TripProQueryResult = {
  has_trip_pro: boolean | null
}

type ProfileQueryResult = {
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
  Object.fromEntries(Object.entries(entries).filter(([, value]) => value !== undefined && value !== ''));

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { tripId, returnUrl, couponCode: rawCouponCode, utm: rawUtm } = body as {
      tripId?: string;
      returnUrl?: string;
      couponCode?: string;
      utm?: UtmPayload;
    };

    if (!tripId) {
      return NextResponse.json({ error: 'tripId is required' }, { status: 400 });
    }

    const couponCode = normalizeString(rawCouponCode, 32);
    const utm = {
      utm_source: normalizeString(rawUtm?.utm_source, 100),
      utm_medium: normalizeString(rawUtm?.utm_medium, 100),
      utm_campaign: normalizeString(rawUtm?.utm_campaign, 100),
      utm_content: normalizeString(rawUtm?.utm_content, 100),
    };

    const supabase = await createClient();

    // Get profileId (UUID) to compare with trip.owner_id
    // Trips are created with owner_id set to profileId, not Clerk userId
    const { profileId } = await getProfileId(supabase);

    // Validate trip exists and belongs to user
    const { data: tripData, error: tripError } = await supabase
      .from('trips')
      .select('id, owner_id')
      .eq('id', tripId)
      .single();

    if (tripError || !tripData) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    const trip = tripData as TripQueryResult;

    // Compare with profileId (UUID) instead of Clerk userId
    if (trip.owner_id !== profileId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if user already has account Pro
    const { isPro } = await getUserSubscriptionStatus(userId);
    if (isPro) {
      return NextResponse.json(
        { error: 'You already have Kruno Pro. Trip unlock is not needed.' },
        { status: 400 }
      );
    }

    // Check if trip already has Pro
    const { data: tripProData } = await supabase
      .from('trips')
      .select('has_trip_pro')
      .eq('id', tripId)
      .single();

    const tripPro = tripProData as TripProQueryResult | null;

    if (tripPro?.has_trip_pro) {
      return NextResponse.json(
        { error: 'This trip is already unlocked' },
        { status: 400 }
      );
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const email = user.primaryEmailAddress?.emailAddress;
    if (!email) {
      return NextResponse.json({ error: 'Email not found' }, { status: 400 });
    }

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

    const profile = profileData as (ProfileQueryResult & { id?: string }) | null;
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
    const { perTrip: priceId } = getStripePriceIds();

    // Determine return URL - use provided returnUrl or default to trip page
    const baseReturnUrl = returnUrl || `${req.nextUrl.origin}/trips/${tripId}`;
    const successUrl = `${process.env.STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}&return_url=${encodeURIComponent(baseReturnUrl)}`;
    const cancelUrl = baseReturnUrl;

    let discounts: Array<{ promotion_code: string }> | undefined;
    if (couponCode) {
      try {
        const promotions = await stripe.promotionCodes.list({
          code: couponCode,
          active: true,
          limit: 1,
        });
        const promotion = promotions.data[0];
        if (promotion) {
          discounts = [{ promotion_code: promotion.id }];
        }
      } catch (error) {
        console.warn("Failed to lookup promotion code:", error);
      }
    }

    const attributionMetadata = buildMetadata({
      app: 'kruno',
      user_id: userId,
      coupon_code: couponCode,
      utm_source: utm.utm_source,
      utm_medium: utm.utm_medium,
      utm_campaign: utm.utm_campaign,
      utm_content: utm.utm_content,
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      discounts,
      metadata: {
        ...attributionMetadata,
        kruno_checkout_type: 'trip_unlock',
        kruno_trip_id: tripId,
        kruno_user_id: userId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('POST /billing/checkout/trip error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
