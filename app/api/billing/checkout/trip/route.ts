import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { getUserSubscriptionStatus } from '@/lib/supabase/user-subscription';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { tripId } = body;

    if (!tripId) {
      return NextResponse.json({ error: 'tripId is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Validate trip exists and belongs to user
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('id, owner_id')
      .eq('id', tripId)
      .single();

    if (tripError || !trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    if (trip.owner_id !== userId) {
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
    const { data: tripData } = await supabase
      .from('trips')
      .select('has_trip_pro')
      .eq('id', tripId)
      .single();

    if (tripData?.has_trip_pro) {
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
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .maybeSingle();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    let stripeCustomerId = profile?.stripe_customer_id;

    // Create Stripe customer if doesn't exist
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { kruno_user_id: userId },
      });

      stripeCustomerId = customer.id;

      // Update profile with Stripe customer ID
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email,
          stripe_customer_id: stripeCustomerId,
        }, {
          onConflict: 'id',
        });

      if (updateError) {
        console.error('Error updating profile with Stripe customer ID:', updateError);
        return NextResponse.json({ error: 'Failed to save customer ID' }, { status: 500 });
      }
    }

    // Create checkout session
    if (!process.env.STRIPE_PRICE_ID_TRIP_UNLOCK) {
      return NextResponse.json({ error: 'Stripe price ID not configured' }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: stripeCustomerId,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID_TRIP_UNLOCK,
          quantity: 1,
        },
      ],
      success_url: `${process.env.STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: process.env.STRIPE_CANCEL_URL || `${req.nextUrl.origin}/trips/${tripId}`,
      metadata: {
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
