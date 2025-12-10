import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import type { SmartItinerary } from '@/types/itinerary';
import { getPlaceDetails } from '@/lib/google/places-server';
import { GOOGLE_MAPS_API_KEY } from '@/lib/google/places-server';
import { isPastDay } from '@/lib/utils/date-helpers';
import { getDayActivityCount, MAX_ACTIVITIES_PER_DAY, findAvailableSlot } from '@/lib/supabase/smart-itineraries';

export async function POST(
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

    const body = await req.json();
    const { likedPlaceIds } = body;

    if (!likedPlaceIds || !Array.isArray(likedPlaceIds) || likedPlaceIds.length === 0) {
      return NextResponse.json({ error: 'Missing or invalid likedPlaceIds' }, { status: 400 });
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

    // Get all days, ordered chronologically (by date)
    const days = [...(itinerary.days || [])].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    if (days.length === 0) {
      return NextResponse.json({ error: 'No days found in itinerary' }, { status: 404 });
    }

    let distributedCount = 0;
    let addedToLastDayOnly = false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Distribute each liked place across days
    for (const placeId of likedPlaceIds) {
      let placed = false;

      // Try to find an available day (not past, not at capacity)
      for (const day of days) {
        // Skip past days
        if (isPastDay(day.date)) {
          continue;
        }

        // Check if day is at capacity
        const activityCount = getDayActivityCount(itinerary, day.id);
        if (activityCount >= MAX_ACTIVITIES_PER_DAY) {
          continue;
        }

        // Find an available slot in this day
        const availableSlot = findAvailableSlot(day);
        if (!availableSlot) {
          continue;
        }

        // Fetch place details
        if (!GOOGLE_MAPS_API_KEY) {
          return NextResponse.json({ error: 'Google Maps API key not configured' }, { status: 500 });
        }

        try {
          const placeDetails = await getPlaceDetails(placeId);
          if (!placeDetails) {
            console.error(`Failed to fetch place details for ${placeId}`);
            continue;
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

          // Generate description from place details
          const description = placeDetails.editorial_summary?.overview || 
                            placeDetails.types?.[0]?.replace(/_/g, ' ') || 
                            'A great place to visit';

          // Extract tags from types
          const tags = (placeDetails.types || []).slice(0, 3).map(t => t.replace(/_/g, ' '));

          // Find the slot in the day and add the place
          const slotIndex = day.slots.findIndex(s => s.label.toLowerCase() === availableSlot);
          if (slotIndex !== -1) {
            const slot = day.slots[slotIndex];
            
            // Check if place already exists in this slot (avoid duplicates)
            const placeExists = slot.places?.some(p => p.id === placeId);
            if (placeExists) {
              placed = true; // Already there, count as placed
              distributedCount++;
              break;
            }

            // Add place to slot
            slot.places = slot.places || [];
            slot.places.push({
              id: placeId,
              name: placeDetails.name || 'Unknown Place',
              description,
              area,
              neighborhood,
              photos,
              visited: false,
              tags,
            });

            placed = true;
            distributedCount++;
            break;
          }

          // Small delay to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Error fetching place ${placeId}:`, error);
          // Continue with next place even if one fails
        }
      }

      // If we couldn't place it in any available day, add to last day (even if at capacity)
      if (!placed && days.length > 0) {
        const lastDay = days[days.length - 1];
        
        // Only add to last day if it's not in the past
        if (!isPastDay(lastDay.date)) {
          try {
            const placeDetails = await getPlaceDetails(placeId);
            if (placeDetails) {
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

              const address = placeDetails.formatted_address || '';
              const addressParts = address.split(',').map(p => p.trim());
              const area = addressParts.length > 1 ? addressParts[addressParts.length - 2] : addressParts[0] || 'Unknown';
              const neighborhood = addressParts.length > 2 ? addressParts[addressParts.length - 3] : null;
              const description = placeDetails.editorial_summary?.overview || 
                                placeDetails.types?.[0]?.replace(/_/g, ' ') || 
                                'A great place to visit';
              const tags = (placeDetails.types || []).slice(0, 3).map(t => t.replace(/_/g, ' '));

              // Find slot with fewest activities (or use evening if all are equal)
              let targetSlot = lastDay.slots.find(s => s.label.toLowerCase() === 'evening');
              if (!targetSlot && lastDay.slots.length > 0) {
                targetSlot = lastDay.slots.reduce((min, slot) => {
                  const minCount = min.places?.length || 0;
                  const slotCount = slot.places?.length || 0;
                  return slotCount < minCount ? slot : min;
                });
              }

              if (targetSlot) {
                // Check if already exists
                const placeExists = targetSlot.places?.some(p => p.id === placeId);
                if (!placeExists) {
                  targetSlot.places = targetSlot.places || [];
                  targetSlot.places.push({
                    id: placeId,
                    name: placeDetails.name || 'Unknown Place',
                    description,
                    area,
                    neighborhood,
                    photos,
                    visited: false,
                    tags,
                  });
                  distributedCount++;
                  addedToLastDayOnly = true;
                } else {
                  distributedCount++; // Already exists
                }
              }

              await new Promise(resolve => setTimeout(resolve, 100));
            }
          } catch (error) {
            console.error(`Error fetching place ${placeId} for last day:`, error);
          }
        }
      }
    }

    // Save updated itinerary
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

    return NextResponse.json({
      success: true,
      distributed: distributedCount,
      addedToLastDayOnly,
    });
  } catch (err: any) {
    console.error('POST /distribute-liked-places error:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err?.message },
      { status: 500 }
    );
  }
}

