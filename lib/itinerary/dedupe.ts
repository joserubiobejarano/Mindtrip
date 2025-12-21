/**
 * Helper functions for deduplicating places in the Explore deck
 * based on itinerary data
 */

interface ActivityPlace {
  id: string;
  name: string;
  external_id: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
}

interface Activity {
  place?: ActivityPlace | null;
}

/**
 * Normalizes a place key for fallback matching when place_id is not available.
 * Converts to lowercase, trims, collapses spaces, and removes punctuation.
 * 
 * @param name - Place name
 * @param area - Optional area/neighborhood
 * @param city - Optional city name (used if area is not provided)
 * @returns Normalized key string
 */
export function normalizePlaceKey(
  name: string,
  area?: string | null,
  city?: string | null
): string {
  // Combine name with area or city for better matching
  const locationPart = area || city || '';
  const combined = locationPart ? `${name} ${locationPart}` : name;

  // Normalize: lowercase, trim, collapse spaces, remove punctuation
  return combined
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Collapse multiple spaces to single space
    .replace(/[^\w\s]/g, '') // Remove punctuation (keep word chars and spaces)
    .replace(/\s+/g, ''); // Remove all spaces for exact matching
}

/**
 * Extracts place keys from itinerary activities.
 * Returns both place_id set (for primary matching) and normalized key set (for fallback).
 * 
 * @param activities - Array of activities with place data
 * @returns Object with placeIds Set and fallbackKeys Set
 */
export function getItineraryPlaceKeys(
  activities: Activity[]
): { placeIds: Set<string>; fallbackKeys: Set<string> } {
  const placeIds = new Set<string>();
  const fallbackKeys = new Set<string>();

  for (const activity of activities) {
    const place = activity.place;
    if (!place) continue;

    // Primary match: Google place_id (external_id)
    if (place.external_id) {
      placeIds.add(place.external_id);
    }

    // Fallback match: normalized name + address
    // Extract city/area from address (usually last or second-to-last part)
    let area: string | null = null;
    let city: string | null = null;

    if (place.address) {
      const addressParts = place.address.split(',').map(p => p.trim());
      if (addressParts.length > 1) {
        // Usually: street, neighborhood, city, country
        // City is often second-to-last or last
        city = addressParts[addressParts.length - 2] || addressParts[addressParts.length - 1] || null;
        area = addressParts.length > 2 ? addressParts[addressParts.length - 3] : null;
      }
    }

    const normalizedKey = normalizePlaceKey(place.name, area, city);
    if (normalizedKey) {
      fallbackKeys.add(normalizedKey);
    }
  }

  return { placeIds, fallbackKeys };
}
