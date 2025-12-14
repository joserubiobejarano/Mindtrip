import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import type { SmartItinerary } from '@/types/itinerary';
import { getPlaceDetails } from '@/lib/google/places-server';
import { GOOGLE_MAPS_API_KEY } from '@/lib/google/places-server';
import { isPastDay } from '@/lib/utils/date-helpers';
import { getDayActivityCount, MAX_ACTIVITIES_PER_DAY } from '@/lib/supabase/smart-itineraries';
import { getPlacesToExplore, type ExploreFilters } from '@/lib/google/explore-places';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string; activityId: string }> }
) {
  try {
    const { tripId, activityId } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!tripId || !activityId) {
      return NextResponse.json({ error: 'Missing trip id or activity id' }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify trip exists and user has access
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('id')
      .eq('id', tripId)
      .single();

    if (tripError || !trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Load existing SmartItinerary
    const { data: itineraryDataRaw, error: itineraryError } = await supabase
      .from('smart_itineraries')
      .select('content')
      .eq('trip_id', tripId)
      .maybeSingle();

    if (itineraryError) {
      console.error('Error loading itinerary:', itineraryError);
      return NextResponse.json({ error: 'Failed to load itinerary' }, { status: 500 });
    }

    type ItineraryQueryResult = {
      content: any
    }

    const itineraryData = itineraryDataRaw as ItineraryQueryResult | null;

    if (!itineraryData?.content) {
      return NextResponse.json({ error: 'No itinerary found' }, { status: 404 });
    }

    const itinerary = itineraryData.content as SmartItinerary;

    // Find the day and slot containing this place_id (activityId is the place_id)
    let targetDay: SmartItinerary['days'][0] | null = null;
    let targetSlot: SmartItinerary['days'][0]['slots'][0] | null = null;
    let targetPlace: SmartItinerary['days'][0]['slots'][0]['places'][0] | null = null;

    for (const day of itinerary.days || []) {
      for (const slot of day.slots || []) {
        const place = slot.places?.find(p => p.id === activityId);
        if (place) {
          targetDay = day;
          targetSlot = slot;
          targetPlace = place;
          break;
        }
      }
      if (targetDay) break;
    }

    if (!targetDay || !targetSlot || !targetPlace) {
      return NextResponse.json({ error: 'Activity not found in itinerary' }, { status: 404 });
    }

    // Check past-day lock
    if (isPastDay(targetDay.date)) {
      return NextResponse.json(
        {
          error: 'past_day_locked',
          message: 'You cannot modify days that are already in the past.',
        },
        { status: 400 }
      );
    }

    // Get existing place details to use for finding replacement
    const currentArea = targetPlace.area || targetPlace.neighborhood || targetDay.areaCluster;
    const currentCategory = targetPlace.tags?.[0] || null;
    
    // Get all place IDs already in this day to exclude them
    const placesInDay = new Set<string>();
    for (const slot of targetDay.slots) {
      for (const place of slot.places || []) {
        if (place.id) {
          placesInDay.add(place.id);
        }
      }
    }

    // Find replacement using explore places API
    if (!GOOGLE_MAPS_API_KEY) {
      return NextResponse.json({ error: 'Google Maps API key not configured' }, { status: 500 });
    }

    const filters: ExploreFilters = {
      neighborhood: currentArea || undefined,
      category: currentCategory || undefined,
      excludePlaceIds: Array.from(placesInDay), // Exclude current place and all others in this day
      includeItineraryPlaces: false,
    };

    // Fetch replacement places
    const { places: replacementPlaces } = await getPlacesToExplore(tripId, filters);

    // Filter out the current place if it somehow appears
    const filteredPlaces = replacementPlaces.filter(p => p.place_id !== activityId);

    if (filteredPlaces.length === 0) {
      return NextResponse.json(
        {
          error: 'no_replacement_found',
          message: 'We couldn\'t find a good alternative nearby. Try Explore to discover more places.',
        },
        { status: 404 }
      );
    }

    // Pick the first replacement place
    const replacementPlaceId = filteredPlaces[0].place_id;

    // Fetch detailed place information
    const placeDetails = await getPlaceDetails(replacementPlaceId);
    if (!placeDetails) {
      return NextResponse.json(
        {
          error: 'no_replacement_found',
          message: 'We couldn\'t find a good alternative nearby. Try Explore to discover more places.',
        },
        { status: 404 }
      );
    }

    // Get photos
    const photos: string[] = [];
    if (placeDetails.photos && placeDetails.photos.length > 0) {
      for (let i = 0; i < Math.min(3, placeDetails.photos.length); i++) {
        const photo = placeDetails.photos[i];
        if (photo?.photo_reference) {
          photos.push(
            `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${GOOGLE_MAPS_API_KEY}`
          );
        }
      }
    }

    // Extract area/neighborhood from address
    const address = placeDetails.formatted_address || '';
    const addressParts = address.split(',').map(p => p.trim());
    const area = addressParts.length > 1 ? addressParts[addressParts.length - 2] : addressParts[0] || 'Unknown';
    const neighborhood = addressParts.length > 2 ? addressParts[addressParts.length - 3] : null;

    // Generate description
    const description = placeDetails.editorial_summary?.overview || 
                      placeDetails.types?.[0]?.replace(/_/g, ' ') || 
                      'A great place to visit';

    // Extract tags from types
    const tags = (placeDetails.types || []).slice(0, 3).map(t => t.replace(/_/g, ' '));

    // Replace the place in the slot
    const placeIndex = targetSlot.places.findIndex(p => p.id === activityId);
    if (placeIndex !== -1) {
      targetSlot.places[placeIndex] = {
        id: replacementPlaceId,
        name: placeDetails.name || 'Unknown Place',
        description,
        area,
        neighborhood,
        photos,
        visited: false, // Reset visited status for new place
        tags,
      };
    } else {
      // Place not found in slot (shouldn't happen, but handle gracefully)
      return NextResponse.json({ error: 'Place not found in slot' }, { status: 404 });
    }

    // Save updated itinerary
    const { error: updateError } = await (supabase
      .from('smart_itineraries') as any)
      .update({
        content: itinerary,
        updated_at: new Date().toISOString(),
      })
      .eq('trip_id', tripId);

    if (updateError) {
      console.error('Error updating itinerary:', updateError);
      return NextResponse.json({ error: 'Failed to update itinerary' }, { status: 500 });
    }

    // Return the updated activity
    return NextResponse.json({
      success: true,
      activity: targetSlot.places[placeIndex],
    });
  } catch (err: any) {
    console.error('POST /replace activity error:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err?.message },
      { status: 500 }
    );
  }
}

