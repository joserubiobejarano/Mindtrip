export interface ItineraryPlace {
  id: string;
  name: string;
  summary: string;
  photos: string[];
  visited: boolean;
  tags: string[];
  neighborhood?: string;
  area?: string;
  lat?: number;
  lng?: number;
  estimatedDurationMinutes?: number;
  timeOfDay?: "morning" | "afternoon" | "evening" | "night" | "flex";
}

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

export interface ItineraryTip {
  id: string;
  text: string;
  category?: 'weather' | 'season' | 'culture' | 'transport' | 'money' | 'safety' | 'other';
}

export interface ItineraryDay {
  id: string;
  index: number;
  date: string;
  title: string;
  summary: string;
  theme?: string;
  photos: string[]; // Explicitly added photos to ItineraryDay
  places: ItineraryPlace[];
  affiliateSuggestions?: AffiliateSuggestion[];
}

export interface SmartItinerary {
  title: string;
  summary: string;
  days: ItineraryDay[];
  tips?: ItineraryTip[];
  affiliateSuggestions?: AffiliateSuggestion[];
}
