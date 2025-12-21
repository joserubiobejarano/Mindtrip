import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProfileId } from '@/lib/auth/getProfileId';
import type { SmartItinerary } from '@/types/itinerary';
import { getPlaceDetails } from '@/lib/google/places-server';
import { GOOGLE_MAPS_API_KEY } from '@/lib/google/places-server';
import { isPastDay } from '@/lib/utils/date-helpers';
import { getDayActivityCount, MAX_ACTIVITIES_PER_DAY } from '@/lib/supabase/smart-itineraries';
import { getTripProStatus } from '@/lib/supabase/pro-status';
import { getUsageLimits } from '@/lib/supabase/user-subscription';
import { cachePlaceImage } from '@/lib/images/cache-place-image';
import type { ExplorePlace } from '@/lib/google/explore-places';

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

    type MemberQueryResult = {
      id: string;
      swipe_count: number;
      change_count: number;
      search_add_count: number;
    };

    let memberTyped = member as MemberQueryResult | null;

    // If user is owner but not in trip_members, we'll handle it later
    // For now, check access
    if (trip.owner_id !== profileId && !memberTyped && memberError?.code !== 'PGRST116') {
      console.error('[activities]', {
        route: 'replace',
        tripId,
        activityId,
        profileId,
        status: 'unauthorized',
        error: 'Forbidden: User does not have access to this trip',
        check_failed: trip.owner_id !== profileId ? 'not_owner' : 'not_member',
        trip_owner_id: trip.owner_id,
        is_member: !!memberTyped,
      });
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // If owner is not in trip_members, create a record for them
    if (trip.owner_id === profileId && !memberTyped) {
      const { data: newMember, error: createMemberError } = await (supabase
        .from("trip_members") as any)
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
      memberTyped = newMember as MemberQueryResult;
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
    const changeCount = memberTyped?.change_count ?? 0;

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

    // Get request body - expect { place: ExplorePlace } payload
    const body = await req.json();
    const { place: placePayload } = body;

    if (!placePayload || !placePayload.place_id) {
      return NextResponse.json({ error: 'Missing place payload' }, { status: 400 });
    }

    const newPlaceId = placePayload.place_id;

    // Check for duplicates: if new place_id already exists in itinerary (any day), return 409
    for (const day of itinerary.days || []) {
      for (const slot of day.slots || []) {
        for (const place of slot.places || []) {
          if (place.id === newPlaceId) {
            return NextResponse.json(
              {
                error: 'duplicate_place',
                message: 'Already in itinerary',
              },
              { status: 409 }
            );
          }
        }
      }
    }

    // Find the index of the activity to replace (preserve position)
    const placeIndex = targetSlot.places.findIndex(p => p.id === activityId);
    if (placeIndex === -1) {
      return NextResponse.json({ error: 'Activity not found in slot' }, { status: 404 });
    }

    // Fetch place details if payload is incomplete (only has place_id)
    let placeDetails: any = null;
    if (!placePayload.name || !placePayload.address) {
      if (!GOOGLE_MAPS_API_KEY) {
        return NextResponse.json({ error: 'Google Maps API key not configured' }, { status: 500 });
      }

      try {
        placeDetails = await getPlaceDetails(newPlaceId);
        if (!placeDetails) {
          return NextResponse.json({ error: 'Place not found' }, { status: 404 });
        }
      } catch (error) {
        console.error(`[replace-activity] Error fetching place details for ${newPlaceId}:`, error);
        return NextResponse.json({ error: 'Failed to fetch place details' }, { status: 500 });
      }
    }

    // Use place details or payload for place information
    const placeName = placePayload.name || placeDetails?.name || 'Unknown Place';
    const placeAddress = placePayload.address || placeDetails?.formatted_address || '';
    const placeTypes = placePayload.types || placeDetails?.types || [];

    // Extract area/neighborhood from place payload, placeDetails, or address
    let area: string;
    let neighborhood: string | null = null;
    
    if (placePayload.neighborhood) {
      area = placePayload.neighborhood;
      neighborhood = placePayload.district || null;
    } else if (placeDetails?.formatted_address || placeAddress) {
      const addressParts = (placeDetails?.formatted_address || placeAddress).split(',').map((p: string) => p.trim());
      area = addressParts.length > 1 ? addressParts[addressParts.length - 2] : addressParts[0] || 'Unknown';
      neighborhood = addressParts.length > 2 ? addressParts[addressParts.length - 3] : null;
    } else {
      area = 'Unknown';
    }

    // Generate description from place payload, placeDetails, or use default
    const description = placePayload.description || 
                      placeDetails?.editorial_summary?.overview ||
                      (placeTypes.length > 0 ? placeTypes[0].replace(/_/g, ' ') : null) ||
                      'A great place to visit';

    // Extract tags from place payload types or placeDetails types
    const tags = placeTypes.length > 0 ?
      (Array.isArray(placeTypes) ? placeTypes.slice(0, 3).map((t: string) => t.replace(/_/g, ' ')) : []) : 
      [];

    // If place payload has image_url, use it; otherwise fetch and cache
    let imageUrl: string | null = null;
    if (placePayload.image_url) {
      imageUrl = placePayload.image_url;
    } else {
      // Extract photo reference from placeDetails
      let photoRef: string | null = null;
      if (placeDetails?.photos && placeDetails.photos.length > 0) {
        photoRef = placeDetails.photos[0]?.photo_reference || null;
      } else if (placePayload.photo_reference) {
        photoRef = placePayload.photo_reference;
      }

      // Extract coordinates
      const lat = placeDetails?.geometry?.location?.lat || placePayload.lat;
      const lng = placeDetails?.geometry?.location?.lng || placePayload.lng;

      // Extract country for image caching
      const addressParts = (placeDetails?.formatted_address || placeAddress).split(',').map((p: string) => p.trim());
      const country = addressParts.length > 0 ? addressParts[addressParts.length - 1] : undefined;

      // Cache image
      if (photoRef || (lat !== undefined && lng !== undefined)) {
        try {
          imageUrl = await cachePlaceImage({
            tripId,
            placeId: newPlaceId,
            title: placeName,
            city: area,
            country,
            photoRef: photoRef || undefined,
            lat,
            lng,
          });
        } catch (cacheError) {
          console.error(`[replace-activity] Error caching image for place ${newPlaceId}:`, cacheError);
          // Continue without image - not a fatal error
        }
      }
    }

    // Fallback: if still no image_url and placeDetails has photos, use photo proxy URL
    let fallbackPhotos: string[] = [];
    if (!imageUrl && placeDetails?.photos && placeDetails.photos.length > 0) {
      const photoRef = placeDetails.photos[0]?.photo_reference;
      if (photoRef && GOOGLE_MAPS_API_KEY) {
        // Use proxy URL as last resort
        fallbackPhotos = [`/api/places/photo?ref=${encodeURIComponent(photoRef)}&maxwidth=800`];
      }
    }

    // Replace the place in the slot at the same index (preserve position)
    const newPlace: any = {
      id: newPlaceId,
      name: placeName,
      description,
      area,
      neighborhood,
      photos: fallbackPhotos, // Empty array or proxy URL fallback
      visited: false, // Reset visited status for new place
      tags,
      place_id: newPlaceId, // Store place_id for reference
    };

    // Set image_url if we have one (preferred over photos)
    if (imageUrl) {
      newPlace.image_url = imageUrl;
      newPlace.photos = []; // Clear photos array when using image_url
    }

    targetSlot.places[placeIndex] = newPlace;

    // Increment change_count before saving
    const newChangeCount = changeCount + 1;
    const { error: updateMemberError } = await (supabase
      .from('trip_members') as any)
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

    // DEV logging
    if (process.env.NODE_ENV === 'development') {
      console.debug('[ReplaceMode] replacing activity', {
        tripId,
        activityId,
        newPlaceId,
        newPlaceName: placePayload.name,
        dayId: targetDay.id,
        slot: targetSlot.label,
        position: placeIndex,
      });
    }

    // Return the updated activity
    return NextResponse.json({
      success: true,
      activity: targetSlot.places[placeIndex],
      day: targetDay,
    });
  } catch (err: any) {
    console.error('POST /replace activity error:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err?.message },
      { status: 500 }
    );
  }
}

