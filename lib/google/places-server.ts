export const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

/**
 * Fetch a single representative photo URL for a place name using Google Places API (Server-side)
 */
export async function findPlacePhoto(query: string): Promise<string | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    console.error("Missing Google Maps API Key");
    return null;
  }

  try {
    // Use Find Place API to get the photo reference
    // We request 'photos' field to get photo references
    const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=photos&key=${GOOGLE_MAPS_API_KEY}`;
    
    const res = await fetch(url);
    const data = await res.json();

    if (
      data.candidates &&
      data.candidates.length > 0 &&
      data.candidates[0].photos &&
      data.candidates[0].photos.length > 0
    ) {
      const photoRef = data.candidates[0].photos[0].photo_reference;
      // Construct the photo URL
      // Google Places Photo API returns the image binary, but we can store the URL that serves it
      // Note: This URL will redirect to the actual image. Browsers handle this fine.
      return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoRef}&key=${GOOGLE_MAPS_API_KEY}`;
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

