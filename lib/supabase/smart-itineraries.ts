import { createClient } from "@/lib/supabase/server";
import type { AiItinerary } from "@/app/api/ai-itinerary/route";

/**
 * Get the smart itinerary for a trip
 */
export async function getSmartItinerary(
  tripId: string
): Promise<{ data: AiItinerary | null; error: Error | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("smart_itineraries")
      .select("content")
      .eq("trip_id", tripId)
      .maybeSingle();

    if (error) {
      return { data: null, error: error as Error };
    }

    return { data: data?.content as AiItinerary | null, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
}

/**
 * Upsert (insert or update) the smart itinerary for a trip
 */
export async function upsertSmartItinerary(
  tripId: string,
  content: AiItinerary
): Promise<{ error: Error | null }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("smart_itineraries")
      .upsert(
        {
          trip_id: tripId,
          content: content as any,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "trip_id",
        }
      );

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

