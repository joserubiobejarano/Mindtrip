import { createClient } from "@/lib/supabase/client";

export interface PlaceResult {
  id: string; // Google place_id
  name: string;
  address?: string;
  lat?: number;
  lng?: number;
  photoUrl?: string | null;
  types?: string[];
}

export interface SavedPlace {
  id: string;
  trip_id: string;
  place_id: string;
  name: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  photo_url: string | null;
  types: string[] | null;
  source: string;
  created_at: string;
}

/**
 * Save a place for a trip (for future itinerary generation)
 * Stores place data directly in saved_places table
 */
export async function savePlaceForTrip({
  tripId,
  place,
}: {
  tripId: string;
  place: PlaceResult;
}): Promise<{ error: Error | null }> {
  const supabase = createClient();

  // Check if already saved for this trip
  const { data: existing } = await supabase
    .from("saved_places")
    .select("id")
    .eq("trip_id", tripId)
    .eq("place_id", place.id)
    .maybeSingle();

  if (existing) {
    // Already saved, return success
    return { error: null };
  }

  // Insert new saved place
  const { error } = await (supabase.from("saved_places") as any).insert({
    trip_id: tripId,
    place_id: place.id,
    name: place.name,
    address: place.address || null,
    lat: place.lat || null,
    lng: place.lng || null,
    photo_url: place.photoUrl || null,
    types: place.types || null,
    source: "explore",
  });

  if (error) {
    console.error("Error saving place to saved_places:", {
      error,
      errorMessage: error.message,
      errorCode: error.code,
      errorDetails: error.details,
      errorHint: error.hint,
      tripId,
      placeId: place.id,
      placeName: place.name,
    });
    return { error: new Error(error.message || "Failed to save place") };
  }

  return { error: null };
}

/**
 * Get all saved places for a trip
 * Returns places stored for future itinerary generation
 */
export async function getSavedPlacesForTrip(
  tripId: string
): Promise<{
  data: SavedPlace[] | null;
  error: Error | null;
}> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("saved_places")
    .select("*")
    .eq("trip_id", tripId)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  return { data: data || [], error: null };
}

/**
 * Get saved place IDs for a trip as a Set
 * Useful for quick lookup to check if a place is saved
 */
export async function getSavedPlaceIdsForTrip(
  tripId: string
): Promise<{ data: Set<string> | null; error: Error | null }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("saved_places")
    .select("place_id")
    .eq("trip_id", tripId);

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  type SavedPlaceQueryResult = {
    place_id: string
    [key: string]: any
  }

  const dataTyped = (data || []) as SavedPlaceQueryResult[];
  const placeIds = new Set(dataTyped.map((item) => item.place_id));
  return { data: placeIds, error: null };
}

/**
 * Remove a saved place from a trip
 */
export async function removeSavedPlace(
  tripId: string,
  placeId: string
): Promise<{ error: Error | null }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("saved_places")
    .delete()
    .eq("trip_id", tripId)
    .eq("place_id", placeId);

  return { error: error ? new Error(error.message) : null };
}
