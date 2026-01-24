export interface ItineraryPlace {
  id: string;
  name: string;
  description: string;
  area: string;       // e.g. "Gothic Quarter"
  neighborhood: string | null;
  photos: string[];
  visited: boolean;
  tags: string[];     // "food", "viewpoint", etc.
  place_id?: string;  // Google Places place_id for accurate photo fetching
  photo_reference?: string;  // Google Places photo_reference for reliable image fetching
  image_url?: string | null;  // Stable Supabase Storage URL (prioritized over photos array)
}

export type TimeOfDay = 'morning' | 'afternoon' | 'evening';

export interface ItinerarySlot {
  label: TimeOfDay;
  summary: string;
  places: ItineraryPlace[];
}

export interface ItineraryDay {
  id: string;
  index: number;
  date: string;
  title: string;
  theme: string;
  areaCluster: string; // main area for that day
  photos: string[];
  overview: string;
  slots: ItinerarySlot[]; // usually 3
}

export interface CityOverview {
  gettingThere?: {
    airports?: string[];
    distanceToCity?: string;
    transferOptions?: string[];
  };
  gettingAround?: {
    publicTransport?: string;
    walkability?: string;
    taxiRideshare?: string;
  };
  budgetGuide?: {
    budgetDaily?: string;
    midRangeDaily?: string;
    luxuryDaily?: string;
    transportPass?: string;
  };
  bestTimeToVisit?: {
    bestMonths?: string;
    shoulderSeason?: string;
    peakLowSeason?: string;
  };
  whereToStay?: Array<{
    neighborhood: string;
    description: string;
  }>;
  advancePlanning?: {
    bookEarly?: string[];
    spontaneous?: string[];
  };
}

export interface SmartItinerary {
  title: string;
  summary: string;
  days: ItineraryDay[];
  tripTips: string[]; // trip-wide tips (season, holidays, packing)
  cityOverview?: CityOverview; // Optional structured city overview
}

// Keeping AffiliateSuggestion for compatibility if needed elsewhere, 
// though the new schema didn't explicitly mention it in the user prompt,
// the original file had it. I'll keep it but it's not in the main structure requested?
// The user prompt said "Modify ONLY the necessary parts (days, places, tips)".
// The requested schema in C.1 removed affiliateSuggestions from the interface definition provided.
// I will stick to the requested interface in C.1 for SmartItinerary, 
// but I will keep AffiliateSuggestion type definition just in case other files import it.

export interface AffiliateSuggestion {
  id: string;
  level: 'trip' | 'day' | 'place';
  kind: 'hotel' | 'activity' | 'tour' | 'transport' | 'esim' | 'insurance' | 'other';
  label: string;
  cta: string;
  deeplinkSlug: string;
  relatedDayId?: string;
  relatedPlaceId?: string;
}

/**
 * Type guard to validate that an object matches the SmartItinerary interface
 */
export function isSmartItinerary(obj: any): obj is SmartItinerary {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  // Check top-level required fields
  if (typeof obj.title !== 'string' || typeof obj.summary !== 'string') {
    return false;
  }

  // Check days array
  if (!Array.isArray(obj.days) || obj.days.length === 0) {
    return false;
  }

  // Validate each day
  for (const day of obj.days) {
    if (
      typeof day.id !== 'string' ||
      typeof day.index !== 'number' ||
      typeof day.title !== 'string' ||
      typeof day.date !== 'string' ||
      typeof day.theme !== 'string' ||
      typeof day.areaCluster !== 'string' ||
      typeof day.overview !== 'string' ||
      !Array.isArray(day.photos) ||
      !Array.isArray(day.slots) ||
      day.slots.length === 0
    ) {
      return false;
    }

    // Validate each slot
    for (const slot of day.slots) {
      if (
        typeof slot.label !== 'string' ||
        typeof slot.summary !== 'string' ||
        !Array.isArray(slot.places)
      ) {
        return false;
      }

      // Validate each place
      for (const place of slot.places) {
        if (
          typeof place.id !== 'string' ||
          typeof place.name !== 'string' ||
          typeof place.description !== 'string' ||
          typeof place.area !== 'string' ||
          typeof place.visited !== 'boolean' ||
          !Array.isArray(place.photos) ||
          !Array.isArray(place.tags) ||
          (place.place_id !== undefined && typeof place.place_id !== 'string')
        ) {
          return false;
        }
      }
    }
  }

  // tripTips is optional, but if present must be an array of strings
  if (obj.tripTips !== undefined && !Array.isArray(obj.tripTips)) {
    return false;
  }

  return true;
}