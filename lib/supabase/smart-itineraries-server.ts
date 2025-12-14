import { createClient } from '@/lib/supabase/server';

/**
 * Get a smart itinerary for a trip (trip-level, not segment-specific)
 * Returns the content field from the smart_itineraries table
 */
export async function getSmartItinerary(
  tripId: string
): Promise<{ data: any | null; error: Error | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('smart_itineraries')
    .select('content')
    .eq('trip_id', tripId)
    .is('trip_segment_id', null)
    .maybeSingle();

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  type ItineraryQueryResult = {
    content: any
  }

  const dataTyped = data as ItineraryQueryResult | null;
  return { data: dataTyped?.content || null, error: null };
}

/**
 * Upsert a smart itinerary for a trip
 * If trip_segment_id is provided, saves segment-specific itinerary
 * Otherwise, saves trip-level itinerary
 */
export async function upsertSmartItinerary(
  tripId: string,
  itinerary: any,
  trip_segment_id?: string | null
): Promise<{ error: Error | null }> {
  const supabase = await createClient();

  // Check if an itinerary already exists
  let query = supabase
    .from('smart_itineraries')
    .select('id')
    .eq('trip_id', tripId);

  if (trip_segment_id !== undefined && trip_segment_id !== null) {
    query = query.eq('trip_segment_id', trip_segment_id);
  } else {
    query = query.is('trip_segment_id', null);
  }

  const { data: existing } = await query.maybeSingle();

  const payload: {
    trip_id: string;
    content: any;
    trip_segment_id?: string | null;
  } = {
    trip_id: tripId,
    content: itinerary,
  };

  if (trip_segment_id !== undefined) {
    payload.trip_segment_id = trip_segment_id || null;
  }

  type ExistingQueryResult = {
    id: string
    [key: string]: any
  }

  const existingTyped = existing as ExistingQueryResult | null;

  let error;
  if (existingTyped) {
    // Update existing record
    const { error: updateError } = await (supabase
      .from('smart_itineraries') as any)
      .update({ content: itinerary })
      .eq('id', existingTyped.id);
    error = updateError;
  } else {
    // Insert new record
    const { error: insertError } = await (supabase
      .from('smart_itineraries') as any)
      .insert(payload);
    error = insertError;
  }

  if (error) {
    return { error: new Error(error.message) };
  }

  return { error: null };
}

