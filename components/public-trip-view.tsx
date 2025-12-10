"use client";

import { PublicItineraryPanel } from "@/components/public-itinerary-panel";
import { useState, useEffect } from "react";
import { useDays } from "@/hooks/use-days";
import { useTrip } from "@/hooks/use-trip";

interface PublicTripViewProps {
  tripId: string;
  slug: string;
}

export function PublicTripView({ tripId, slug }: PublicTripViewProps) {
  const { data: days } = useDays(tripId);
  const { data: trip } = useTrip(tripId);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);

  // Auto-select first day when days load
  useEffect(() => {
    if (days && days.length > 0 && !selectedDayId) {
      setSelectedDayId(days[0].id);
    }
  }, [days, selectedDayId]);

  if (!trip || !days) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="h-screen overflow-y-auto">
        <PublicItineraryPanel
          tripId={tripId}
          selectedDayId={selectedDayId}
          onSelectDay={setSelectedDayId}
          onActivitySelect={setSelectedActivityId}
        />
      </div>
    </div>
  );
}

