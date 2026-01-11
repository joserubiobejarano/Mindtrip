import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProfileId } from '@/lib/auth/getProfileId';
import type { SmartItinerary } from '@/types/itinerary';
import { getPlaceDetails } from '@/lib/google/places-server';
import { GOOGLE_MAPS_API_KEY } from '@/lib/google/places-server';
import { isPastDay } from '@/lib/utils/date-helpers';
import { getDayActivityCount, MAX_ACTIVITIES_PER_DAY, findAvailableSlot } from '@/lib/supabase/smart-itineraries';
import { clearLikedPlacesAfterRegeneration } from '@/lib/supabase/explore-integration';

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

    const body = await req.json();
    const { likedPlaceIds } = body;

    if (!likedPlaceIds || !Array.isArray(likedPlaceIds) || likedPlaceIds.length === 0) {
      return NextResponse.json({ error: 'Missing or invalid likedPlaceIds' }, { status: 400 });
    }

    const supabase = await createClient();

    // Get profile ID for authorization
    try {
      const authResult = await getProfileId(supabase);
      profileId = authResult.profileId;
    } catch (authError: any) {
      console.error('[Distribute Liked Places API]', {
        path: '/api/trips/[tripId]/activities/distribute-liked-places',
        method: 'POST',
        error: authError?.message || 'Failed to get profile',
        tripId,
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
      console.error('[Distribute Liked Places API]', {
        path: '/api/trips/[tripId]/activities/distribute-liked-places',
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

    // Check if user is owner or member
    const { data: member } = await supabase
      .from("trip_members")
      .select("id")
      .eq("trip_id", tripId)
      .eq("user_id", profileId)
      .single();

    if (trip.owner_id !== profileId && !member) {
      console.error('[Distribute Liked Places API]', {
        path: '/api/trips/[tripId]/activities/distribute-liked-places',
        method: 'POST',
        tripId,
        profileId,
        error: 'Forbidden: User does not have access to this trip',
        check_failed: trip.owner_id !== profileId ? 'not_owner' : 'not_member',
        trip_owner_id: trip.owner_id,
        is_member: !!member,
        context: 'authorization_check',
      });
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

    // Helper function to find the best slot across all days (least crowded)
    const findBestSlotAcrossDays = (): { day: typeof days[0]; slot: typeof days[0]['slots'][0]; slotLabel: string } | null => {
      const availableSlots: Array<{
        day: typeof days[0];
        slot: typeof days[0]['slots'][0];
        slotLabel: string;
        activityCount: number;
        dayActivityCount: number;
      }> = [];

      // Collect all available slots across all days
      for (const day of days) {
        // Skip past days
        if (isPastDay(day.date)) {
          continue;
        }

        // Check if day is at capacity
        const dayActivityCount = getDayActivityCount(itinerary, day.id);
        if (dayActivityCount >= MAX_ACTIVITIES_PER_DAY) {
          continue;
        }

        // Get all slots for this day
        if (!day.slots || day.slots.length === 0) {
          continue;
        }

        for (const slot of day.slots) {
          const slotLabel = slot.label.toLowerCase();
          if (!['morning', 'afternoon', 'evening'].includes(slotLabel)) {
            continue;
          }

          const slotActivityCount = slot.places?.length || 0;
          availableSlots.push({
            day,
            slot,
            slotLabel: slotLabel as 'morning' | 'afternoon' | 'evening',
            activityCount: slotActivityCount,
            dayActivityCount,
          });
        }
      }

      if (availableSlots.length === 0) {
        return null;
      }

      // Sort by: 1) day activity count (fewest first), 2) slot activity count (fewest first), 3) slot preference (morning > afternoon > evening)
      const slotOrder: Record<string, number> = { morning: 0, afternoon: 1, evening: 2 };
      availableSlots.sort((a, b) => {
        // First, sort by day activity count (fewest first)
        if (a.dayActivityCount !== b.dayActivityCount) {
          return a.dayActivityCount - b.dayActivityCount;
        }
        // Then, sort by slot activity count (fewest first)
        if (a.activityCount !== b.activityCount) {
          return a.activityCount - b.activityCount;
        }
        // Finally, sort by slot preference (morning > afternoon > evening)
        return (slotOrder[a.slotLabel] || 99) - (slotOrder[b.slotLabel] || 99);
      });

      const best = availableSlots[0];
      return {
        day: best.day,
        slot: best.slot,
        slotLabel: best.slotLabel,
      };
    };

    // Distribute each liked place across days
    for (const placeId of likedPlaceIds) {
      let placed = false;

      // Find the best slot across all days (least crowded)
      const bestSlot = findBestSlotAcrossDays();

      if (bestSlot) {
        // Check if place already exists in this slot (avoid duplicates)
        const placeExists = bestSlot.slot.places?.some(p => p.id === placeId);
        if (placeExists) {
          placed = true; // Already there, count as placed
          distributedCount++;
          continue; // Skip to next place
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

          // Add place to the selected slot
          bestSlot.slot.places = bestSlot.slot.places || [];
          bestSlot.slot.places.push({
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

    // Clear liked places after successful distribution
    // Only clear if we actually distributed at least one place
    if (distributedCount > 0 && profileId) {
      try {
        await clearLikedPlacesAfterRegeneration(tripId, profileId);
        console.log('[distribute-liked-places] cleared liked places after distribution');
      } catch (err) {
        console.error('[distribute-liked-places] error clearing liked places:', err);
        // Don't fail the request if clearing fails - places are already added to itinerary
      }
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

