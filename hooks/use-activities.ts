import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

interface Activity {
  id: string;
  day_id: string;
  place_id: string | null;
  title: string;
  start_time: string | null;
  end_time: string | null;
  notes: string | null;
  order_number: number;
  place?: {
    id: string;
    name: string;
    lat: number | null;
    lng: number | null;
    address: string | null;
  } | null;
}

export function useActivities(dayId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const { data, ...rest } = useQuery({
    queryKey: ["activities", dayId],
    queryFn: async () => {
      if (!dayId) {
        return [] as Activity[];
      }

      const { data, error } = await supabase
        .from("activities")
        .select(`
          *,
          place:places(id, name, lat, lng, address)
        `)
        .eq("day_id", dayId)
        .order("start_time", { ascending: true });

      if (error) {
        console.error("Error fetching activities:", error);
        throw error;
      }
      return (data || []) as Activity[];
    },
    enabled: !!dayId,
  });

  const createActivity = useMutation({
    mutationFn: async (activity: {
      day_id: string;
      place_id?: string | null;
      title: string;
      start_time?: string | null;
      end_time?: string | null;
      notes?: string | null;
      order_number: number;
    }) => {
      const { data, error } = await (supabase
        .from("activities") as any)
        .insert(activity)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities", dayId] });
    },
  });

  const updateActivity = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      title?: string;
      place_id?: string | null;
      start_time?: string | null;
      end_time?: string | null;
      notes?: string | null;
      order_number?: number;
    }) => {
      const { data, error } = await (supabase
        .from("activities") as any)
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities", dayId] });
    },
  });

  const deleteActivity = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("activities")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities", dayId] });
    },
  });

  return {
    activities: data || [],
    createActivity,
    updateActivity,
    deleteActivity,
    ...rest,
  };
}

