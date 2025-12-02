import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { getUserSubscriptionStatus, FREE_SWIPE_LIMIT_PER_TRIP } from '@/lib/supabase/user-subscription';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!tripId) {
      return NextResponse.json({ error: 'Missing trip id' }, { status: 400 });
    }

    const supabase = await createClient();

    // Get or create explore session
    let { data: session, error: sessionError } = await supabase
      .from('explore_sessions')
      .select('*')
      .eq('trip_id', tripId)
      .eq('user_id', userId)
      .maybeSingle();

    if (sessionError && sessionError.code !== 'PGRST116') {
      console.error('Error fetching explore session:', sessionError);
      return NextResponse.json(
        { error: 'Failed to fetch session' },
        { status: 500 }
      );
    }

    // Create session if it doesn't exist
    if (!session) {
      const { data: newSession, error: createError } = await supabase
        .from('explore_sessions')
        .insert({
          trip_id: tripId,
          user_id: userId,
          liked_place_ids: [],
          discarded_place_ids: [],
          swipe_count: 0,
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating explore session:', createError);
        return NextResponse.json(
          { error: 'Failed to create session' },
          { status: 500 }
        );
      }

      session = newSession;
    }

    // Get subscription status and trip limit
    const { isPro } = await getUserSubscriptionStatus(userId);

    // Calculate remaining swipes (null for Pro users)
    const swipeCount = session.swipe_count || 0;
    const remainingSwipes = isPro ? null : Math.max(0, FREE_SWIPE_LIMIT_PER_TRIP - swipeCount);

    return NextResponse.json({
      likedPlaces: session.liked_place_ids || [],
      discardedPlaces: session.discarded_place_ids || [],
      swipeCount,
      remainingSwipes,
      dailyLimit: isPro ? null : FREE_SWIPE_LIMIT_PER_TRIP, // Keep field name for backward compatibility
    });
  } catch (err) {
    console.error('GET /explore/session error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!tripId) {
      return NextResponse.json({ error: 'Missing trip id' }, { status: 400 });
    }

    const supabase = await createClient();

    // Reset session: clear liked/discarded arrays and reset swipe_count
    // Keep last_swipe_at unchanged (for daily reset logic)
    const { error: updateError } = await supabase
      .from('explore_sessions')
      .update({
        liked_place_ids: [],
        discarded_place_ids: [],
        swipe_count: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('trip_id', tripId)
      .eq('user_id', userId);

    if (updateError) {
      // If no session exists, that's fine - return success
      if (updateError.code === 'PGRST116') {
        return NextResponse.json({ success: true });
      }

      console.error('Error clearing explore session:', updateError);
      return NextResponse.json(
        { error: 'Failed to clear session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /explore/session error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

