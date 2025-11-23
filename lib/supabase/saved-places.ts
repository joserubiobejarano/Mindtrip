import { createClient } from "@/lib/supabase/client";

/**
 * Save a place for a user in a trip
 * Inserts into saved_places if not already present
 */
export async function savePlace(
  tripId: string,
  userId: string,
  placeId: string
): Promise<{ error: Error | null }> {
  const supabase = createClient();

  // Check if already saved
  const { data: existing } = await supabase
    .from("saved_places")
    .select("id")
    .eq("trip_id", tripId)
    .eq("user_id", userId)
    .eq("place_id", placeId)
    .maybeSingle();

  if (existing) {
    // Already saved, return success
    return { error: null };
  }

  // Insert new saved place
  const { error } = await supabase.from("saved_places").insert({
    trip_id: tripId,
    user_id: userId,
    place_id: placeId,
  });

  return { error: error ? new Error(error.message) : null };
}

/**
 * Unsave a place for a user in a trip
 * Deletes from saved_places
 */
export async function unsavePlace(
  tripId: string,
  userId: string,
  placeId: string
): Promise<{ error: Error | null }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("saved_places")
    .delete()
    .eq("trip_id", tripId)
    .eq("user_id", userId)
    .eq("place_id", placeId);

  return { error: error ? new Error(error.message) : null };
}

/**
 * Get all saved places for a user in a trip
 * Returns the places with their full details
 */
export async function getSavedPlaces(
  tripId: string,
  userId: string
): Promise<{
  data: Array<{
    id: string;
    name: string;
    address: string | null;
    lat: number | null;
    lng: number | null;
    category: string | null;
    place_id: string;
  }> | null;
  error: Error | null;
}> {
  const supabase = createClient();

  // First, get the saved place IDs
  const { data: savedPlacesData, error: savedError } = await supabase
    .from("saved_places")
    .select("place_id")
    .eq("trip_id", tripId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (savedError) {
    return { data: null, error: new Error(savedError.message) };
  }

  if (!savedPlacesData || savedPlacesData.length === 0) {
    return { data: [], error: null };
  }

  // Get all unique place IDs
  const placeIds = savedPlacesData.map((sp) => sp.place_id);

  // Fetch the places details
  const { data: placesData, error: placesError } = await supabase
    .from("places")
    .select("id, name, address, lat, lng, category")
    .in("id", placeIds);

  if (placesError) {
    return { data: null, error: new Error(placesError.message) };
  }

  // Create a map of place_id -> place for quick lookup
  const placesMap = new Map(
    (placesData || []).map((place) => [place.id, place])
  );

  // Transform the data to match the expected format, preserving order
  const transformedData = savedPlacesData
    .map((savedPlace) => {
      const place = placesMap.get(savedPlace.place_id);
      if (!place) return null;

      return {
        place_id: savedPlace.place_id,
        id: place.id,
        name: place.name,
        address: place.address,
        lat: place.lat,
        lng: place.lng,
        category: place.category,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return { data: transformedData, error: null };
}

/**
 * Get saved place IDs for a user in a trip as a Set
 * Useful for quick lookup to check if a place is saved
 */
export async function getSavedPlaceIds(
  tripId: string,
  userId: string
): Promise<{ data: Set<string> | null; error: Error | null }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("saved_places")
    .select("place_id")
    .eq("trip_id", tripId)
    .eq("user_id", userId);

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  const placeIds = new Set(data?.map((item) => item.place_id) || []);
  return { data: placeIds, error: null };
}

