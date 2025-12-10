import { createClient } from '@/lib/supabase/server';
import type { SmartItinerary } from '@/types/itinerary';

/**
 * Maximum number of activities allowed per day (across all slots)
 */
export const MAX_ACTIVITIES_PER_DAY = 12;

/**
 * Get a smart itinerary for a trip (trip-level, not segment-specific)
 * Returns the content field from the smart_itineraries table
 */
export async function getSmartItinerary(
  tripId: string
): Promise<{ data: any | null; error: Error | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('smart_itineraries')
    .select('content')
    .eq('trip_id', tripId)
    .is('trip_segment_id', null)
    .maybeSingle();

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  return { data: data?.content || null, error: null };
}

/**
 * Upsert a smart itinerary for a trip
 * If trip_segment_id is provided, saves segment-specific itinerary
 * Otherwise, saves trip-level itinerary
 */
export async function upsertSmartItinerary(
  tripId: string,
  itinerary: any,
  trip_segment_id?: string | null
): Promise<{ error: Error | null }> {
  const supabase = await createClient();

  // Check if an itinerary already exists
  let query = supabase
    .from('smart_itineraries')
    .select('id')
    .eq('trip_id', tripId);

  if (trip_segment_id !== undefined && trip_segment_id !== null) {
    query = query.eq('trip_segment_id', trip_segment_id);
  } else {
    query = query.is('trip_segment_id', null);
  }

  const { data: existing } = await query.maybeSingle();

  const payload: {
    trip_id: string;
    content: any;
    trip_segment_id?: string | null;
  } = {
    trip_id: tripId,
    content: itinerary,
  };

  if (trip_segment_id !== undefined) {
    payload.trip_segment_id = trip_segment_id || null;
  }

  let error;
  if (existing) {
    // Update existing record
    const { error: updateError } = await supabase
      .from('smart_itineraries')
      .update({ content: itinerary })
      .eq('id', existing.id);
    error = updateError;
  } else {
    // Insert new record
    const { error: insertError } = await supabase
      .from('smart_itineraries')
      .insert(payload);
    error = insertError;
  }

  if (error) {
    return { error: new Error(error.message) };
  }

  return { error: null };
}

/**
 * Count the total number of activities (places) in a day across all slots
 */
export function getDayActivityCount(itinerary: SmartItinerary, dayId: string): number {
  const day = itinerary.days?.find(d => d.id === dayId);
  if (!day || !day.slots) {
    return 0;
  }

  // Count all places across all slots
  return day.slots.reduce((count, slot) => {
    return count + (slot.places?.length || 0);
  }, 0);
}

/**
 * Find an available slot in a day with the fewest activities
 * Prefers slots in order: morning → afternoon → evening
 */
export function findAvailableSlot(day: SmartItinerary['days'][0]): 'morning' | 'afternoon' | 'evening' | null {
  if (!day.slots || day.slots.length === 0) {
    return null;
  }

  // Sort slots by preference: morning, afternoon, evening
  const slotOrder: Array<'morning' | 'afternoon' | 'evening'> = ['morning', 'afternoon', 'evening'];
  const sortedSlots = [...day.slots].sort((a, b) => {
    const aIndex = slotOrder.indexOf(a.label.toLowerCase() as 'morning' | 'afternoon' | 'evening');
    const bIndex = slotOrder.indexOf(b.label.toLowerCase() as 'morning' | 'afternoon' | 'evening');
    // Handle unknown slots (put them at the end)
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  // Find the slot with the fewest activities
  let minCount = Infinity;
  let selectedSlot: 'morning' | 'afternoon' | 'evening' | null = null;

  for (const slot of sortedSlots) {
    const count = slot.places?.length || 0;
    if (count < minCount) {
      minCount = count;
      const slotLabel = slot.label.toLowerCase() as 'morning' | 'afternoon' | 'evening';
      if (slotOrder.includes(slotLabel)) {
        selectedSlot = slotLabel;
      }
    }
  }

  return selectedSlot;
}
