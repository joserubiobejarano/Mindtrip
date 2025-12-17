import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProfileId } from '@/lib/auth/getProfileId';
import type { SmartItinerary } from '@/types/itinerary';
import { getPlaceDetails } from '@/lib/google/places-server';
import { GOOGLE_MAPS_API_KEY } from '@/lib/google/places-server';
import { isPastDay } from '@/lib/utils/date-helpers';
import { getDayActivityCount, MAX_ACTIVITIES_PER_DAY } from '@/lib/supabase/smart-itineraries';
import { getPlacesToExplore, type ExploreFilters } from '@/lib/google/explore-places';
import { getTripProStatus } from '@/lib/supabase/pro-status';
import { getUsageLimits } from '@/lib/supabase/user-subscription';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string; activityId: string }> }
) {
  let profileId: string | undefined;
  let tripId: string | undefined;
  let activityId: string | undefined;

  try {
    const resolvedParams = await params;
    tripId = resolvedParams.tripId;
    activityId = resolvedParams.activityId;

    if (!tripId || !activityId) {
      return NextResponse.json({ error: 'Missing trip id or activity id' }, { status: 400 });
    }

    const supabase = await createClient();

    // Get profile ID for authorization
    try {
      const authResult = await getProfileId(supabase);
      profileId = authResult.profileId;
      console.log('[activities]', { route: 'replace', tripId, activityId, profileId, status: 'start' });
    } catch (authError: any) {
      console.error('[activities]', {
        route: 'replace',
        tripId,
        activityId,
        profileId: 'unknown',
        status: 'unauthorized',
        error: authError?.message || 'Failed to get profile',
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
      console.error('[Replace Activity API]', {
        path: '/api/trips/[tripId]/activities/[activityId]/replace',
        method: 'POST',
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

    // Get trip_members record (for owner, we'll create/update it if needed)
    let { data: member, error: memberError } = await supabase
      .from("trip_members")
      .select("id, swipe_count, change_count, search_add_count")
      .eq("trip_id", tripId)
      .eq("user_id", profileId)
      .maybeSingle();

    // If user is owner but not in trip_members, we'll handle it later
    // For now, check access
    if (trip.owner_id !== profileId && !member && memberError?.code !== 'PGRST116') {
      console.error('[activities]', {
        route: 'replace',
        tripId,
        activityId,
        profileId,
        status: 'unauthorized',
        error: 'Forbidden: User does not have access to this trip',
        check_failed: trip.owner_id !== profileId ? 'not_owner' : 'not_member',
        trip_owner_id: trip.owner_id,
        is_member: !!member,
      });
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // If owner is not in trip_members, create a record for them
    if (trip.owner_id === profileId && !member) {
      const { data: newMember, error: createMemberError } = await supabase
        .from("trip_members")
        .insert({
          trip_id: tripId,
          user_id: profileId,
          role: 'owner',
          swipe_count: 0,
          change_count: 0,
          search_add_count: 0,
        })
        .select("id, swipe_count, change_count, search_add_count")
        .single();
      
      if (createMemberError || !newMember) {
        console.error('[Replace Activity API] Failed to create trip_members record for owner', createMemberError);
        return NextResponse.json({ 
          error: "Internal server error",
          ok: false,
          status: 500,
        }, { status: 500 });
      }
      member = newMember;
    }

    // Get trip Pro status and check change_count limit
    let isProForThisTrip = false;
    try {
      const authResult = await getProfileId(supabase);
      const proStatus = await getTripProStatus(supabase, authResult.clerkUserId, tripId);
      isProForThisTrip = proStatus.isProForThisTrip;
    } catch (proStatusError: any) {
      console.error('[Replace Activity API] Failed to get trip pro status', proStatusError);
      // Continue with default isProForThisTrip = false
    }

    // Get usage limits based on Pro status
    const usageLimits = getUsageLimits(isProForThisTrip);
    const changeLimit = usageLimits.change.limit;
    const changeCount = member?.change_count ?? 0;

    // Check limit before allowing change
    if (changeCount >= changeLimit) {
      return NextResponse.json({
        error: 'LIMIT_REACHED',
        used: changeCount,
        limit: changeLimit,
        action: 'change',
        message: isProForThisTrip
          ? "You've reached the change limit for this trip. Try saving your favorites or adjusting your filters."
          : "You've reached the change limit for this trip. Unlock Kruno Pro or this trip to see more places.",
      }, { status: 403 });
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

    // Increment change_count before saving
    const newChangeCount = changeCount + 1;
    const { error: updateMemberError } = await supabase
      .from('trip_members')
      .update({ change_count: newChangeCount })
      .eq('trip_id', tripId)
      .eq('user_id', profileId);

    if (updateMemberError) {
      console.error('[Replace Activity API] Failed to update trip_members change_count', updateMemberError);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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

