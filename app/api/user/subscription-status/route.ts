import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserSubscriptionStatus } from '@/lib/supabase/user-subscription';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isPro, trips_created_count } = await getUserSubscriptionStatus(userId);

    return NextResponse.json({ isPro, trips_created_count });
  } catch (err: any) {
    console.error('GET /user/subscription-status error:', err);
    // Return isPro: false and trips_created_count: 0 instead of 500 error to avoid breaking the UI
    // This handles cases where the profile doesn't exist or database schema mismatches
    return NextResponse.json({ isPro: false, trips_created_count: 0 });
  }
}

