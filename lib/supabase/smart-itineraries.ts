import { createClient } from '@/lib/supabase/server';
import type { SmartItinerary } from '@/types/itinerary';

/**
 * Maximum number of activities allowed per day (across all slots)
 */
export const MAX_ACTIVITIES_PER_DAY = 12;

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
