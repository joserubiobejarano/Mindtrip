"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { TripLayout } from "@/components/trip-layout";
import { TripTabs } from "@/components/trip-tabs";
import { MapPanel } from "@/components/map-panel";
import { useDays } from "@/hooks/use-days";
import { useRealtimeActivities } from "@/hooks/use-realtime-activities";

export function TripDetail({ tripId }: { tripId: string }) {
  const { user } = useUser();
  const userId = user?.id;
  const { data: days } = useDays(tripId);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);

  // Enable realtime sync for activities
  useRealtimeActivities(tripId);

  // Auto-select first day when days load
  useEffect(() => {
    if (days && days.length > 0 && !selectedDayId) {
      setSelectedDayId(days[0].id);
    }
  }, [days, selectedDayId]);

  if (!userId) {
    return <div>Please sign in to view this trip.</div>;
  }

  return (
    <TripLayout
      leftPanel={
        <TripTabs
          tripId={tripId}
          userId={userId}
          selectedDayId={selectedDayId}
          onSelectDay={setSelectedDayId}
          onActivitySelect={setSelectedActivityId}
        />
      }
      rightPanel={
        <MapPanel
          tripId={tripId}
          selectedDayId={selectedDayId}
          selectedActivityId={selectedActivityId}
        />
      }
    />
  );
}

