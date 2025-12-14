import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';

type ProfileQueryResult = {
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
      .select('stripe_customer_id')
      .eq('id', userId)
      .maybeSingle();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    const profile = profileData as ProfileQueryResult | null;
    let stripeCustomerId = profile?.stripe_customer_id;

    // Create Stripe customer if doesn't exist
    if (!stripeCustomerId) {
      console.log(`Creating Stripe customer for user ${userId}`);
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
        } as any, {
          onConflict: 'id',
        });

      if (updateError) {
        console.error('Error updating profile with Stripe customer ID:', updateError);
        return NextResponse.json({ error: 'Failed to save customer ID' }, { status: 500 });
      }
      console.log(`Stripe customer ${stripeCustomerId} created and saved for user ${userId}`);
    }

    // Create portal session
    const appUrl = process.env.APP_URL ?? 'https://kruno.app';
    const returnUrl = `${appUrl}/settings/billing`;

    console.log(`Creating billing portal session for customer ${stripeCustomerId}`);
    const portal = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: portal.url });
  } catch (err: any) {
    console.error('POST /billing/portal error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
