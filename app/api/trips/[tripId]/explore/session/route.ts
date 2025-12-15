import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProfileId } from '@/lib/auth/getProfileId';
import { getUserSubscriptionStatus, FREE_SWIPE_LIMIT_PER_TRIP } from '@/lib/supabase/user-subscription';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  let profileId: string | undefined;
  let tripId: string | undefined;
  
  try {
    tripId = (await params).tripId;

    if (!tripId) {
      console.log('[Explore Session API]', {
        route: 'explore/session',
        tripId: 'missing',
        profileId: 'unknown',
        ok: false,
        status: 400,
        check_failed: 'missing_trip_id',
        reason: 'Missing trip id',
      });
      return NextResponse.json({ 
        error: 'Missing trip id',
        ok: false,
        status: 400,
        check_failed: 'missing_trip_id',
        reason: 'Missing trip id',
      }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Log route start
    console.log('[Explore Session API]', {
      route: 'explore/session',
      tripId,
      profileId: 'pending',
    });

    // Get profile ID for authorization
    try {
      const authResult = await getProfileId(supabase);
      profileId = authResult.profileId;
    } catch (authError: any) {
      console.error('[Explore Session API]', {
        route: 'explore/session',
        tripId,
        profileId: 'unknown',
        ok: false,
        status: 401,
        check_failed: 'auth',
        reason: authError?.message || 'Failed to get profile',
      });
      return NextResponse.json(
        { 
          error: authError?.message || 'Unauthorized',
          ok: false,
          status: 401,
          check_failed: 'auth',
          reason: authError?.message || 'Failed to get profile',
        },
        { status: 401 }
      );
    }

    // Verify user has access to trip
    const { data: tripData, error: tripError } = await supabase
      .from("trips")
      .select("id, owner_id")
      .eq("id", tripId)
      .single();

    if (tripError || !tripData) {
      console.error('[Explore Session API]', {
        route: 'explore/session',
        tripId,
        profileId,
        ok: false,
        status: 404,
        check_failed: 'trip_lookup',
        reason: tripError?.message || 'Trip not found',
      });
      return NextResponse.json({ 
        error: "Trip not found",
        ok: false,
        status: 404,
        check_failed: 'trip_lookup',
        reason: tripError?.message || 'Trip not found',
      }, { status: 404 });
    }

    type TripQueryResult = {
      id: string
      owner_id: string
    }

    const trip = tripData as TripQueryResult;

    // Check if user is owner or member
    const { data: member } = await supabase
      .from("trip_members")
      .select("id")
      .eq("trip_id", tripId)
      .eq("user_id", profileId)
      .single();

    if (trip.owner_id !== profileId && !member) {
      const checkFailed = trip.owner_id !== profileId ? 'not_owner' : 'not_member';
      console.error('[Explore Session API]', {
        route: 'explore/session',
        tripId,
        profileId,
        ok: false,
        status: 403,
        check_failed: checkFailed,
        reason: 'User does not have access to this trip',
      });
      return NextResponse.json({ 
        error: "Forbidden",
        ok: false,
        status: 403,
        check_failed: checkFailed,
        reason: 'User does not have access to this trip',
      }, { status: 403 });
    }

    // Get trip_segment_id from query params (optional)
    const url = new URL(req.url);
    const tripSegmentId = url.searchParams.get('trip_segment_id') || null;

    // Get or create explore session (segment-scoped if trip_segment_id provided)
    let query = supabase
      .from('explore_sessions')
      .select('*')
      .eq('trip_id', tripId)
      .eq('user_id', profileId);

    // Handle NULL trip_segment_id properly - use .is() for null, .eq() for values
    if (tripSegmentId === null) {
      query = query.is('trip_segment_id', null);
    } else {
      query = query.eq('trip_segment_id', tripSegmentId);
    }

    let { data: sessionData, error: sessionError } = await query.maybeSingle();

    if (sessionError && sessionError.code !== 'PGRST116') {
      console.error('[Explore Session API]', {
        path: '/api/trips/[tripId]/explore/session',
        method: 'GET',
        tripId,
        profileId,
        error: sessionError.message || 'Failed to fetch session',
        errorCode: sessionError.code,
        tripSegmentId,
        context: 'fetch_session',
      });
      return NextResponse.json(
        { error: 'Failed to fetch session' },
        { status: 500 }
      );
    }

    type SessionQueryResult = {
      swipe_count: number | null
      liked_place_ids: string[] | null
      discarded_place_ids: string[] | null
      [key: string]: any
    }

    let session = sessionData as SessionQueryResult | null;

    // Create session if it doesn't exist
    if (!session) {
      const { data: newSession, error: createError } = await (supabase
        .from('explore_sessions') as any)
        .insert({
          trip_id: tripId,
          user_id: profileId,
          trip_segment_id: tripSegmentId,
          liked_place_ids: [],
          discarded_place_ids: [],
          swipe_count: 0,
        })
        .select()
        .single();

      if (createError) {
        console.error('[Explore Session API]', {
          path: '/api/trips/[tripId]/explore/session',
          method: 'GET',
          tripId,
          profileId,
          error: createError.message || 'Failed to create session',
          errorCode: createError.code,
          tripSegmentId,
          context: 'create_session',
        });
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      }

      session = newSession as SessionQueryResult;
    }

    // Get subscription status and trip limit
    // Note: getUserSubscriptionStatus expects clerkUserId
    let isPro = false;
    try {
      const authResult = await getProfileId(supabase);
      const subscriptionStatus = await getUserSubscriptionStatus(authResult.clerkUserId);
      isPro = subscriptionStatus.isPro;
    } catch (subscriptionError: any) {
      console.error('[Explore Session API]', {
        path: '/api/trips/[tripId]/explore/session',
        method: 'GET',
        tripId,
        profileId,
        error: subscriptionError?.message || 'Failed to get subscription status',
        errorCode: subscriptionError?.code,
        tripSegmentId,
        context: 'subscription_status',
      });
      // Continue with default isPro = false
    }

    // Calculate remaining swipes (null for Pro users)
    const swipeCount = (session?.swipe_count || 0);
    const remainingSwipes = isPro ? null : Math.max(0, FREE_SWIPE_LIMIT_PER_TRIP - swipeCount);

    // Log success
    console.log('[Explore Session API]', {
      route: 'explore/session',
      tripId,
      profileId,
      ok: true,
      status: 200,
    });

    return NextResponse.json({
      likedPlaces: session.liked_place_ids || [],
      discardedPlaces: session.discarded_place_ids || [],
      swipeCount,
      remainingSwipes,
      dailyLimit: isPro ? null : FREE_SWIPE_LIMIT_PER_TRIP, // Keep field name for backward compatibility
    });
  } catch (err: any) {
    console.error('[Explore Session API]', {
      route: 'explore/session',
      tripId: tripId || 'unknown',
      profileId: profileId || 'unknown',
      ok: false,
      status: 500,
      check_failed: 'internal_error',
      reason: err?.message || 'Internal server error',
    });
    return NextResponse.json(
      { 
        error: err?.message || 'Internal server error',
        ok: false,
        status: 500,
        check_failed: 'internal_error',
        reason: err?.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  let profileId: string | undefined;
  let tripId: string | undefined;
  
  try {
    tripId = (await params).tripId;

    if (!tripId) {
      return NextResponse.json({ error: 'Missing trip id' }, { status: 400 });
    }

    const supabase = await createClient();

    // Get profile ID for authorization
    try {
      const authResult = await getProfileId(supabase);
      profileId = authResult.profileId;
    } catch (authError: any) {
      console.error('[Explore Session API]', {
        path: '/api/trips/[tripId]/explore/session',
        method: 'DELETE',
        error: authError?.message || 'Failed to get profile',
        tripId,
      });
      return NextResponse.json(
        { error: authError?.message || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user has access to trip
    const { data: tripData, error: tripError } = await supabase
      .from("trips")
      .select("id, owner_id")
      .eq("id", tripId)
      .single();

    if (tripError || !tripData) {
      console.error('[Explore Session API]', {
        path: '/api/trips/[tripId]/explore/session',
        method: 'DELETE',
        tripId,
        profileId,
        error: tripError?.message || 'Trip not found',
        errorCode: tripError?.code,
        context: 'trip_lookup',
      });
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    type TripQueryResult = {
      id: string
      owner_id: string
    }

    const trip = tripData as TripQueryResult;

    // Check if user is owner or member
    const { data: member } = await supabase
      .from("trip_members")
      .select("id")
      .eq("trip_id", tripId)
      .eq("user_id", profileId)
      .single();

    if (trip.owner_id !== profileId && !member) {
      console.error('[Explore Session API]', {
        path: '/api/trips/[tripId]/explore/session',
        method: 'DELETE',
        tripId,
        profileId,
        error: 'Forbidden: User does not have access to this trip',
        check_failed: trip.owner_id !== profileId ? 'not_owner' : 'not_member',
        trip_owner_id: trip.owner_id,
        is_member: !!member,
        context: 'authorization_check',
      });
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get trip_segment_id from query params (optional)
    const url = new URL(req.url);
    const tripSegmentId = url.searchParams.get('trip_segment_id') || null;

    // Reset session: clear liked/discarded arrays and reset swipe_count
    // Keep last_swipe_at unchanged (for daily reset logic)
    let updateQuery = (supabase
      .from('explore_sessions') as any)
      .update({
        liked_place_ids: [],
        discarded_place_ids: [],
        swipe_count: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('trip_id', tripId)
      .eq('user_id', profileId);

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

      console.error('[Explore Session API]', {
        path: '/api/trips/[tripId]/explore/session',
        method: 'DELETE',
        tripId,
        profileId,
        error: updateError.message || 'Failed to clear session',
        errorCode: updateError.code,
        tripSegmentId,
        context: 'clear_session',
      });
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Explore Session API]', {
      path: '/api/trips/[tripId]/explore/session',
      method: 'DELETE',
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

