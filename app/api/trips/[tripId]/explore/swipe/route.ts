import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProfileId } from '@/lib/auth/getProfileId';
import { getTripProStatus } from '@/lib/supabase/pro-status';
import { FREE_SWIPE_LIMIT_PER_TRIP, PRO_SWIPE_LIMIT_PER_TRIP } from '@/lib/supabase/user-subscription';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  let profileId: string | undefined;
  let tripId: string | undefined;
  
  try {
    tripId = (await params).tripId;
    const supabase = await createClient();
    
    try {
      const authResult = await getProfileId(supabase);
      profileId = authResult.profileId;
    } catch (authError: any) {
      console.error('[Explore Swipe API]', {
        path: '/api/trips/[tripId]/explore/swipe',
        method: 'POST',
        error: authError?.message || 'Failed to get profile',
        tripId: tripId || 'unknown',
      });
      return NextResponse.json(
        { error: authError?.message || 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!tripId) {
      return NextResponse.json({ error: 'Missing trip id' }, { status: 400 });
    }

    const body = await req.json();
    const { place_id, action, previous_action, source, trip_segment_id, day_id, slot } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Missing action' },
        { status: 400 }
      );
    }

    if (action !== 'like' && action !== 'dislike' && action !== 'undo') {
      return NextResponse.json(
        { error: 'Invalid action. Must be "like", "dislike", or "undo"' },
        { status: 400 }
      );
    }

    // For undo, require place_id and previous_action
    if (action === 'undo') {
      if (!place_id || !previous_action) {
        return NextResponse.json(
          { error: 'Missing place_id or previous_action for undo' },
          { status: 400 }
        );
      }
      if (previous_action !== 'like' && previous_action !== 'dislike') {
        return NextResponse.json(
          { error: 'Invalid previous_action. Must be "like" or "dislike"' },
          { status: 400 }
        );
      }
    } else {
      // For like/dislike, require place_id
      if (!place_id) {
        return NextResponse.json(
          { error: 'Missing place_id' },
          { status: 400 }
        );
      }
    }

    // Source defaults to 'trip' for backward compatibility
    const swipeSource = source || 'trip';

    // Validate day-level swipes require dayId
    if (swipeSource === 'day') {
      if (!day_id) {
        return NextResponse.json(
          { error: 'Missing dayId for day-level swipe' },
          { status: 400 }
        );
      }
    }

    // Get or create explore session (segment-scoped if trip_segment_id provided)
    let query = supabase
      .from('explore_sessions')
      .select('*')
      .eq('trip_id', tripId)
      .eq('user_id', profileId);

    // Handle NULL trip_segment_id properly - use .is() for null, .eq() for values
    if (trip_segment_id === null || trip_segment_id === undefined) {
      query = query.is('trip_segment_id', null);
    } else {
      query = query.eq('trip_segment_id', trip_segment_id);
    }

    const { data: sessionData, error: sessionError } = await query.maybeSingle();

    if (sessionError && sessionError.code !== 'PGRST116') {
      console.error('[Explore Swipe API]', {
        path: '/api/trips/[tripId]/explore/swipe',
        method: 'POST',
        tripId,
        profileId,
        error: sessionError.message || 'Failed to fetch session',
        errorCode: sessionError.code,
        trip_segment_id,
        action,
        place_id,
        context: 'fetch_session',
      });
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

    type SessionQueryResult = {
      swipe_count: number | null
      liked_place_ids: string[] | null
      discarded_place_ids: string[] | null
      [key: string]: any
    }

    const session = sessionData as SessionQueryResult | null;

    // Get trip Pro status (account Pro OR trip Pro) and determine limit
    // Note: getTripProStatus expects clerkUserId, so we need to get it from getProfileId
    let isProForThisTrip = false;
    try {
      const authResult = await getProfileId(supabase);
      const proStatus = await getTripProStatus(supabase, authResult.clerkUserId, tripId);
      isProForThisTrip = proStatus.isProForThisTrip;
    } catch (proStatusError: any) {
      console.error('[Explore Swipe API]', {
        path: '/api/trips/[tripId]/explore/swipe',
        method: 'POST',
        tripId,
        profileId,
        error: proStatusError?.message || 'Failed to get trip pro status',
        errorCode: proStatusError?.code,
        trip_segment_id,
        action,
        place_id,
        context: 'pro_status_check',
      });
      // Continue with default isProForThisTrip = false
    }
    const limit = isProForThisTrip ? PRO_SWIPE_LIMIT_PER_TRIP : FREE_SWIPE_LIMIT_PER_TRIP;

    // Get current swipe count from session (per trip, no daily reset)
    const swipeCount = session?.swipe_count || 0;

    // Check limit before mutating
    const limitReached = swipeCount >= limit;
    if (limitReached) {
      const errorMessage = isProForThisTrip
        ? "You've reached the swipe limit for this trip today. Try saving your favorites or adjusting your filters."
        : "You've reached the swipe limit for this trip. Unlock Kruno Pro or this trip to see more places.";
      
      return NextResponse.json({
        success: false,
        swipeCount,
        remainingSwipes: 0,
        limitReached: true,
        error: errorMessage,
      });
    }

    // Handle undo action
    if (action === 'undo') {
      if (!session) {
        return NextResponse.json({
          success: false,
          error: 'No session found',
          swipeCount,
          remainingSwipes: Math.max(0, limit - swipeCount),
          limitReached: false,
        });
      }

      // Verify that the place_id exists in the corresponding array
      const currentLiked = [...(session.liked_place_ids || [])];
      const currentDiscarded = [...(session.discarded_place_ids || [])];
      
      let removedPlaceId: string | null = null;
      let found = false;

      if (previous_action === 'like') {
        const index = currentLiked.indexOf(place_id);
        if (index !== -1) {
          removedPlaceId = currentLiked.splice(index, 1)[0];
          found = true;
        }
      } else if (previous_action === 'dislike') {
        const index = currentDiscarded.indexOf(place_id);
        if (index !== -1) {
          removedPlaceId = currentDiscarded.splice(index, 1)[0];
          found = true;
        }
      }

      if (!found || !removedPlaceId) {
        return NextResponse.json({
          success: false,
          error: 'Place not found in session or cannot be undone',
          swipeCount,
          remainingSwipes: Math.max(0, limit - swipeCount),
          limitReached: false,
        });
      }

      // Decrement swipe count (but don't go below 0) - Option B: undo gives swipe back
      const newSwipeCount = Math.max(0, swipeCount - 1);

      // Update session with undone swipe
      let undoUpdateQuery = (supabase
        .from('explore_sessions') as any)
        .update({
          liked_place_ids: currentLiked,
          discarded_place_ids: currentDiscarded,
          swipe_count: newSwipeCount,
          last_swipe_at: session.last_swipe_at, // Keep timestamp for reference (not used in limit logic)
        })
        .eq('trip_id', tripId)
        .eq('user_id', profileId);

      // Handle NULL trip_segment_id properly
      if (trip_segment_id === null || trip_segment_id === undefined) {
        undoUpdateQuery = undoUpdateQuery.is('trip_segment_id', null);
      } else {
        undoUpdateQuery = undoUpdateQuery.eq('trip_segment_id', trip_segment_id);
      }

      const { data: updatedSession, error: updateError } = await undoUpdateQuery
        .select()
        .single();

      if (updateError) {
        console.error('[Explore Swipe API]', {
          path: '/api/trips/[tripId]/explore/swipe',
          method: 'POST',
          tripId,
          profileId,
          error: updateError.message || 'Failed to undo swipe',
          errorCode: updateError.code,
          trip_segment_id,
          action,
          place_id,
          previous_action,
          context: 'undo_swipe',
        });
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      }

      const remainingSwipes = Math.max(0, limit - newSwipeCount);

      return NextResponse.json({
        success: true,
        swipeCount: newSwipeCount,
        remainingSwipes,
        limitReached: false,
        undonePlaceId: removedPlaceId,
      });
    }

    // Prepare arrays for update
    const currentLiked = session?.liked_place_ids || [];
    const currentDiscarded = session?.discarded_place_ids || [];

    // Check if place is already liked/discarded
    if (currentLiked.includes(place_id) || currentDiscarded.includes(place_id)) {
      return NextResponse.json({
        success: false,
        error: 'Place already swiped',
        swipeCount,
        remainingSwipes: Math.max(0, limit - swipeCount),
        limitReached: false,
      });
    }

    // Update arrays based on action
    // Note: For now, we store all swipes in the same arrays regardless of source
    // In the future, we can separate trip vs day swipes if needed
    let updatedLiked = [...currentLiked];
    let updatedDiscarded = [...currentDiscarded];

    if (action === 'like') {
      updatedLiked.push(place_id);
    } else {
      updatedDiscarded.push(place_id);
    }

    // Increment swipe count only if limit not reached
    // Note: We already checked limitReached above, so this should be safe
    const newSwipeCount = swipeCount + 1;

    // Update or create session
    const now = new Date();
    
    // First, try to update existing session
    let updateQuery = (supabase
      .from('explore_sessions') as any)
      .update({
        liked_place_ids: updatedLiked,
        discarded_place_ids: updatedDiscarded,
        swipe_count: newSwipeCount,
        last_swipe_at: now.toISOString(),
      })
      .eq('trip_id', tripId)
      .eq('user_id', profileId);

    // Handle NULL trip_segment_id properly
    if (trip_segment_id === null || trip_segment_id === undefined) {
      updateQuery = updateQuery.is('trip_segment_id', null);
    } else {
      updateQuery = updateQuery.eq('trip_segment_id', trip_segment_id);
    }

    const { data: updatedSession, error: updateError } = await updateQuery
      .select()
      .maybeSingle();

    if (updateError) {
      console.error('[Explore Swipe API]', {
        path: '/api/trips/[tripId]/explore/swipe',
        method: 'POST',
        tripId,
        profileId,
        error: updateError.message || 'Failed to update session',
        errorCode: updateError.code,
        trip_segment_id,
        action,
        place_id,
        source: swipeSource,
        context: 'update_session',
      });
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

    // If no session exists, create it
    if (!updatedSession) {
      const { data: newSession, error: createError } = await (supabase
        .from('explore_sessions') as any)
        .insert({
          trip_id: tripId,
          user_id: profileId,
          trip_segment_id: trip_segment_id || null,
          liked_place_ids: updatedLiked,
          discarded_place_ids: updatedDiscarded,
          swipe_count: newSwipeCount,
          last_swipe_at: now.toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.error('[Explore Swipe API]', {
          path: '/api/trips/[tripId]/explore/swipe',
          method: 'POST',
          tripId,
          profileId,
          error: createError.message || 'Failed to create session',
          errorCode: createError.code,
          trip_segment_id,
          action,
          place_id,
          source: swipeSource,
          context: 'create_session',
        });
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      }

      // Use the newly created session
      const remainingSwipes = Math.max(0, limit - newSwipeCount);

      return NextResponse.json({
        success: true,
        swipeCount: newSwipeCount,
        remainingSwipes,
        limitReached: newSwipeCount >= limit,
      });
    }

    // Calculate remaining swipes
    const remainingSwipes = Math.max(0, limit - newSwipeCount);

    return NextResponse.json({
      success: true,
      swipeCount: newSwipeCount,
      remainingSwipes,
      limitReached: newSwipeCount >= limit,
    });
  } catch (err: any) {
    console.error('[Explore Swipe API]', {
      path: '/api/trips/[tripId]/explore/swipe',
      method: 'POST',
      tripId: tripId || 'unknown',
      profileId: profileId || 'unknown',
      error: err?.message || 'Internal server error',
      errorCode: err?.code,
    });
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

