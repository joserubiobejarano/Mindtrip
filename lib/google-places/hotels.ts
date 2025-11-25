/**
 * Helper functions for searching hotels/lodging using Google Places API
 */

export interface HotelResult {
  place_id: string;
  name: string;
  formatted_address: string;
  rating?: number;
  user_ratings_total?: number;
  photo_reference?: string;
  types?: string[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

export type HotelType = "any" | "hotel" | "hostel" | "apartment";

/**
 * Search for hotels/lodging near a destination
 */
export function searchHotels(
  service: google.maps.places.PlacesService,
  location: { lat: number; lng: number },
  type: HotelType = "any",
  radius: number = 15000
): Promise<HotelResult[]> {
  return new Promise((resolve, reject) => {
    // Map our hotel type to Google Places types
    let placeType: string | undefined;
    if (type === "hotel") {
      placeType = "lodging";
    } else if (type === "hostel") {
      // Hostels are also lodging, but we'll filter by name/type later
      placeType = "lodging";
    } else if (type === "apartment") {
      // Apartments might be lodging or real_estate_agency
      placeType = "lodging";
    }

    const request: google.maps.places.PlaceSearchRequest = {
      location: new google.maps.LatLng(location.lat, location.lng),
      radius,
      type: placeType || "lodging",
    };

    service.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        // Filter out places without place_id or geometry before mapping
        const validPlaces = results.filter(
          (place) => place.place_id && place.geometry && place.geometry.location
        );
        
        let hotels: HotelResult[] = validPlaces.map((place) => {
          // TypeScript narrowing: we know geometry and location exist due to filter
          const geometry = place.geometry!;
          const location = geometry.location!;
          
          let photoUrl: string | undefined;
          if (place.photos && place.photos.length > 0) {
            try {
              photoUrl = place.photos[0].getUrl({ maxWidth: 400, maxHeight: 400 });
            } catch (err) {
              console.error("Error getting photo URL:", err);
            }
          }
          
          return {
            place_id: place.place_id!,
            name: place.name || "Unnamed",
            formatted_address: place.formatted_address || place.vicinity || "",
            rating: place.rating,
            user_ratings_total: place.user_ratings_total,
            photo_reference: photoUrl,
            types: place.types,
            geometry: {
              location: {
                lat: location.lat(),
                lng: location.lng(),
              },
            },
          };
        });

        // Filter by type if specified
        if (type === "hostel") {
          hotels = hotels.filter(
            (h) =>
              h.types?.some((t) =>
                t.toLowerCase().includes("hostel")
              ) ||
              h.name.toLowerCase().includes("hostel")
          );
        } else if (type === "apartment") {
          hotels = hotels.filter(
            (h) =>
              h.types?.some((t) =>
                t.toLowerCase().includes("apartment") ||
                t.toLowerCase().includes("real_estate")
              ) ||
              h.name.toLowerCase().includes("apartment")
          );
        } else if (type === "hotel") {
          // Filter out hostels and apartments
          hotels = hotels.filter(
            (h) =>
              !h.types?.some((t) =>
                t.toLowerCase().includes("hostel")
              ) &&
              !h.name.toLowerCase().includes("hostel") &&
              !h.types?.some((t) =>
                t.toLowerCase().includes("apartment")
              ) &&
              !h.name.toLowerCase().includes("apartment")
          );
        }

        resolve(hotels);
      } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
        resolve([]);
      } else {
        reject(new Error(`Hotel search failed: ${status}`));
      }
    });
  });
}

/**
 * Get photo URL for a hotel
 */
export function getHotelPhotoUrl(
  place: google.maps.places.PlaceResult,
  maxWidth: number = 400
): string | null {
  if (place.photos && place.photos.length > 0) {
    try {
      return place.photos[0].getUrl({ maxWidth, maxHeight: maxWidth });
    } catch (err) {
      console.error("Error getting photo URL:", err);
      return null;
    }
  }
  return null;
}

