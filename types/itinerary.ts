export interface ItineraryPlace {
  id: string;
  name: string;
  description: string;
  area: string;       // e.g. "Gothic Quarter"
  neighborhood: string | null;
  photos: string[];
  visited: boolean;
  tags: string[];     // "food", "viewpoint", etc.
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

export interface SmartItinerary {
  title: string;
  summary: string;
  days: ItineraryDay[];
  tripTips: string[]; // trip-wide tips (season, holidays, packing)
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
