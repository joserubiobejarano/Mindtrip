export interface ItineraryPlace {
  id: string;
  name: string;
  summary: string;
  photos: string[];
  visited: boolean;
  tags: string[];
  neighborhood?: string;
  timeOfDay?: "morning" | "afternoon" | "evening" | "night" | "flex";
}

export interface ItineraryDay {
  id: string;
  index: number;
  date: string;
  title: string;
  summary: string;
  theme?: string;
  places: ItineraryPlace[];
}

export interface SmartItinerary {
  title: string;
  summary: string;
  days: ItineraryDay[];
}
