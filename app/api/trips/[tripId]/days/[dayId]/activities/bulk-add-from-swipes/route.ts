import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { getPlaceDetails } from '@/lib/google/places-server';
import { GOOGLE_MAPS_API_KEY } from '@/lib/google/places-server';
import type { SmartItinerary } from '@/types/itinerary';
import { isPastDay } from '@/lib/utils/date-helpers';
import { getDayActivityCount, MAX_ACTIVITIES_PER_DAY } from '@/lib/supabase/smart-itineraries';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string; dayId: string }> }
) {
  try {
    const { tripId, dayId } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
    const { data: itineraryData, error: itineraryError } = await supabase
      .from('smart_itineraries')
      .select('content')
      .eq('trip_id', tripId)
      .maybeSingle();

    if (itineraryError) {
      console.error('Error loading itinerary:', itineraryError);
      return NextResponse.json({ error: 'Failed to load itinerary' }, { status: 500 });
    }

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

    // Find the slot
    const slotIndex = day.slots.findIndex(s => s.label.toLowerCase() === slot);
    if (slotIndex === -1) {
      return NextResponse.json({ error: 'Slot not found in day' }, { status: 404 });
    }

    const targetSlot = day.slots[slotIndex];

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

      // Update the itinerary in database
      const { error: updateError } = await supabase
        .from('smart_itineraries')
        .update({
          content: itinerary,
          updated_at: new Date().toISOString(),
        })
        .eq('trip_id', tripId);

      if (updateError) {
        console.error('Error updating itinerary:', updateError);
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
    console.error('POST /bulk-add-from-swipes error:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err?.message },
      { status: 500 }
    );
  }
}

