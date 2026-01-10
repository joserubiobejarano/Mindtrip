// Use server-side API key only (no NEXT_PUBLIC fallback for security)
export const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

/**
 * Get a generic city photo using Google Places API (Server-side)
 * This is a fallback when no specific place photo can be found or is deduped.
 */
export async function getGenericCityPhoto(cityName: string): Promise<string | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    console.error("Missing Google Maps API Key");
    return null;
  }

  try {
    const query = `${cityName} city skyline`; // A generic query for a city photo
    const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=photos&key=${GOOGLE_MAPS_API_KEY}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.candidates && data.candidates.length > 0 && data.candidates[0].photos && data.candidates[0].photos.length > 0) {
      const photoRef = data.candidates[0].photos[0].photo_reference;
      return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoRef}&key=${GOOGLE_MAPS_API_KEY}`;
    }
    return null;
  } catch (error) {
    console.error("Error fetching generic city photo:", error);
    return null;
  }
}

/**
 * Fetch a single representative photo URL for a place name using Google Places API (Server-side)
 */
export async function findPlacePhoto(query: string, options?: {
  usedImageUrls?: Set<string>;
  usedPlaceIds?: Set<string>;
  placeId?: string | null;
  allowDedupedFallback?: boolean;
  destinationCity?: string; // New parameter
}): Promise<string | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    console.error("Missing Google Maps API Key");
    return null;
  }

  try {
    const { usedImageUrls, usedPlaceIds, placeId, allowDedupedFallback } = options || {};

    let actualPlaceId = placeId;

    // If a placeId is provided, prioritize getting a photo for it
    if (actualPlaceId) {
      const photoUrlById = await getPlacePhotoByPlaceId(actualPlaceId);
      if (photoUrlById && (!usedImageUrls || !usedImageUrls.has(photoUrlById))) {
        usedImageUrls?.add(photoUrlById);
        return photoUrlById;
      }
    }

    // Fallback to text search if no specific placeId or if photo from placeId was deduped
    // Use Find Place API to get the photo reference
    // We request 'photos' field to get photo references
    const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id,photos&key=${GOOGLE_MAPS_API_KEY}`;
    
    const res = await fetch(url);
    const data = await res.json();

    if (data.candidates && data.candidates.length > 0) {
      // If we found a new place ID and it's already used, try other candidates if allowed
      for (const candidate of data.candidates) {
        if (usedPlaceIds && candidate.place_id && usedPlaceIds.has(candidate.place_id)) {
          if (!allowDedupedFallback) {
            continue; // Skip this candidate if deduping is strict
          }
        }

        if (candidate.photos && candidate.photos.length > 0) {
          const photoRef = candidate.photos[0].photo_reference;
          const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoRef}&key=${GOOGLE_MAPS_API_KEY}`;
          
          if (!usedImageUrls || !usedImageUrls.has(photoUrl)) {
            usedImageUrls?.add(photoUrl);
            usedPlaceIds?.add(candidate.place_id);
            return photoUrl;
          }
        }
      }
    }
    
    // If no unique photo found after all attempts, try a generic city photo if allowed
    if (allowDedupedFallback && destinationCity) {
      const genericPhoto = await getGenericCityPhoto(destinationCity);
      if (genericPhoto) {
        usedImageUrls?.add(genericPhoto);
        return genericPhoto;
      }
    }

    return null;
  } catch (error) {
    console.error("Error fetching place photo:", error);
    return null;
  }
}

/**
 * Find Google Places ID from place name and coordinates
 */
export async function findGooglePlaceId(placeName: string, lat?: number, lng?: number): Promise<string | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    console.error("Missing Google Maps API Key");
    return null;
  }

  try {
    // Use Find Place API with text input
    let url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(placeName)}&inputtype=textquery&fields=place_id${lat && lng ? `&locationbias=point:${lat},${lng}` : ''}&key=${GOOGLE_MAPS_API_KEY}`;
    
    const res = await fetch(url);
    const data = await res.json();

    if (data.status === 'OK' && data.candidates && data.candidates.length > 0) {
      return data.candidates[0].place_id;
    }

    console.error('Google Places Find API error:', data.status, data.error_message);
    return null;
  } catch (error) {
    console.error("Error finding Google Place ID:", error);
    return null;
  }
}

/**
 * Fetch place details by place_id from Google Places API (Server-side)
 */
