import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

interface ActivityPlace {
  id: string;
  name: string;
  external_id: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
}

interface Activity {
  id: string;
  day_id: string;
  place_id: string | null;
  title: string;
  start_time: string | null;
  end_time: string | null;
  notes: string | null;
  order_number: number;
  image_url?: string | null;
  place?: ActivityPlace | null;
}

/**
 * Hook to fetch all activities with places for an entire trip
 * Returns a flat array of all activities across all days
 */
export function useTripActivities(tripId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["trip-activities", tripId],
    queryFn: async () => {
      if (!tripId) {
        return [] as Activity[];
      }

      // First, get all days for the trip
      const { data: days, error: daysError } = await supabase
        .from("days")
        .select("id")
        .eq("trip_id", tripId);

      if (daysError) {
        console.error("[use-trip-activities] Error fetching days:", daysError);
        throw daysError;
      }

      if (!days || days.length === 0) {
        return [] as Activity[];
      }

      const dayIds = days.map((day) => day.id);

      // Fetch all activities for all days with place data including external_id
      const { data: activities, error: activitiesError } = await supabase
        .from("activities")
        .select(`
          *,
          place:places(id, name, external_id, address, lat, lng)
        `)
        .in("day_id", dayIds)
        .order("day_id", { ascending: true })
        .order("start_time", { ascending: true });

      if (activitiesError) {
        console.error("[use-trip-activities] Error fetching activities:", activitiesError);
        throw activitiesError;
      }

      return (activities || []) as Activity[];
    },
    enabled: !!tripId,
    staleTime: 30 * 1000, // 30 seconds - activities can change frequently
  });
}
