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

    const sanitizedFindPlaceUrl = sanitizeUrl(findPlaceUrl);

    if (isDev) {
      console.log('[places-backfill] [Find Place] Attempting search:', {
        query: searchQuery,
        url: sanitizedFindPlaceUrl,
        hasLocationBias: lat !== undefined && lng !== undefined,
      });
    }

    const findPlaceResponse = await fetch(findPlaceUrl);
    
    if (!findPlaceResponse.ok) {
      let errorText = '';
      try {
        const text = await findPlaceResponse.text();
        errorText = truncateResponse(text);
      } catch {
        errorText = findPlaceResponse.statusText || 'Unknown error';
      }
      
      if (isDev) {
        console.error('[places-backfill] [Find Place] Request failed:', {
          status: findPlaceResponse.status,
          statusText: findPlaceResponse.statusText,
          error: errorText,
          url: sanitizedFindPlaceUrl,
        });
      }
      photoRefCache.set(cacheKey, null);
      return null;
    }

    const findPlaceData = await findPlaceResponse.json();

    if (isDev) {
      console.log('[places-backfill] [Find Place] Response:', {
        status: findPlaceData.status,
        candidatesCount: findPlaceData.candidates?.length || 0,
        errorMessage: findPlaceData.error_message || undefined,
      });
    }

    // Check if we got candidates
    if (findPlaceData.status !== 'OK' || !findPlaceData.candidates || findPlaceData.candidates.length === 0) {
      if (isDev) {
        console.warn('[places-backfill] [Find Place] No candidates found:', {
          status: findPlaceData.status,
          errorMessage: findPlaceData.error_message || 'No error message',
        });
      }
      photoRefCache.set(cacheKey, null);
      return null;
    }

    const placeId = findPlaceData.candidates[0].place_id;
    if (!placeId) {
      if (isDev) {
        console.warn('[places-backfill] [Find Place] No place_id in first candidate');
      }
      photoRefCache.set(cacheKey, null);
      return null;
    }

    if (isDev) {
      console.log('[places-backfill] [Find Place] ✅ Found place_id:', placeId);
    }

    // Step B: Get Place Details with photos
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=photos&key=${GOOGLE_MAPS_API_KEY}`;
    const sanitizedDetailsUrl = sanitizeUrl(detailsUrl);
    
    if (isDev) {
      console.log('[places-backfill] [Place Details] Fetching photos:', {
        placeId,
        url: sanitizedDetailsUrl,
      });
    }
    
    const detailsResponse = await fetch(detailsUrl);
    
    if (!detailsResponse.ok) {
      let errorText = '';
      try {
        const text = await detailsResponse.text();
        errorText = truncateResponse(text);
      } catch {
        errorText = detailsResponse.statusText || 'Unknown error';
      }
      
      if (isDev) {
        console.error('[places-backfill] [Place Details] Request failed:', {
          status: detailsResponse.status,
          statusText: detailsResponse.statusText,
          error: errorText,
          url: sanitizedDetailsUrl,
        });
      }
      photoRefCache.set(cacheKey, null);
      return null;
    }

    const detailsData = await detailsResponse.json();

    if (isDev) {
      console.log('[places-backfill] [Place Details] Response:', {
        status: detailsData.status,
        photosCount: detailsData.result?.photos?.length || 0,
        errorMessage: detailsData.error_message || undefined,
      });
    }

    // Check if we got photos
    if (detailsData.status !== 'OK' || !detailsData.result?.photos || detailsData.result.photos.length === 0) {
      if (isDev) {
        console.warn('[places-backfill] [Place Details] No photos found:', {
          status: detailsData.status,
          errorMessage: detailsData.error_message || 'No error message',
        });
      }
      photoRefCache.set(cacheKey, null);
      return null;
    }

    const photoRef = detailsData.result.photos[0].photo_reference;
    if (!photoRef || typeof photoRef !== 'string') {
      if (isDev) {
        console.warn('[places-backfill] [Place Details] No photo_reference in first photo');
      }
      photoRefCache.set(cacheKey, null);
      return null;
    }

    if (isDev) {
      console.log('[places-backfill] [Place Details] ✅ Found photo_reference:', photoRef.substring(0, 20) + '...');
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

