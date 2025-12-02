import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserSubscriptionStatus } from '@/lib/supabase/user-subscription';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isPro } = await getUserSubscriptionStatus(userId);

    return NextResponse.json({ isPro });
  } catch (err: any) {
    console.error('GET /user/subscription-status error:', err);
    // Return isPro: false instead of 500 error to avoid breaking the UI
    // This handles cases where the profile doesn't exist or database schema mismatches
    return NextResponse.json({ isPro: false });
  }
}

