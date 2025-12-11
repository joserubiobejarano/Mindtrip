import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { getPlacesToExplore, type ExploreFilters } from '@/lib/google/explore-places';
import type { SmartItinerary } from '@/types/itinerary';

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

    // Get URL for query parameters
    const url = new URL(req.url);

    // Get trip_segment_id from query params (optional)
    const tripSegmentId = url.searchParams.get('trip_segment_id') || null;

    // Get explore session to exclude already swiped places (segment-scoped if trip_segment_id provided)
    const segmentIdForQuery = tripSegmentId || '00000000-0000-0000-0000-000000000000';
    const { data: session } = await supabase
      .from('explore_sessions')
      .select('liked_place_ids, discarded_place_ids')
      .eq('trip_id', tripId)
      .eq('user_id', userId)
      .eq('trip_segment_id', segmentIdForQuery)
      .maybeSingle();

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
    if (itineraryData?.content && !includeItineraryPlaces) {
      try {
        const itinerary = itineraryData.content as SmartItinerary;
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
      } catch (err) {
        console.error('Error parsing itinerary:', err);
      }
    }

    // Combine excluded place IDs
    // Always exclude swiped places, but conditionally exclude itinerary places
    const excludedPlaceIds: string[] = [
      ...(session?.liked_place_ids || []),
      ...(session?.discarded_place_ids || []),
      ...(includeItineraryPlaces ? [] : alreadyPlannedPlaceIds),
    ];

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
    const { getTripProStatus } = await import('@/lib/supabase/pro-status');
    const { isProForThisTrip } = await getTripProStatus(supabase, userId, tripId);

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

      if (itineraryData?.content) {
        try {
          const itinerary = itineraryData.content as SmartItinerary;
          const day = itinerary.days?.find(d => d.id === dayId);
          if (day) {
            // Get neighborhood from first place in first slot, or use day's areaCluster
            const firstPlace = day.slots?.[0]?.places?.[0];
            dayNeighborhood = firstPlace?.area || firstPlace?.neighborhood || day.areaCluster;
          }
        } catch (err) {
          console.error('Error parsing itinerary for day filter:', err);
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
    const { places, totalCount } = await getPlacesToExplore(tripId, filters);

    // Apply pagination
    const paginatedPlaces = places.slice(offset, offset + limit);
    const hasMore = offset + limit < totalCount;

    return NextResponse.json({
      places: paginatedPlaces,
      hasMore,
      totalCount,
    });
  } catch (err: any) {
    console.error('GET /explore/places error:', err);
    return NextResponse.json(
      {
        error: 'Failed to fetch places',
        details: err?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

