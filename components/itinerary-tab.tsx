"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Share2, Users, ArrowLeft } from "lucide-react";
import { useTrip } from "@/hooks/use-trip";
import { useDays } from "@/hooks/use-days";
import { useActivities } from "@/hooks/use-activities";
import { DaySelector } from "@/components/day-selector";
import { ActivityList } from "@/components/activity-list";
import { ActivityDialog } from "@/components/activity-dialog";
import { format } from "date-fns";
import { ShareTripDialog } from "@/components/share-trip-dialog";
import { TripMembersDialog } from "@/components/trip-members-dialog";
import { useRouter } from "next/navigation";

interface ItineraryTabProps {
  tripId: string;
  userId: string;
  selectedDayId: string | null;
  onSelectDay: (dayId: string) => void;
  onActivitySelect?: (activityId: string) => void;
}

export function ItineraryTab({
  tripId,
  userId,
  selectedDayId,
  onSelectDay,
  onActivitySelect,
}: ItineraryTabProps) {
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<any>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const router = useRouter();

  const { data: trip, isLoading: tripLoading } = useTrip(tripId);
  const { data: days, isLoading: daysLoading } = useDays(tripId);
  const {
    activities,
    createActivity,
    updateActivity,
    deleteActivity,
    isLoading: activitiesLoading,
  } = useActivities(selectedDayId || "");

  const handleAddActivity = () => {
    setEditingActivity(null);
    setActivityDialogOpen(true);
  };

  const handleEditActivity = (activityId: string) => {
    const activity = activities.find((a) => a.id === activityId);
    setEditingActivity(activity);
    setActivityDialogOpen(true);
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (confirm("Are you sure you want to delete this activity?")) {
      await deleteActivity.mutateAsync(activityId);
    }
  };

  const handleSubmitActivity = async (activityData: any) => {
    if (!selectedDayId) return;

    const maxOrder = Math.max(
      0,
      ...activities.map((a) => a.order_number || 0)
    );

    if (editingActivity) {
      await updateActivity.mutateAsync({
        id: editingActivity.id,
        ...activityData,
      });
    } else {
      await createActivity.mutateAsync({
        ...activityData,
        day_id: selectedDayId,
        order_number: maxOrder + 1,
      });
    }

    setActivityDialogOpen(false);
    setEditingActivity(null);
  };

  const handleSelectActivity = (activityId: string) => {
    if (onActivitySelect) {
      onActivitySelect(activityId);
    }
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
    <div className="p-6 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/trips")}
              className="mb-2 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to trips
            </Button>
            <h1 className="text-2xl font-bold">{trip.title}</h1>
            <p className="text-sm text-muted-foreground">
              {format(new Date(trip.start_date), "MMM d")} -{" "}
              {format(new Date(trip.end_date), "MMM d, yyyy")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setMembersDialogOpen(true)}
              title="Trip Members"
            >
              <Users className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShareDialogOpen(true)}
              title="Share Trip"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
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
        <div className="mb-4">
          <Button onClick={handleAddActivity} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Activity
          </Button>
        </div>

        {selectedDayId ? (
          <ActivityList
            activities={activities}
            onEdit={handleEditActivity}
            onDelete={handleDeleteActivity}
            onSelect={handleSelectActivity}
          />
        ) : (
          <div className="text-sm text-muted-foreground py-8 text-center">
            Select a day to view activities
          </div>
        )}
      </div>

      {/* Dialogs */}
      {selectedDayId && (
        <ActivityDialog
          open={activityDialogOpen}
          onOpenChange={setActivityDialogOpen}
          onSubmit={handleSubmitActivity}
          initialData={editingActivity}
          dayId={selectedDayId}
        />
      )}

      <ShareTripDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        tripId={tripId}
      />

      <TripMembersDialog
        open={membersDialogOpen}
        onOpenChange={setMembersDialogOpen}
        tripId={tripId}
        userId={userId}
      />
    </div>
  );
}

