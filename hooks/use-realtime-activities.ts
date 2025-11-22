"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

interface Activity {
  id: string;
  day_id: string;
}

export function useRealtimeActivities(tripId: string) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  useEffect(() => {
    // Subscribe to activities changes for all days in the trip
    const channel = supabase
      .channel(`trip:${tripId}:activities`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "activities",
          filter: `day_id=in.(
            SELECT id FROM days WHERE trip_id = '${tripId}'
          )`,
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          // Invalidate activities query to refetch
          if (payload.new) {
            queryClient.invalidateQueries({
              queryKey: ["activities", (payload.new as Activity).day_id],
            });
          } else if (payload.old) {
            queryClient.invalidateQueries({
              queryKey: ["activities", (payload.old as Activity).day_id],
            });
          }
        }
      )
      .subscribe();

    // Subscribe to places changes for activities in the trip
    const placesChannel = supabase
      .channel(`trip:${tripId}:places`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "places",
        },
        () => {
          // Invalidate all activities queries to refetch with updated places
          queryClient.invalidateQueries({
            queryKey: ["activities"],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(placesChannel);
    };
  }, [tripId, queryClient, supabase]);
}

