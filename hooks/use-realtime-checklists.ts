"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export function useRealtimeChecklists(tripId: string) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  useEffect(() => {
    // Subscribe to checklists changes
    const checklistsChannel = supabase
      .channel(`trip:${tripId}:checklists`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "checklists",
          filter: `trip_id=eq.${tripId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["checklists", tripId] });
        }
      )
      .subscribe();

    // Subscribe to checklist_items changes
    const itemsChannel = supabase
      .channel(`trip:${tripId}:checklist-items`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "checklist_items",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["checklists", tripId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(checklistsChannel);
      supabase.removeChannel(itemsChannel);
    };
  }, [tripId, queryClient, supabase]);
}

