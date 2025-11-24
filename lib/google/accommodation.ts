/**
 * Service for finding accommodation using Google Places API
 */

export interface AccommodationResult {
  place_id: string;
  name: string;
  formatted_address: string;
  rating: number;
  user_ratings_total: number;
  photos?: Array<{
    photo_reference: string;
    width: number;
    height: number;
  }>;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

/**
 * Find best hotel/accommodation in a city using Google Places Text Search API
 */
export async function findBestAccommodation(
  city: string,
  apiKey: string
): Promise<AccommodationResult | null> {
  try {
    // Use Text Search API to find hotels
    const query = `best hotel in ${city}`;
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&type=lodging&key=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      console.warn("No accommodation found for city:", city);
      return null;
    }

    // Sort by rating * user_ratings_total (best hotels with good reviews)
    const sortedResults = data.results
      .filter((place: any) => place.rating && place.user_ratings_total)
      .sort((a: any, b: any) => {
        const scoreA = (a.rating || 0) * (a.user_ratings_total || 0);
        const scoreB = (b.rating || 0) * (b.user_ratings_total || 0);
        return scoreB - scoreA;
      });

    if (sortedResults.length === 0) {
      // Fallback to first result if no ratings available
      const firstResult = data.results[0];
      return {
        place_id: firstResult.place_id,
        name: firstResult.name,
        formatted_address: firstResult.formatted_address || firstResult.vicinity || "",
        rating: firstResult.rating || 0,
        user_ratings_total: firstResult.user_ratings_total || 0,
        photos: firstResult.photos || [],
        geometry: {
          location: {
            lat: firstResult.geometry.location.lat,
            lng: firstResult.geometry.location.lng,
          },
        },
      };
    }

    const bestHotel = sortedResults[0];
    return {
      place_id: bestHotel.place_id,
      name: bestHotel.name,
      formatted_address: bestHotel.formatted_address || bestHotel.vicinity || "",
      rating: bestHotel.rating || 0,
      user_ratings_total: bestHotel.user_ratings_total || 0,
      photos: bestHotel.photos || [],
      geometry: {
        location: {
          lat: bestHotel.geometry.location.lat,
          lng: bestHotel.geometry.location.lng,
        },
      },
    };
  } catch (error) {
    console.error("Error finding accommodation:", error);
    return null;
  }
}

/**
 * Get photo URL from Google Places API
 */
export function getPlacePhotoUrl(
  photoReference: string,
  apiKey: string,
  maxWidth: number = 400
): string {
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${apiKey}`;
}

