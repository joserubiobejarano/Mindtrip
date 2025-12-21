import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProfileId } from '@/lib/auth/getProfileId';
import { getPlacesToExplore, type ExploreFilters } from '@/lib/google/explore-places';
import type { SmartItinerary } from '@/types/itinerary';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  let profileId: string | undefined;
  let tripId: string | undefined;
  
  try {
    tripId = (await params).tripId;

    if (!tripId) {
      console.log('[Explore Places API]', {
        route: 'explore/places',
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
    console.log('[Explore Places API]', {
      route: 'explore/places',
      tripId,
      profileId: 'pending',
    });

    // Get profile ID for authorization
    try {
      const authResult = await getProfileId(supabase);
      profileId = authResult.profileId;
    } catch (authError: any) {
      console.error('[Explore Places API]', {
        route: 'explore/places',
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
      console.error('[Explore Places API]', {
        route: 'explore/places',
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
      console.error('[Explore Places API]', {
        route: 'explore/places',
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

    // Get URL for query parameters
    const url = new URL(req.url);

    // Get trip_segment_id from query params (optional)
    const tripSegmentId = url.searchParams.get('trip_segment_id') || null;

    // Get explore session to exclude already swiped places (segment-scoped if trip_segment_id provided)
    const segmentIdForQuery = tripSegmentId || '00000000-0000-0000-0000-000000000000';
    const { data: sessionData } = await supabase
      .from('explore_sessions')
      .select('liked_place_ids, discarded_place_ids')
      .eq('trip_id', tripId)
      .eq('user_id', profileId)
      .eq('trip_segment_id', segmentIdForQuery)
      .maybeSingle();

    type SessionQueryResult = {
      liked_place_ids: string[] | null
      discarded_place_ids: string[] | null
    }

    const session = sessionData as SessionQueryResult | null;

    // Get query parameter for including itinerary places
    const includeItineraryPlaces = url.searchParams.get('includeItineraryPlaces') === 'true';

    // Get places already in itinerary (from SmartItinerary, segment-scoped if trip_segment_id provided)
    let itineraryQuery = supabase
      .from('smart_itineraries')
      .select('content')
      .eq('trip_id', tripId);
    
    if (tripSegmentId) {
      itineraryQuery = itineraryQuery.eq('trip_segment_id', tripSegmentId);
    } else {
      // For trip-level, get itinerary without segment_id (legacy single-city trips)
      itineraryQuery = itineraryQuery.is('trip_segment_id', null);
    }
    
    const { data: itineraryData } = await itineraryQuery.maybeSingle();

    // Extract place_ids from SmartItinerary
    const alreadyPlannedPlaceIds: string[] = [];
    
    type ItineraryQueryResult = {
      content: any
    }

    const itineraryDataTyped = itineraryData as ItineraryQueryResult | null;

    if (itineraryDataTyped?.content && !includeItineraryPlaces) {
      try {
        const itinerary = itineraryDataTyped.content as SmartItinerary;
        itinerary.days?.forEach((day) => {
          day.slots?.forEach((slot) => {
            slot.places?.forEach((place) => {
              // Assuming place.id is the Google place_id
              // If SmartItinerary stores it differently, adjust accordingly
              if (place.id) {
                alreadyPlannedPlaceIds.push(place.id);
              }
            });
          });
        });
        
        // DEV-only logging
        if (process.env.NODE_ENV === 'development') {
          console.debug('[Explore Places API] itinerary places extracted', {
            tripId,
            tripSegmentId,
            itineraryPlaceIdsCount: alreadyPlannedPlaceIds.length,
            includeItineraryPlaces,
          });
        }
      } catch (err: any) {
        console.error('[Explore Places API]', {
          path: '/api/trips/[tripId]/explore/places',
          method: 'GET',
          tripId,
          profileId,
          error: err?.message || 'Error parsing itinerary',
          errorCode: err?.code,
          tripSegmentId,
          context: 'parsing_itinerary',
        });
      }
    }

    // Combine excluded place IDs
    // Always exclude swiped places, but conditionally exclude itinerary places
    const excludedPlaceIds: string[] = [
      ...(session?.liked_place_ids || []),
      ...(session?.discarded_place_ids || []),
      ...(includeItineraryPlaces ? [] : alreadyPlannedPlaceIds),
    ];
    
    // DEV-only logging
    if (process.env.NODE_ENV === 'development') {
      console.debug('[Explore Places API] excluded place IDs', {
        tripId,
        tripSegmentId,
        itineraryPlaceIdsCount: alreadyPlannedPlaceIds.length,
        likedPlaceIdsCount: session?.liked_place_ids?.length || 0,
        discardedPlaceIdsCount: session?.discarded_place_ids?.length || 0,
        totalExcludedCount: excludedPlaceIds.length,
        includeItineraryPlaces,
      });
    }

    // Get query parameters for filters
    const neighborhood = url.searchParams.get('neighborhood') || undefined;
    const category = url.searchParams.get('category') || undefined;
    const timeOfDayParam = url.searchParams.get('timeOfDay') || url.searchParams.get('time_of_day');
    const timeOfDay: 'morning' | 'afternoon' | 'evening' | undefined = 
      timeOfDayParam && ['morning', 'afternoon', 'evening'].includes(timeOfDayParam)
        ? (timeOfDayParam as 'morning' | 'afternoon' | 'evening')
        : undefined;
    const dayId = url.searchParams.get('day_id') || undefined;
    const budget = url.searchParams.get('budget') ? parseInt(url.searchParams.get('budget')!, 10) : undefined;
    const maxDistance = url.searchParams.get('maxDistance') ? parseInt(url.searchParams.get('maxDistance')!, 10) : undefined;
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    // Check trip Pro status (account Pro OR trip Pro) for Pro-only filters
    // Note: getTripProStatus expects clerkUserId
    let isProForThisTrip = false;
    try {
      const { getTripProStatus } = await import('@/lib/supabase/pro-status');
      const authResult = await getProfileId(supabase);
      const proStatus = await getTripProStatus(supabase, authResult.clerkUserId, tripId);
      isProForThisTrip = proStatus.isProForThisTrip;
    } catch (proStatusError: any) {
      console.error('[Explore Places API]', {
        path: '/api/trips/[tripId]/explore/places',
        method: 'GET',
        tripId,
        profileId,
        error: proStatusError?.message || 'Failed to get trip pro status',
        errorCode: proStatusError?.code,
        tripSegmentId,
        context: 'pro_status_check',
      });
      // Continue with default isProForThisTrip = false
    }

    // Server-side enforcement: Pro filters are only available to Pro users (account or trip)
    // If Free user tries to use Pro filters, downgrade them (ignore) for better UX
    if (!isProForThisTrip && (budget !== undefined || maxDistance !== undefined)) {
      // Downgrade filters (ignore them) - better UX than error
    }

    // Only apply Pro filters if user has Pro for this trip (server-side enforcement)
    const effectiveBudget = isProForThisTrip ? budget : undefined;
    const effectiveMaxDistance = isProForThisTrip ? maxDistance : undefined;

    // Get excluded place IDs from query params (if passed from client)
    const excludePlaceIdsFromParams = url.searchParams.getAll('excludePlaceId');
    
    // Combine all excluded place IDs (from session, itinerary, and query params)
    const allExcludedIds = [
      ...excludedPlaceIds,
      ...excludePlaceIdsFromParams,
    ];
    const uniqueExcludedIds = Array.from(new Set(allExcludedIds));

    // If day_id is provided, get day's areaCluster from SmartItinerary
    let dayNeighborhood = neighborhood;
    if (dayId && !neighborhood) {
      const { data: itineraryData } = await supabase
        .from('smart_itineraries')
        .select('content')
        .eq('trip_id', tripId)
        .maybeSingle();

      if (itineraryDataTyped?.content) {
        try {
          const itinerary = itineraryDataTyped.content as SmartItinerary;
          const day = itinerary.days?.find(d => d.id === dayId);
          if (day) {
            // Get neighborhood from first place in first slot, or use day's areaCluster
            const firstPlace = day.slots?.[0]?.places?.[0];
            dayNeighborhood = firstPlace?.area || firstPlace?.neighborhood || day.areaCluster;
          }
        } catch (err: any) {
          console.error('[Explore Places API]', {
            path: '/api/trips/[tripId]/explore/places',
            method: 'GET',
            tripId,
            profileId,
            error: err?.message || 'Error parsing itinerary for day filter',
            errorCode: err?.code,
            tripSegmentId,
            dayId,
            context: 'day_filter_parsing',
          });
        }
      }
    }

    // Build filters
    const filters: ExploreFilters = {
      neighborhood: dayNeighborhood || neighborhood,
      category,
      timeOfDay,
      excludePlaceIds: uniqueExcludedIds.length > 0 ? uniqueExcludedIds : undefined,
      includeItineraryPlaces,
      budget: effectiveBudget,
      maxDistance: effectiveMaxDistance,
    };

    // Fetch places
    let places: any[] = [];
    let totalCount = 0;
    try {
      const result = await getPlacesToExplore(tripId, filters);
      places = result.places;
      totalCount = result.totalCount;
      
      // DEV-only logging
      if (process.env.NODE_ENV === 'development') {
        console.debug('[Explore Places API] places fetched', {
          tripId,
          tripSegmentId,
          placesCount: places.length,
          totalCount,
          includeItineraryPlaces,
          excludedPlaceIdsCount: uniqueExcludedIds.length,
        });
      }
    } catch (placesError: any) {
      console.error('[Explore Places API]', {
        path: '/api/trips/[tripId]/explore/places',
        method: 'GET',
        tripId,
        profileId,
        error: placesError?.message || 'Failed to fetch places',
        errorCode: placesError?.code,
        tripSegmentId,
        filters: {
          neighborhood,
          category,
          timeOfDay,
          budget: effectiveBudget,
          maxDistance: effectiveMaxDistance,
          includeItineraryPlaces,
          excludePlaceIdsCount: uniqueExcludedIds.length,
        },
        context: 'getPlacesToExplore',
      });
      throw placesError; // Re-throw to be caught by outer catch
    }

    // Apply pagination
    const paginatedPlaces = places.slice(offset, offset + limit);
    const hasMore = offset + limit < totalCount;

    // Log success
    console.log('[Explore Places API]', {
      route: 'explore/places',
      tripId,
      profileId,
      ok: true,
      status: 200,
    });

    return NextResponse.json({
      places: paginatedPlaces,
      hasMore,
      totalCount,
    });
  } catch (err: any) {
    console.error('[Explore Places API]', {
      route: 'explore/places',
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