export async function getPlaceDetails(placeId: string): Promise<{
  name: string;
  formatted_address?: string;
  types?: string[];
  rating?: number;
  user_ratings_total?: number;
  photos?: Array<{ photo_reference: string }>;
  geometry?: { location: { lat: number; lng: number } };
  editorial_summary?: { overview?: string };
} | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    console.error("Missing Google Maps API Key");
    return null;
  }

  try {
    const fields = [
      'name',
      'formatted_address',
      'types',
      'rating',
      'user_ratings_total',
      'photos',
      'geometry',
      'editorial_summary',
    ].join(',');

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_MAPS_API_KEY}`;
    
    const res = await fetch(url);
    const data = await res.json();

    if (data.status === 'OK' && data.result) {
      return data.result;
    }

    console.error('Google Places API error:', data.status, data.error_message);
    return null;
  } catch (error) {
    console.error("Error fetching place details:", error);
    return null;
  }
}

/**
 * Get photo_reference from place_id using Google Places Details API
 * This is the most reliable way to get photos - returns the photo_reference, not the URL
 * @param placeId - Google Places place_id
 * @returns photo_reference string or null if not found
 */
export async function getPlacePhotoReference(placeId: string): Promise<string | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    console.error("Missing Google Maps API Key");
    return null;
  }

  try {
    const placeDetails = await getPlaceDetails(placeId);
    if (!placeDetails || !placeDetails.photos || placeDetails.photos.length === 0) {
      console.log(`[places-server] No photos found for place_id: ${placeId}`);
      return null;
    }

    const photoRef = placeDetails.photos[0].photo_reference;
    console.log(`[places-server] Successfully obtained photo_reference for place_id: ${placeId}`);
    return photoRef;
  } catch (error) {
    console.error(`[places-server] Error fetching photo_reference by place_id (${placeId}):`, error);
    return null;
  }
}

/**
 * Get photo URL from place_id using Google Places Details API
 * This is more reliable than text-based search
 * @param placeId - Google Places place_id
 * @returns Photo URL or null if not found
 */
export async function getPlacePhotoByPlaceId(placeId: string): Promise<string | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    console.error("Missing Google Maps API Key");
    return null;
  }

  try {
    const placeDetails = await getPlaceDetails(placeId);
    if (!placeDetails || !placeDetails.photos || placeDetails.photos.length === 0) {
      return null;
    }

    const photoRef = placeDetails.photos[0].photo_reference;
    // Construct the photo URL
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoRef}&key=${GOOGLE_MAPS_API_KEY}`;
  } catch (error) {
    console.error("Error fetching photo by place_id:", error);
    return null;
  }
}

export async function getCityFromLatLng(lat: number, lng: number): Promise<string | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    console.error("Missing Google Maps API Key");
    return null;
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&result_type=locality&key=${GOOGLE_MAPS_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      for (const result of data.results) {
        if (result.types.includes('locality')) {
          const cityComponent = result.address_components.find((comp: any) => comp.types.includes('locality'));
          if (cityComponent) {
            return cityComponent.long_name;
          }
        }
      }
    }
    console.error('Google Geocoding API error:', data.status, data.error_message);
    return null;
  } catch (error) {
    console.error("Error reverse geocoding:", error);
    return null;
  }
}

// A very basic heuristic to check if a string might be a landmark
// In a real application, this would involve a more robust lookup or NLP
export async function isLandmark(name: string): Promise<boolean> {
  const commonLandmarkKeywords = [
    "tower", "palace", "museum", "cathedral", "church", "park", "garden", "square", "bridge",
    "castle", "fort", "temple", "monument", "statue", "market", "gallery", "arena", "coliseum",
    "stadium", "zoo", "aquarium", "opera", "theater", "university", "library", "hospital", "station",
    "airport", "hotel", "resort", "mall", "store", "restaurant", "cafe", "bar", "club", "beach",
    "mountain", "lake", "river", "waterfall", "forest", "desert", "valley", "canyon", "volcano",
    "island", "reef", "cave", "ruins", "pyramid", "sphinx", "wall", "gate", "fountain", "memorial",
    "historic", "ancient", "national park", "wildlife", "sanctuary", "reserve", "landmark"
  ];

  const lowerName = name.toLowerCase();

  // Check if the name contains common landmark keywords
  if (commonLandmarkKeywords.some(keyword => lowerName.includes(keyword))) {
    return true;
  }

  // A more sophisticated check might involve calling Google Places Details API
  // and checking the 'types' array for common landmark types (e.g., 'point_of_interest', 'tourist_attraction')
  // For now, this basic keyword check is sufficient as a starting point.
  return false;
}

