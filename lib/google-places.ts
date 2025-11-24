/**
 * Helper functions for Google Places API integration
 */

export type GooglePlaceType =
  | "museum"
  | "park"
  | "tourist_attraction"
  | "restaurant"
  | "bar"
  | "night_club"
  | "shopping_mall"
  | "store"
  | "neighborhood";

export interface GooglePlaceResult {
  place_id: string;
  name: string;
  formatted_address?: string;
  vicinity?: string;
  geometry: {
    location: google.maps.LatLng;
  };
  types?: string[];
  rating?: number;
  user_ratings_total?: number;
  photos?: google.maps.places.PlacePhoto[];
}

/**
 * Map Google Place type to our filter categories
 */
export function getPlaceTypeForFilter(
  filter: "museums" | "parks" | "food" | "nightlife" | "shopping" | "neighborhoods" | "highlights"
): GooglePlaceType | GooglePlaceType[] {
  switch (filter) {
    case "museums":
      return "museum";
    case "parks":
      // Include both parks and tourist attractions for better results
      return ["park", "tourist_attraction"] as GooglePlaceType[];
    case "food":
      return "restaurant";
    case "nightlife":
      return "bar"; // Could also use "night_club"
    case "shopping":
      return "shopping_mall";
    case "neighborhoods":
      return "neighborhood";
    case "highlights":
      // For highlights, we'll use text search, so return empty
      return [];
    default:
      return "restaurant";
  }
}

/**
 * Convert Google Place result to our PlaceResult format
 */
export function mapGooglePlaceToPlaceResult(
  place: GooglePlaceResult
): {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  category?: string;
  photoUrl?: string | null;
  types?: string[];
} {
  const lat = place.geometry.location.lat();
  const lng = place.geometry.location.lng();
  const address = place.formatted_address || place.vicinity || "";
  
  // Extract primary category from types array
  const category = place.types?.[0]?.replace(/_/g, " ") || undefined;

  // Extract photo URL if available
  let photoUrl: string | null = null;
  if (place.photos && place.photos.length > 0) {
    try {
      photoUrl = place.photos[0].getUrl({ maxWidth: 400, maxHeight: 400 });
    } catch (err) {
      console.error("Error getting photo URL:", err);
      photoUrl = null;
    }
  }

  return {
    id: place.place_id,
    name: place.name || "Unnamed place",
    address,
    lat,
    lng,
    category,
    photoUrl,
    types: place.types,
  };
}

/**
 * Search nearby places using Google Places API
 */
export function searchNearbyPlaces(
  service: google.maps.places.PlacesService,
  location: { lat: number; lng: number },
  type: GooglePlaceType | GooglePlaceType[],
  radius: number = 10000
): Promise<GooglePlaceResult[]> {
  return new Promise((resolve, reject) => {
    // For neighborhoods, use text search instead
    const firstType = Array.isArray(type) ? type[0] : type;
    if (firstType === "neighborhood") {
      // Fallback to text search for neighborhoods
      const request: google.maps.places.TextSearchRequest = {
        query: "neighborhood",
        location: new google.maps.LatLng(location.lat, location.lng),
        radius,
      };
      
      service.textSearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          resolve(results as GooglePlaceResult[]);
        } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          resolve([]);
        } else {
          reject(new Error(`Places search failed: ${status}`));
        }
      });
      return;
    }

    // Handle array of types by making multiple requests
    if (Array.isArray(type)) {
      const promises = type.map((t) => {
        const request: google.maps.places.PlaceSearchRequest = {
          location: new google.maps.LatLng(location.lat, location.lng),
          radius,
          type: t,
        };
        return new Promise<GooglePlaceResult[]>((resolveInner, rejectInner) => {
          service.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
              resolveInner(results as GooglePlaceResult[]);
            } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
              resolveInner([]);
            } else {
              rejectInner(new Error(`Places search failed: ${status}`));
            }
          });
        });
      });
      
      Promise.all(promises)
        .then((resultsArrays) => {
          // Combine and deduplicate results by place_id
          const allResults = resultsArrays.flat();
          const uniqueResults = Array.from(
            new Map(allResults.map((r) => [r.place_id, r])).values()
          );
          resolve(uniqueResults);
        })
        .catch(reject);
      return;
    }

    // Single type search
    const request: google.maps.places.PlaceSearchRequest = {
      location: new google.maps.LatLng(location.lat, location.lng),
      radius,
      type: type,
    };

    service.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        resolve(results as GooglePlaceResult[]);
      } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
        resolve([]);
      } else {
        reject(new Error(`Places search failed: ${status}`));
      }
    });
  });
}

/**
 * Text search using Google Places API
 */
export function searchPlacesByText(
  service: google.maps.places.PlacesService,
  query: string,
  location: { lat: number; lng: number },
  radius: number = 15000
): Promise<GooglePlaceResult[]> {
  return new Promise((resolve, reject) => {
    const request: google.maps.places.TextSearchRequest = {
      query,
      location: new google.maps.LatLng(location.lat, location.lng),
      radius,
    };

    service.textSearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        resolve(results as GooglePlaceResult[]);
      } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
        resolve([]);
      } else {
        reject(new Error(`Places search failed: ${status}`));
      }
    });
  });
}

