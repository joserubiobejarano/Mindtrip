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

    // Get trip_segment_id from query params (optional)
    const url = new URL(req.url);
    const tripSegmentId = url.searchParams.get('trip_segment_id') || null;

    // Get or create explore session (segment-scoped if trip_segment_id provided)
    let query = supabase
      .from('explore_sessions')
      .select('*')
      .eq('trip_id', tripId)
      .eq('user_id', userId);

    // Handle NULL trip_segment_id properly - use .is() for null, .eq() for values
    if (tripSegmentId === null) {
      query = query.is('trip_segment_id', null);
    } else {
      query = query.eq('trip_segment_id', tripSegmentId);
    }

    const { data: session, error: sessionError } = await query.maybeSingle();

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
          trip_segment_id: tripSegmentId,
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

    // Get trip_segment_id from query params (optional)
    const url = new URL(req.url);
    const tripSegmentId = url.searchParams.get('trip_segment_id') || null;

    // Reset session: clear liked/discarded arrays and reset swipe_count
    // Keep last_swipe_at unchanged (for daily reset logic)
    let updateQuery = supabase
      .from('explore_sessions')
      .update({
        liked_place_ids: [],
        discarded_place_ids: [],
        swipe_count: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('trip_id', tripId)
      .eq('user_id', userId);

    // Handle NULL trip_segment_id properly
    if (tripSegmentId === null) {
      updateQuery = updateQuery.is('trip_segment_id', null);
    } else {
      updateQuery = updateQuery.eq('trip_segment_id', tripSegmentId);
    }

    const { error: updateError } = await updateQuery;

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

