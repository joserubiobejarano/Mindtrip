/**
 * Personalization data collected from the user during trip creation
 */
export type TripPersonalizationPayload = {
  travelers: number; // required, min 1
  originCityPlaceId?: string | null;
  originCityName?: string | null;
  hasAccommodation: boolean;
  accommodationPlaceId?: string | null;
  accommodationName?: string | null;
  accommodationAddress?: string | null;
  arrivalTransportMode?: 'plane' | 'train' | 'bus' | 'car' | 'unknown';
  arrivalTimeLocal?: string | null; // e.g. "17:30" in local time (HH:MM format)
  interests?: string[]; // e.g. ['food', 'museums', 'nightlife']
};

