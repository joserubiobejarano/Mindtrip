import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProfileId } from '@/lib/auth/getProfileId';
import { findPhotoRefForActivity } from '@/lib/google/places-backfill';
import { getSmartItinerary, upsertSmartItinerary } from '@/lib/supabase/smart-itineraries-server';
import type { SmartItinerary, ItineraryPlace } from '@/types/itinerary';
import { isGooglePhotoReference } from '@/lib/placePhotos';
import { cachePlaceImageWithDetails, type ProviderAttempt, type ImageProvider } from '@/lib/images/cache-place-image';

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

    // Parse request body for dryRun and limit
    let dryRun = false;
    let limit: number | undefined;
    try {
      const body = await req.json().catch(() => ({}));
      dryRun = body.dryRun === true;
      limit = typeof body.limit === 'number' ? body.limit : undefined;
    } catch {
      // Body parsing failed, use defaults
    }

    if (isDev) {
      console.log('[backfill-images] Starting backfill:', {
        tripId,
        dryRun,
        limit: limit || MAX_UPDATES_PER_RUN,
      });
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
    const maxLimit = limit || MAX_UPDATES_PER_RUN;
    const hasMore = placesNeedingImages.length > maxLimit;
    const placesToProcess = placesNeedingImages.slice(0, maxLimit);
    const city = trip.destination_name || '';
    const country = trip.destination_country || '';
    
    // Detailed report items
    interface ReportItem {
      title: string;
      placeId?: string;
      hadPhotoRef: boolean;
      providerAttempts: ProviderAttempt[];
      chosenProvider: ImageProvider | null;
      chosenUrl: string | null;
    }
    
    const reportItems: ReportItem[] = [];

    for (const { place, dayIndex, slotIndex, placeIndex } of placesToProcess) {
      scanned++;

      // Extract inputs for logging
      const placeId = place.id;
      const placeLat = place.lat ?? trip.center_lat ?? undefined;
      const placeLng = place.lng ?? trip.center_lng ?? undefined;
      
      // Check if place already has photo_reference
      let hadPhotoRef = false;
      if (place.photo_reference && typeof place.photo_reference === 'string' && isGooglePhotoReference(place.photo_reference)) {
        hadPhotoRef = true;
      } else if (place.photos && Array.isArray(place.photos) && place.photos.length > 0) {
        const firstPhoto = place.photos[0];
        if (typeof firstPhoto === 'string' && isGooglePhotoReference(firstPhoto)) {
          hadPhotoRef = true;
        } else if (typeof firstPhoto === 'object' && firstPhoto !== null) {
          const ref = (firstPhoto as any).photo_reference || (firstPhoto as any).photoReference || (firstPhoto as any).ref;
          if (ref && typeof ref === 'string' && isGooglePhotoReference(ref)) {
            hadPhotoRef = true;
          }
        }
      }

      if (isDev) {
        console.log('[backfill-images] Processing place:', {
          title: place.name,
          city,
          country,
          placeId,
          hadPhotoRef,
          hasCoords: placeLat !== undefined && placeLng !== undefined,
          inputs: {
            place_id: placeId,
            photo_reference: hadPhotoRef ? 'present' : 'missing',
            lat: placeLat,
            lng: placeLng,
          },
        });
      }

      try {
        // Find photo reference using text search (if not already present)
        let photoRef: string | null = null;
        if (hadPhotoRef) {
          // Use existing photo_reference
          if (place.photo_reference && typeof place.photo_reference === 'string') {
            photoRef = place.photo_reference;
          } else if (place.photos && Array.isArray(place.photos) && place.photos.length > 0) {
            const firstPhoto = place.photos[0];
            if (typeof firstPhoto === 'string' && isGooglePhotoReference(firstPhoto)) {
              photoRef = firstPhoto;
            } else if (typeof firstPhoto === 'object' && firstPhoto !== null) {
              const ref = (firstPhoto as any).photo_reference || (firstPhoto as any).photoReference || (firstPhoto as any).ref;
              if (ref && typeof ref === 'string' && isGooglePhotoReference(ref)) {
                photoRef = ref;
              }
            }
          }
        } else {
          // Search for photo reference
          photoRef = await findPhotoRefForActivity({
            title: place.name,
            city,
            country: trip.destination_country || undefined,
            lat: trip.center_lat || undefined,
            lng: trip.center_lng || undefined,
          });
        }

        if (!photoRef) {
          notFound++;
          
          // Still try to cache without photoRef (will try Unsplash/Mapbox)
          const cacheResult = await cachePlaceImageWithDetails({
            tripId,
            placeId: place.id,
            title: place.name,
            city,
            country: trip.destination_country || undefined,
            photoRef: undefined,
            lat: placeLat,
            lng: placeLng,
          });

          const reportItem: ReportItem = {
            title: place.name,
            placeId,
            hadPhotoRef: false,
            providerAttempts: cacheResult.attempts,
            chosenProvider: cacheResult.providerUsed,
            chosenUrl: cacheResult.publicUrl,
          };
          
          if (reportItems.length < 20) {
            reportItems.push(reportItem);
          }

          if (isDev) {
            console.log('[backfill-images] Place processed (no photoRef found):', {
              title: place.name,
              attempts: cacheResult.attempts.map(a => ({
                provider: a.provider,
                ok: a.ok,
                reason: a.reason,
              })),
              result: cacheResult.publicUrl ? 'success' : 'failed',
            });
          }

          if (cacheResult.publicUrl && !dryRun) {
            // Update place in SmartItinerary JSON with cached URL
            const targetPlace = itinerary.days[dayIndex].slots[slotIndex].places[placeIndex];
            targetPlace.image_url = cacheResult.publicUrl;
            targetPlace.photos = [];
            updated++;
          }
          
          continue;
        }

        // Cache image to Supabase Storage using cachePlaceImageWithDetails
        const cacheResult = await cachePlaceImageWithDetails({
          tripId,
          placeId: place.id,
          title: place.name,
          city,
          country: trip.destination_country || undefined,
          photoRef,
          lat: placeLat,
          lng: placeLng,
        });

        const reportItem: ReportItem = {
          title: place.name,
          placeId,
          hadPhotoRef: true,
          providerAttempts: cacheResult.attempts,
          chosenProvider: cacheResult.providerUsed,
          chosenUrl: cacheResult.publicUrl,
        };

        if (reportItems.length < 20) {
          reportItems.push(reportItem);
        }

        if (!cacheResult.publicUrl) {
          if (isDev) {
            console.warn('[backfill-images] Failed to cache image for place:', {
              name: place.name,
              attempts: cacheResult.attempts.map(a => ({
                provider: a.provider,
                ok: a.ok,
                reason: a.reason,
              })),
            });
          }
          errors++;
          continue;
        }

        if (!dryRun) {
          // Update place in SmartItinerary JSON with cached URL
          const targetPlace = itinerary.days[dayIndex].slots[slotIndex].places[placeIndex];
          targetPlace.image_url = cacheResult.publicUrl;
          // Clear photos array since we now have a cached image_url
          targetPlace.photos = [];
        }

        updated++;

        // Dev-only logging
        if (isDev) {
          console.log('[backfill-images] Place processed:', {
            name: place.name,
            provider: cacheResult.providerUsed,
            image_url: cacheResult.publicUrl.substring(0, 80) + '...',
            dryRun,
          });
        }
      } catch (error: any) {
        console.error(`[backfill-images] Error processing place ${place.name}:`, error);
        errors++;
        
        // Add error item to report
        if (reportItems.length < 20) {
          reportItems.push({
            title: place.name,
            placeId,
            hadPhotoRef,
            providerAttempts: [],
            chosenProvider: null,
            chosenUrl: null,
          });
        }
      }
    }

    // Save updated SmartItinerary JSON back to DB (only if not dry run and we have updates)
    if (!dryRun && updated > 0) {
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
      items: reportItems,
    };

    // Dev-only debug log: full details
    if (isDev) {
      console.log('[backfill-images] Backfill complete:', {
        tripId,
        dryRun,
        scanned,
        updated,
        notFound,
        errors,
        hasMore,
        totalPlaces: placesNeedingImages.length,
        items: reportItems.map(item => ({
          title: item.title,
          hadPhotoRef: item.hadPhotoRef,
          attempts: item.providerAttempts.length,
          chosenProvider: item.chosenProvider,
          success: !!item.chosenUrl,
        })),
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

