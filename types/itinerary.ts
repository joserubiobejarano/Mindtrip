export interface ItineraryPlace {
  id: string;           // uuid
  name: string;
  summary: string;      // 1–3 sentences
  pictures: string[];   // image URLs
  visited: boolean;
}

export interface ItineraryDay {
  id: string;           // uuid
  index: number;        // 1-based day number
  date: string;         // ISO date string
  title: string;        // “Day 1 – Arrival and City Exploration”
  theme: string;        // “Cultural immersion”, etc.
  description: string;  // 1–2 paragraphs describing the day
  places: ItineraryPlace[];
}

export interface SmartItinerary {
  tripId: string;
  title: string;        // overall trip title
  summary: string;      // overall trip narrative
  days: ItineraryDay[];
}

