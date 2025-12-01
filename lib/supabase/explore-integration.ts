import { createClient } from '@/lib/supabase/server';
import type { SmartItinerary } from '@/types/itinerary';

/**
 * Get liked places from explore session
 */
export async function getLikedPlacesForTrip(
  tripId: string,
  userId: string
): Promise<string[]> {
  const supabase = await createClient();

  const { data: session } = await supabase
    .from('explore_sessions')
    .select('liked_place_ids')
    .eq('trip_id', tripId)
    .eq('user_id', userId)
    .maybeSingle();

  return session?.liked_place_ids || [];
}

/**
 * Extract place IDs from SmartItinerary (by name matching for now)
 * Note: SmartItinerary doesn't store Google place_ids directly,
 * so this returns place names for matching
 */
export async function getPlacesInItinerary(
  tripId: string
): Promise<string[]> {
  const supabase = await createClient();

  const { data: itineraryData } = await supabase
    .from('smart_itineraries')
    .select('content')
    .eq('trip_id', tripId)
    .maybeSingle();

  if (!itineraryData?.content) {
    return [];
  }

  try {
    const itinerary = itineraryData.content as SmartItinerary;
    const placeNames: string[] = [];

    itinerary.days?.forEach((day) => {
      day.slots?.forEach((slot) => {
        slot.places?.forEach((place) => {
          if (place.name) {
            placeNames.push(place.name.toLowerCase().trim());
          }
        });
      });
    });

    return placeNames;
  } catch (err) {
    console.error('Error extracting places from itinerary:', err);
    return [];
  }
}

/**
 * Clear liked places after successful itinerary regeneration
 * Moves them to discarded to prevent showing them again
 */
export async function clearLikedPlacesAfterRegeneration(
  tripId: string,
  userId: string
): Promise<void> {
  const supabase = await createClient();

  // Get current session
  const { data: session } = await supabase
    .from('explore_sessions')
    .select('liked_place_ids, discarded_place_ids')
    .eq('trip_id', tripId)
    .eq('user_id', userId)
    .maybeSingle();

  if (!session) {
    return;
  }

  const likedPlaceIds = session.liked_place_ids || [];
  
  if (likedPlaceIds.length === 0) {
    return;
  }

  // Move liked places to discarded (to avoid showing them again)
  // and clear liked_place_ids
  const updatedDiscarded = [
    ...(session.discarded_place_ids || []),
    ...likedPlaceIds,
  ];

  const { error } = await supabase
    .from('explore_sessions')
    .update({
      liked_place_ids: [],
      discarded_place_ids: updatedDiscarded,
      updated_at: new Date().toISOString(),
    })
    .eq('trip_id', tripId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error clearing liked places:', error);
    throw new Error('Failed to clear liked places');
  }
}

