import { GOOGLE_MAPS_API_KEY } from './places-server';

/**
 * In-memory cache to avoid duplicate API calls within a single request.
 * Key format: `${title}|${city}`
 * Value: photo_reference string or null
 */
const photoRefCache = new Map<string, string | null>();

/**
 * Find a photo reference for an activity by searching Google Places using text.
 * Uses "Find Place From Text" API followed by Place Details API.
 * 
 * @param options - Activity details for searching
 * @param options.title - Activity title (e.g., "Valencia Cathedral")
 * @param options.city - Trip destination name (e.g., "Valencia")
 * @param options.country - Optional country name
 * @param options.lat - Optional latitude for location bias
 * @param options.lng - Optional longitude for location bias
 * @returns photo_reference string or null if not found
 */
export async function findPhotoRefForActivity({
  title,
  city,
  country,
  lat,
  lng,
}: {
  title: string;
  city: string;
  country?: string;
  lat?: number;
  lng?: number;
}): Promise<string | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    console.error('[places-backfill] Missing Google Maps API key');
    return null;
  }

  // Check cache first
  const cacheKey = `${title}|${city}`;
  if (photoRefCache.has(cacheKey)) {
    return photoRefCache.get(cacheKey) ?? null;
  }

  try {
    // Step A: Find Place From Text
    const searchQuery = country ? `${title}, ${city}, ${country}` : `${title}, ${city}`;
    let findPlaceUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(searchQuery)}&inputtype=textquery&fields=place_id,name&key=${GOOGLE_MAPS_API_KEY}`;
    
    // Add location bias if coordinates are available
    if (lat !== undefined && lng !== undefined) {
      findPlaceUrl += `&locationbias=circle:30000@${lat},${lng}`;
    }

    const findPlaceResponse = await fetch(findPlaceUrl);
    if (!findPlaceResponse.ok) {
      console.error('[places-backfill] Find Place API request failed:', findPlaceResponse.status);
      photoRefCache.set(cacheKey, null);
      return null;
    }

    const findPlaceData = await findPlaceResponse.json();

    // Check if we got candidates
    if (findPlaceData.status !== 'OK' || !findPlaceData.candidates || findPlaceData.candidates.length === 0) {
      photoRefCache.set(cacheKey, null);
      return null;
    }

    const placeId = findPlaceData.candidates[0].place_id;
    if (!placeId) {
      photoRefCache.set(cacheKey, null);
      return null;
    }

    // Step B: Get Place Details with photos
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=photos&key=${GOOGLE_MAPS_API_KEY}`;
    
    const detailsResponse = await fetch(detailsUrl);
    if (!detailsResponse.ok) {
      console.error('[places-backfill] Place Details API request failed:', detailsResponse.status);
      photoRefCache.set(cacheKey, null);
      return null;
    }

    const detailsData = await detailsResponse.json();

    // Check if we got photos
    if (detailsData.status !== 'OK' || !detailsData.result?.photos || detailsData.result.photos.length === 0) {
      photoRefCache.set(cacheKey, null);
      return null;
    }

    const photoRef = detailsData.result.photos[0].photo_reference;
    if (!photoRef || typeof photoRef !== 'string') {
      photoRefCache.set(cacheKey, null);
      return null;
    }

    // Cache and return the photo reference
    photoRefCache.set(cacheKey, photoRef);
    return photoRef;
  } catch (error) {
    console.error('[places-backfill] Error finding photo reference:', error);
    photoRefCache.set(cacheKey, null);
    return null;
  }
}

/**
 * Clear the in-memory cache.
 * Useful for testing or if you want to reset the cache between requests.
 */
export function clearPhotoRefCache(): void {
  photoRefCache.clear();
}

