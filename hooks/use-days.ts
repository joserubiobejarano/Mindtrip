import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

interface Day {
  id: string;
  trip_id: string;
  date: string;
  day_number: number;
}

export function useDays(tripId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["days", tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("days")
        .select("*")
        .eq("trip_id", tripId)
        .order("day_number", { ascending: true });

      if (error) throw error;
      return (data || []) as Day[];
    },
  });
}

