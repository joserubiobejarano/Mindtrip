import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProfileId } from '@/lib/auth/getProfileId';
import { getPlaceDetails } from '@/lib/google/places-server';
import { GOOGLE_MAPS_API_KEY } from '@/lib/google/places-server';
import type { SmartItinerary } from '@/types/itinerary';
import { isPastDay } from '@/lib/utils/date-helpers';
import { getDayActivityCount, MAX_ACTIVITIES_PER_DAY } from '@/lib/supabase/smart-itineraries';
import { getTripProStatus } from '@/lib/supabase/pro-status';
import { getUsageLimits } from '@/lib/supabase/user-subscription';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string; dayId: string }> }
) {
  let profileId: string | undefined;
  let tripId: string | undefined;
  let dayId: string | undefined;
  
  try {
    const resolvedParams = await params;
    tripId = resolvedParams.tripId;
    dayId = resolvedParams.dayId;

    if (!tripId || !dayId) {
      return NextResponse.json({ error: 'Missing trip id or day id' }, { status: 400 });
    }

    const body = await req.json();
    const { place_ids, slot } = body;

    if (!place_ids || !Array.isArray(place_ids) || place_ids.length === 0) {
      return NextResponse.json({ error: 'Missing or invalid place_ids' }, { status: 400 });
    }

    if (!slot || !['morning', 'afternoon', 'evening'].includes(slot)) {
      return NextResponse.json({ error: 'Missing or invalid slot (must be morning, afternoon, or evening)' }, { status: 400 });
    }

    const supabase = await createClient();

    // Get profile ID for authorization
    try {
      const authResult = await getProfileId(supabase);
      profileId = authResult.profileId;
      console.log('[activities]', { route: 'bulk-add-from-swipes', tripId, dayId, profileId, status: 'start' });
    } catch (authError: any) {
      console.error('[activities]', {
        route: 'bulk-add-from-swipes',
        tripId,
        dayId,
        profileId: 'unknown',
        status: 'unauthorized',
        error: authError?.message || 'Failed to get profile',
      });
      return NextResponse.json(
        { error: authError?.message || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify trip exists and user has access (owner or member)
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('id, owner_id')
      .eq('id', tripId)
      .single();

    if (tripError || !trip) {
      console.error('[Bulk Add From Swipes API]', {
        path: '/api/trips/[tripId]/days/[dayId]/activities/bulk-add-from-swipes',
        method: 'POST',
        tripId,
        profileId,
        error: tripError?.message || 'Trip not found',
        errorCode: tripError?.code,
        context: 'trip_lookup',
      });
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    type TripQueryResult = {
      id: string;
      owner_id: string;
    };

    const tripTyped = trip as TripQueryResult;

    // Get trip_members record (for owner, we'll create/update it if needed)
    let { data: member, error: memberError } = await supabase
      .from('trip_members')
      .select('id, swipe_count, change_count, search_add_count')
      .eq('trip_id', tripId)
      .eq('user_id', profileId)
      .maybeSingle();

    // If user is owner but not in trip_members, we'll handle it later
    // For now, check access
    if (tripTyped.owner_id !== profileId && !member && memberError?.code !== 'PGRST116') {
      console.error('[activities]', {
        route: 'bulk-add-from-swipes',
        tripId,
        dayId,
        profileId,
        status: 'unauthorized',
        error: 'Forbidden: User does not have access to this trip',
        check_failed: tripTyped.owner_id !== profileId ? 'not_owner' : 'not_member',
        trip_owner_id: tripTyped.owner_id,
        is_member: !!member,
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // If owner is not in trip_members, create a record for them
    if (tripTyped.owner_id === profileId && !member) {
      const { data: newMember, error: createMemberError } = await supabase
        .from('trip_members')
        .insert({
          trip_id: tripId,
          user_id: profileId,
          role: 'owner',
          swipe_count: 0,
          change_count: 0,
          search_add_count: 0,
        })
        .select('id, swipe_count, change_count, search_add_count')
        .single();
      
      if (createMemberError || !newMember) {
        console.error('[Bulk Add From Swipes API] Failed to create trip_members record for owner', createMemberError);
        return NextResponse.json({ 
          error: 'Internal server error',
          ok: false,
          status: 500,
        }, { status: 500 });
      }
      member = newMember;
    }

    // Get trip Pro status and check search_add_count limit
    let isProForThisTrip = false;
    try {
      const authResult = await getProfileId(supabase);
      const proStatus = await getTripProStatus(supabase, authResult.clerkUserId, tripId);
      isProForThisTrip = proStatus.isProForThisTrip;
    } catch (proStatusError: any) {
      console.error('[Bulk Add From Swipes API] Failed to get trip pro status', proStatusError);
      // Continue with default isProForThisTrip = false
    }

    // Get usage limits based on Pro status
    const usageLimits = getUsageLimits(isProForThisTrip);
    const searchAddLimit = usageLimits.searchAdd.limit;
    const searchAddCount = member?.search_add_count ?? 0;

    // Count how many new places will be added (excluding duplicates)
    const existingPlaceIds = new Set(targetSlot.places.map(p => p.id));
    const newPlacesCount = place_ids.filter(id => !existingPlaceIds.has(id)).length;

    // Check limit before allowing add
    if (searchAddCount + newPlacesCount > searchAddLimit) {
      return NextResponse.json({
        error: 'LIMIT_REACHED',
        used: searchAddCount,
        limit: searchAddLimit,
        action: 'searchAdd',
        message: isProForThisTrip
          ? "You've reached the search-add limit for this trip. Try saving your favorites or adjusting your filters."
          : "You've reached the search-add limit for this trip. Unlock Kruno Pro or this trip to see more places.",
      }, { status: 403 });
    }

    // Load existing SmartItinerary
    const { data: itineraryDataRaw, error: itineraryError } = await supabase
      .from('smart_itineraries')
      .select('content')
      .eq('trip_id', tripId)
      .maybeSingle();

    if (itineraryError) {
      console.error('[Bulk Add From Swipes API]', {
        path: '/api/trips/[tripId]/days/[dayId]/activities/bulk-add-from-swipes',
        method: 'POST',
        tripId,
        profileId,
        error: itineraryError.message || 'Failed to load itinerary',
        errorCode: itineraryError.code,
        context: 'load_itinerary',
      });
      return NextResponse.json({ error: 'Failed to load itinerary' }, { status: 500 });
    }

    type ItineraryQueryResult = {
      content: any
    }

    const itineraryData = itineraryDataRaw as ItineraryQueryResult | null;

    if (!itineraryData?.content) {
      return NextResponse.json({ error: 'No itinerary found. Please generate an itinerary first.' }, { status: 404 });
    }

    const itinerary = itineraryData.content as SmartItinerary;

    // Find the day
    const day = itinerary.days?.find(d => d.id === dayId);
    if (!day) {
      return NextResponse.json({ error: 'Day not found in itinerary' }, { status: 404 });
    }

    // Check if day is in the past (past-day lock)
    if (isPastDay(day.date)) {
      return NextResponse.json(
        {
          error: 'past_day_locked',
          message: 'You cannot modify days that are already in the past.',
        },
        { status: 400 }
      );
    }

    // Find the slot first (needed for activity limit check and duplicate detection)
    const slotIndex = day.slots.findIndex(s => s.label.toLowerCase() === slot);
    if (slotIndex === -1) {
      return NextResponse.json({ error: 'Slot not found in day' }, { status: 404 });
    }

    const targetSlot = day.slots[slotIndex];

    // Check activity limit before adding
    const currentActivityCount = getDayActivityCount(itinerary, dayId);
    const placesToAdd = place_ids.filter(id => !targetSlot.places.some(p => p.id === id)).length;
    
    if (currentActivityCount + placesToAdd > MAX_ACTIVITIES_PER_DAY) {
      return NextResponse.json(
        {
          error: 'day_activity_limit',
          maxActivitiesPerDay: MAX_ACTIVITIES_PER_DAY,
          message: 'We recommend planning no more than 12 activities per day so you have time to enjoy each place.',
        },
        { status: 400 }
      );
    }

    // Get existing place IDs in this slot to avoid duplicates (idempotency check)
    const existingPlaceIds = new Set(targetSlot.places.map(p => p.id));

    // Track which places were added vs skipped
    const addedPlaceIds: string[] = [];
    const skippedPlaceIds: string[] = [];

    // Fetch place details from Google Places API
    const newPlaces: Array<{
      id: string;
      name: string;
      description: string;
      area: string;
      neighborhood: string | null;
      photos: string[];
      visited: boolean;
      tags: string[];
    }> = [];

    if (!GOOGLE_MAPS_API_KEY) {
      return NextResponse.json({ error: 'Google Maps API key not configured' }, { status: 500 });
    }

    for (const placeId of place_ids) {
      // Skip if already exists (idempotency: same place_id for same dayId + slot)
      if (existingPlaceIds.has(placeId)) {
        skippedPlaceIds.push(placeId);
        continue;
      }

      try {
        const placeDetails = await getPlaceDetails(placeId);
        if (placeDetails) {
          // Get photos
          const photos: string[] = [];
          if (placeDetails.photos && placeDetails.photos.length > 0) {
            // Use first 3 photos
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

          // Generate description from place details
          const description = placeDetails.editorial_summary?.overview || 
                            placeDetails.types?.[0]?.replace(/_/g, ' ') || 
                            'A great place to visit';

          // Extract tags from types
          const tags = (placeDetails.types || []).slice(0, 3).map(t => t.replace(/_/g, ' '));

          newPlaces.push({
            id: placeId,
            name: placeDetails.name || 'Unknown Place',
            description,
            area,
            neighborhood,
            photos,
            visited: false,
            tags,
          });
          addedPlaceIds.push(placeId);
        }

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error fetching place ${placeId}:`, error);
        // Continue with other places even if one fails
        // Don't add to skippedPlaceIds - this is a failure, not a duplicate
      }
    }

    // Add new places to the slot (idempotent: duplicates already filtered)
    if (newPlaces.length > 0) {
      targetSlot.places = [...targetSlot.places, ...newPlaces];

      // Increment search_add_count before saving
      const newSearchAddCount = searchAddCount + newPlaces.length;
      const { error: updateMemberError } = await supabase
        .from('trip_members')
        .update({ search_add_count: newSearchAddCount })
        .eq('trip_id', tripId)
        .eq('user_id', profileId);

      if (updateMemberError) {
        console.error('[Bulk Add From Swipes API] Failed to update trip_members search_add_count', updateMemberError);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
      }

      // Update the itinerary in database
      const { error: updateError } = await (supabase
        .from('smart_itineraries') as any)
        .update({
          content: itinerary,
          updated_at: new Date().toISOString(),
        })
        .eq('trip_id', tripId);

      if (updateError) {
        console.error('[Bulk Add From Swipes API]', {
          path: '/api/trips/[tripId]/days/[dayId]/activities/bulk-add-from-swipes',
          method: 'POST',
          tripId,
          profileId,
          error: updateError.message || 'Failed to update itinerary',
          errorCode: updateError.code,
          context: 'update_itinerary',
        });
        return NextResponse.json({ error: 'Failed to update itinerary' }, { status: 500 });
      }
    }

    // Return proper response format
    return NextResponse.json({
      success: true,
      addedCount: addedPlaceIds.length,
      skippedCount: skippedPlaceIds.length,
      activities: newPlaces.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        area: p.area,
        neighborhood: p.neighborhood,
        photos: p.photos,
        visited: p.visited,
        tags: p.tags,
      })),
    });
  } catch (err: any) {
    console.error('[Bulk Add From Swipes API]', {
      path: '/api/trips/[tripId]/days/[dayId]/activities/bulk-add-from-swipes',
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

