import { createClient } from "@/lib/supabase/server";
import type { TripSegment, SegmentInput } from "@/types/trip-segments";

/**
 * Get all segments for a trip
 */
export async function getTripSegments(
  tripId: string
): Promise<{ data: TripSegment[] | null; error: Error | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("trip_segments")
      .select("*")
      .eq("trip_id", tripId)
      .order("order_index", { ascending: true });

    if (error) {
      return { data: null, error: error as Error };
    }

    return { data: data as TripSegment[], error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
}

/**
 * Create a new trip segment
 */
export async function createTripSegment(
  tripId: string,
  segmentData: SegmentInput,
  orderIndex: number
): Promise<{ data: TripSegment | null; error: Error | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await (supabase
      .from("trip_segments") as any)
      .insert({
        trip_id: tripId,
        order_index: orderIndex,
        city_place_id: segmentData.cityPlaceId,
        city_name: segmentData.cityName,
        start_date: segmentData.startDate,
        end_date: segmentData.endDate,
        transport_type: segmentData.transportType || null,
        notes: segmentData.notes || null,
      })
      .select()
      .single();

    if (error) {
      return { data: null, error: error as Error };
    }

    return { data: data as TripSegment, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
}

/**
 * Update a trip segment
 */
export async function updateTripSegment(
  segmentId: string,
  updates: Partial<SegmentInput & { orderIndex: number }>
): Promise<{ data: TripSegment | null; error: Error | null }> {
  try {
    const supabase = await createClient();
    const updateData: any = {};

    if (updates.cityPlaceId !== undefined) updateData.city_place_id = updates.cityPlaceId;
    if (updates.cityName !== undefined) updateData.city_name = updates.cityName;
    if (updates.startDate !== undefined) updateData.start_date = updates.startDate;
    if (updates.endDate !== undefined) updateData.end_date = updates.endDate;
    if (updates.transportType !== undefined) updateData.transport_type = updates.transportType;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.orderIndex !== undefined) updateData.order_index = updates.orderIndex;

    const { data, error } = await (supabase
      .from("trip_segments") as any)
      .update(updateData)
      .eq("id", segmentId)
      .select()
      .single();

    if (error) {
      return { data: null, error: error as Error };
    }

    return { data: data as TripSegment, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
}

/**
 * Delete a trip segment
 */
export async function deleteTripSegment(
  segmentId: string
): Promise<{ error: Error | null }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("trip_segments")
      .delete()
      .eq("id", segmentId);

    if (error) {
      return { error: error as Error };
    }

    return { error: null };
  } catch (err) {
    return {
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
}

