import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProfileId } from '@/lib/auth/getProfileId';
import { findPhotoRefForActivity } from '@/lib/google/places-backfill';
import { getSmartItinerary, upsertSmartItinerary } from '@/lib/supabase/smart-itineraries-server';
import type { SmartItinerary, ItineraryPlace } from '@/types/itinerary';
import { isGooglePhotoReference } from '@/lib/placePhotos';

export const dynamic = 'force-dynamic';

const isDev = process.env.NODE_ENV === 'development';
const MAX_UPDATES_PER_RUN = 20;

/**
 * Check if a place is missing an image (no image_url AND no valid photo_reference in photos[0])
 */
function isPlaceMissingImage(place: ItineraryPlace): boolean {
  // Check if image_url exists and is usable
  if (place.image_url && typeof place.image_url === 'string' && place.image_url.trim().length > 0) {
    return false;
  }

  // Check if photos[0] contains a valid photo_reference
  if (place.photos && Array.isArray(place.photos) && place.photos.length > 0) {
    const firstPhoto = place.photos[0];
    if (typeof firstPhoto === 'string' && isGooglePhotoReference(firstPhoto)) {
      return false;
    }
    // Also check if it's an object with photo_reference
    if (typeof firstPhoto === 'object' && firstPhoto !== null) {
      const ref = (firstPhoto as any).photo_reference || (firstPhoto as any).photoReference || (firstPhoto as any).ref;
      if (ref && typeof ref === 'string' && isGooglePhotoReference(ref)) {
        return false;
      }
    }
  }

  // Also check photo_reference field directly
  if (place.photo_reference && typeof place.photo_reference === 'string' && isGooglePhotoReference(place.photo_reference)) {
    return false;
  }

  return true;
}

export async function POST(
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
      return NextResponse.json(
        { error: authError?.message || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user has access to trip
    const { data: tripData, error: tripError } = await supabase
      .from('trips')
      .select('id, owner_id, destination_name, destination_country, center_lat, center_lng')
      .eq('id', tripId)
      .single();

    if (tripError || !tripData) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    type TripQueryResult = {
      id: string;
      owner_id: string;
      destination_name: string | null;
      destination_country: string | null;
      center_lat: number | null;
      center_lng: number | null;
    };

    const trip = tripData as TripQueryResult;

    // Check if user is owner or member
    const { data: member } = await supabase
      .from('trip_members')
      .select('id')
      .eq('trip_id', tripId)
      .eq('user_id', profileId)
      .single();

    if (trip.owner_id !== profileId && !member) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Load SmartItinerary JSON from DB
    const { data: itineraryData, error: itineraryError } = await getSmartItinerary(tripId);

    if (itineraryError || !itineraryData) {
      return NextResponse.json(
        { error: 'No itinerary found. Please generate an itinerary first.' },
        { status: 404 }
      );
    }

    const itinerary = itineraryData as SmartItinerary;

    if (!itinerary.days || !Array.isArray(itinerary.days)) {
      return NextResponse.json({
        scanned: 0,
        updated: 0,
        notFound: 0,
        errors: 0,
        hasMore: false,
        message: 'Invalid itinerary structure',
      });
    }

    // Collect all places missing images
    const placesNeedingImages: Array<{
      place: ItineraryPlace;
      dayIndex: number;
      slotIndex: number;
      placeIndex: number;
    }> = [];

    for (let dayIndex = 0; dayIndex < itinerary.days.length; dayIndex++) {
      const day = itinerary.days[dayIndex];
      if (!day.slots || !Array.isArray(day.slots)) continue;

      for (let slotIndex = 0; slotIndex < day.slots.length; slotIndex++) {
        const slot = day.slots[slotIndex];
        if (!slot.places || !Array.isArray(slot.places)) continue;

        for (let placeIndex = 0; placeIndex < slot.places.length; placeIndex++) {
          const place = slot.places[placeIndex];
          if (isPlaceMissingImage(place)) {
            placesNeedingImages.push({
              place,
              dayIndex,
              slotIndex,
              placeIndex,
            });
          }
        }
      }
    }

    if (placesNeedingImages.length === 0) {
      return NextResponse.json({
        scanned: 0,
        updated: 0,
        notFound: 0,
        errors: 0,
        hasMore: false,
        message: 'All places already have images',
      });
    }

    // Process places sequentially (to avoid rate limits)
    let scanned = 0;
    let updated = 0;
    let notFound = 0;
    let errors = 0;
    const hasMore = placesNeedingImages.length > MAX_UPDATES_PER_RUN;
    const placesToProcess = placesNeedingImages.slice(0, MAX_UPDATES_PER_RUN);
    const city = trip.destination_name || '';
    const updatedPlaces: Array<{ name: string; image_url: string }> = [];

    for (const { place, dayIndex, slotIndex, placeIndex } of placesToProcess) {
      scanned++;

      try {
        // Find photo reference using text search
        const photoRef = await findPhotoRefForActivity({
          title: place.name,
          city,
          country: trip.destination_country || undefined,
          lat: trip.center_lat || undefined,
          lng: trip.center_lng || undefined,
        });

        if (!photoRef) {
          notFound++;
          continue;
        }

        // Construct proxy URL (same format as Explore)
        const proxyUrl = `/api/places/photo?ref=${encodeURIComponent(photoRef)}&maxwidth=1000`;

        // Update place in SmartItinerary JSON
        const targetPlace = itinerary.days[dayIndex].slots[slotIndex].places[placeIndex];
        targetPlace.image_url = proxyUrl;
        // Set photos array with the photo URL
        targetPlace.photos = [proxyUrl];

        updated++;
        
        // Track updated places for dev logging
        if (updatedPlaces.length < 3) {
          updatedPlaces.push({
            name: place.name,
            image_url: proxyUrl,
          });
        }

        // Dev-only logging
        if (isDev) {
          console.debug('[backfill-images] Place updated:', {
            name: place.name,
            proxyUrl,
          });
        }
      } catch (error: any) {
        console.error(`[backfill-images] Error processing place ${place.name}:`, error);
        errors++;
      }
    }

    // Save updated SmartItinerary JSON back to DB
    if (updated > 0) {
      const { error: saveError } = await upsertSmartItinerary(tripId, itinerary);

      if (saveError) {
        console.error('[backfill-images] Error saving updated itinerary:', saveError);
        return NextResponse.json(
          { error: 'Failed to save updated itinerary' },
          { status: 500 }
        );
      }
    }

    const response = {
      scanned,
      updated,
      notFound,
      errors,
      hasMore,
    };

    // Dev-only debug log: summary + first 3 updated places
    if (isDev) {
      console.log('[backfill-images] Backfill complete:', {
        tripId,
        ...response,
        totalPlaces: placesNeedingImages.length,
        sampleUpdated: updatedPlaces,
      });
    }

    return NextResponse.json(response);
  } catch (err: any) {
    console.error('[backfill-images] Unexpected error:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

