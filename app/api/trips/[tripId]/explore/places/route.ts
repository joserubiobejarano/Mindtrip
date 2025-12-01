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

    // Get explore session to exclude already swiped places
    const { data: session } = await supabase
      .from('explore_sessions')
      .select('liked_place_ids, discarded_place_ids')
      .eq('trip_id', tripId)
      .eq('user_id', userId)
      .maybeSingle();

    // Get query parameter for including itinerary places
    const url = new URL(req.url);
    const includeItineraryPlaces = url.searchParams.get('includeItineraryPlaces') === 'true';

    // Get places already in itinerary (from SmartItinerary)
    const { data: itineraryData } = await supabase
      .from('smart_itineraries')
      .select('content')
      .eq('trip_id', tripId)
      .maybeSingle();

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
    const timeOfDay = url.searchParams.get('timeOfDay') || url.searchParams.get('time_of_day') as
      | 'morning'
      | 'afternoon'
      | 'evening'
      | undefined;
    const dayId = url.searchParams.get('day_id') || undefined;
    const budget = url.searchParams.get('budget') ? parseInt(url.searchParams.get('budget')!, 10) : undefined;
    const maxDistance = url.searchParams.get('maxDistance') ? parseInt(url.searchParams.get('maxDistance')!, 10) : undefined;
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    // Check if user is Pro (for Pro-only filters)
    const { getUserSubscriptionStatus } = await import('@/lib/supabase/user-subscription');
    const { isPro } = await getUserSubscriptionStatus(userId);

    // Server-side enforcement: Pro filters are only available to Pro users
    // If Free user tries to use Pro filters, either downgrade or return error
    if (!isPro && (budget !== undefined || maxDistance !== undefined)) {
      // Option: downgrade filters (ignore them)
      // Alternative: return error - we'll use downgrade for better UX
      // return NextResponse.json({ error: 'PRO_FILTERS_FORBIDDEN' }, { status: 403 });
    }

    // Only apply Pro filters if user is Pro (server-side enforcement)
    const effectiveBudget = isPro ? budget : undefined;
    const effectiveMaxDistance = isPro ? maxDistance : undefined;

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

