"use client";

import { Button } from "@/components/ui/button";
import { useTrip } from "@/hooks/use-trip";
import { useDays } from "@/hooks/use-days";
import { useActivities } from "@/hooks/use-activities";
import { DaySelector } from "@/components/day-selector";
import { ActivityList } from "@/components/activity-list";
import { format } from "date-fns";
import { Download } from "lucide-react";

interface PublicItineraryPanelProps {
  tripId: string;
  selectedDayId: string | null;
  onSelectDay: (dayId: string) => void;
  onActivitySelect?: (activityId: string) => void;
}

export function PublicItineraryPanel({
  tripId,
  selectedDayId,
  onSelectDay,
  onActivitySelect,
}: PublicItineraryPanelProps) {
  const { data: trip, isLoading: tripLoading } = useTrip(tripId);
  const { data: days, isLoading: daysLoading } = useDays(tripId);
  const {
    activities,
    isLoading: activitiesLoading,
  } = useActivities(selectedDayId || "");

  const handleExportPDF = () => {
    window.print();
  };

  if (tripLoading || daysLoading) {
    return (
      <div className="p-6">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!trip || !days || days.length === 0) {
    return (
      <div className="p-6">
        <div className="text-muted-foreground">No trip data found</div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold">{trip.title}</h1>
            <p className="text-sm text-muted-foreground">
              {format(new Date(trip.start_date), "MMM d")} -{" "}
              {format(new Date(trip.end_date), "MMM d, yyyy")}
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleExportPDF}
            title="Export as PDF"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Day Selector */}
      <div className="mb-4">
        <DaySelector
          days={days}
          selectedDayId={selectedDayId}
          onSelectDay={onSelectDay}
        />
      </div>

      {/* Activities Section */}
      <div className="flex-1 overflow-y-auto">
        {selectedDayId ? (
          <ActivityList
            activities={activities}
            onEdit={() => {}}
            onDelete={() => {}}
            onSelect={(id) => {
              if (onActivitySelect) {
                onActivitySelect(id);
              }
            }}
          />
        ) : (
          <div className="text-sm text-muted-foreground py-8 text-center">
            Select a day to view activities
          </div>
        )}
      </div>
    </div>
  );
}

