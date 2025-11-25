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

