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
  image_url?: string | null;
  place?: {
    id: string;
    name: string;
    lat: number | null;
    lng: number | null;
    address: string | null;
  } | null;
}

/**
 * Validates if a string is a valid UUID v4 format
 * UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx where y is 8, 9, A, or B
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
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

      // Validate that dayId is a valid UUID before querying
      if (!isValidUUID(dayId)) {
        console.warn(
          `[use-activities] Invalid UUID provided for dayId: "${dayId}". Expected a valid UUID v4 format. Skipping query and returning empty list.`
        );
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
      
      // Console log to verify image_url persistence
      if (data && data.length > 0) {
        const sample = data[0] as Activity;
        console.log('[Activities] Sample activity loaded:', {
          id: sample.id,
          title: sample.title,
          image_url: sample.image_url
        });
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
      image_url?: string | null;
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
      image_url?: string | null;
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

