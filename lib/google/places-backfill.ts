import { GOOGLE_MAPS_API_KEY } from './places-server';

const isDev = process.env.NODE_ENV === 'development';

/**
 * Sanitize URL by removing API keys, tokens, and secrets
 */
function sanitizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Remove common secret parameters
    const secretParams = ['key', 'api_key', 'access_token', 'token', 'apikey', 'auth'];
    secretParams.forEach(param => {
      if (urlObj.searchParams.has(param)) {
        urlObj.searchParams.set(param, '***REDACTED***');
      }
    });
    return urlObj.toString();
  } catch {
    // If URL parsing fails, try to remove common patterns
    return url
      .replace(/[?&](key|api_key|access_token|token|apikey|auth)=[^&]*/gi, '=$1=***REDACTED***')
      .substring(0, 500); // Limit length
  }
}

/**
 * Truncate response text to max length
 */
function truncateResponse(text: string, maxLength: number = 300): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * In-memory cache to avoid duplicate API calls within a single request.
 * Key format: `${title}|${city}`
 * Value: photo_reference string or null
 */
const photoRefCache = new Map<string, string | null>();

/**
 * Build alternative search queries for generic/activity-type place names.
 * Used when the exact title fails to find a result.
 */
function buildFallbackQueries(title: string, city: string): string[] {
  const fallbacks: string[] = [];
  const normalized = title.trim();
  if (!normalized) return fallbacks;

  // Try simplified: extract key terms (e.g. "Local Market" -> "Market", "Cooking Class" -> "Cooking class")
  const words = normalized.split(/\s+/);
  if (words.length > 1) {
    // Skip common adjectives: Local, Best, Famous, etc.
    const skipWords = new Set(['local', 'the', 'best', 'famous', 'popular', 'traditional', 'authentic', 'homemade']);
    const keyWords = words.filter(w => !skipWords.has(w.toLowerCase()));
    if (keyWords.length > 0) {
      fallbacks.push(`${keyWords.join(' ')} ${city}`);
    }
    // Last word often describes the place type (Market, Class, Venue)
    const lastWord = words[words.length - 1];
    if (lastWord.length > 2) {
      fallbacks.push(`${lastWord} ${city}`);
    }
  } else if (normalized.length > 4) {
    // Single word - try as-is with city
    fallbacks.push(`${normalized} ${city}`);
  }

  return fallbacks;
}

/**
 * Internal: Execute Find Place + Place Details for a single search query.
 */
async function findPhotoRefForQuery(
  searchQuery: string,
  lat?: number,
  lng?: number
): Promise<string | null> {
  let findPlaceUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(searchQuery)}&inputtype=textquery&fields=place_id,name&key=${GOOGLE_MAPS_API_KEY}`;
  if (lat !== undefined && lng !== undefined) {
    findPlaceUrl += `&locationbias=circle:30000@${lat},${lng}`;
  }

  const findPlaceResponse = await fetch(findPlaceUrl);
  if (!findPlaceResponse.ok) return null;

  const findPlaceData = await findPlaceResponse.json();
  if (findPlaceData.status !== 'OK' || !findPlaceData.candidates?.length) return null;

  const placeId = findPlaceData.candidates[0].place_id;
  if (!placeId) return null;

  const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=photos&key=${GOOGLE_MAPS_API_KEY}`;
  const detailsResponse = await fetch(detailsUrl);
  if (!detailsResponse.ok) return null;

  const detailsData = await detailsResponse.json();
  if (detailsData.status !== 'OK' || !detailsData.result?.photos?.length) return null;

  const photoRef = detailsData.result.photos[0].photo_reference;
  return photoRef && typeof photoRef === 'string' ? photoRef : null;
}

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
    // Primary query: exact title + city + country
    const primaryQuery = country ? `${title}, ${city}, ${country}` : `${title}, ${city}`;

    if (isDev) {
      console.log('[places-backfill] [Find Place] Attempting search:', {
        query: primaryQuery,
        hasLocationBias: lat !== undefined && lng !== undefined,
      });
    }

    let photoRef = await findPhotoRefForQuery(primaryQuery, lat, lng);

    // Fallback: try alternative queries for generic/activity-type names
    if (!photoRef) {
      const fallbackQueries = buildFallbackQueries(title, city);
      for (const q of fallbackQueries) {
        if (q === primaryQuery) continue; // Skip if same as primary
        if (isDev) {
          console.log('[places-backfill] [Find Place] Trying fallback query:', q);
        }
        photoRef = await findPhotoRefForQuery(q, lat, lng);
        if (photoRef) break;
      }
    }

    if (!photoRef) {
      if (isDev) {
        console.warn('[places-backfill] [Find Place] No candidates found for:', { title, city });
      }
      photoRefCache.set(cacheKey, null);
      return null;
    }

    if (isDev) {
      console.log('[places-backfill] [Find Place] ✅ Found photo_reference:', photoRef.substring(0, 20) + '...');
    }

    // Cache and return the photo reference
    photoRefCache.set(cacheKey, photoRef);
    return photoRef;
  } catch (error: any) {
    if (isDev) {
      console.error('[places-backfill] Error finding photo reference:', {
        error: error?.message || error,
        title,
        city,
      });
    } else {
      console.error('[places-backfill] Error finding photo reference:', error);
    }
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

