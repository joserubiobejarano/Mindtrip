import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

interface Trip {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  default_currency: string;
  owner_id: string;
  center_lat: number | null;
  center_lng: number | null;
  budget_level: string | null;
  daily_budget: number | null;
  interests: string[] | null;
  destination_name: string | null;
  destination_country: string | null;
  destination_place_id: string | null;
  find_accommodation: boolean | null;
  accommodation_address: string | null;
  auto_accommodation: any;
}

export function useTrip(tripId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["trip", tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .eq("id", tripId)
        .single();

      if (error) throw error;
      return data as Trip;
    },
  });
}

