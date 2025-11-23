"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Share2, Users, ArrowLeft, Hotel, MoreVertical, Trash2 } from "lucide-react";
import { useTrip } from "@/hooks/use-trip";
import { useDays } from "@/hooks/use-days";
import { useActivities } from "@/hooks/use-activities";
import { DaySelector } from "@/components/day-selector";
import { ActivityList } from "@/components/activity-list";
import { ActivityDialog } from "@/components/activity-dialog";
import { format } from "date-fns";
import { ShareTripDialog } from "@/components/share-trip-dialog";
import { TripMembersDialog } from "@/components/trip-members-dialog";
import { DeleteTripDialog } from "@/components/delete-trip-dialog";
import { useRouter } from "next/navigation";
import { getDayRoute, RouteLeg } from "@/lib/mapboxDirections";
import { addActivitiesForDay } from "@/lib/supabase/activities";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import type { PlannedActivity } from "@/types/ai";

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const [routeLegs, setRouteLegs] = useState<RouteLeg[]>([]);
  const [autoPlanning, setAutoPlanning] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const settingsMenuRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const { data: trip, isLoading: tripLoading } = useTrip(tripId);
  const { data: days, isLoading: daysLoading } = useDays(tripId);
  const {
    activities,
    createActivity,
    updateActivity,
    deleteActivity,
    isLoading: activitiesLoading,
  } = useActivities(selectedDayId || "");

  // Fetch route legs when activities change
  useEffect(() => {
    if (!activities || activities.length === 0) {
      setRouteLegs([]);
      return;
    }

    // Transform activities to match getDayRoute's expected format
    // Filter out activities without valid coordinates
    const activitiesWithValidPlaces = activities
      .filter(
        (activity) =>
          activity.place &&
          activity.place.lat != null &&
          activity.place.lng != null &&
          !isNaN(activity.place.lat) &&
          !isNaN(activity.place.lng)
      )
      .map((activity) => ({
        id: activity.id,
        place: {
          lat: activity.place!.lat!,
          lng: activity.place!.lng!,
        },
      }));

    if (activitiesWithValidPlaces.length < 2) {
      setRouteLegs([]);
      return;
    }

    getDayRoute(activitiesWithValidPlaces).then((result) => {
      setRouteLegs(result.legs);
    });
  }, [activities]);

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

  const handleAutoPlanDay = async () => {
    if (!selectedDayId) return;

    setAutoPlanning(true);
    try {
      const response = await fetch("/api/ai/plan-day", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tripId,
          dayId: selectedDayId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        const errorMessage = error.error || "Failed to plan day";
        console.error("Error auto-planning day:", error);
        addToast({
          variant: "destructive",
          title: "Failed to auto-plan day",
          description: errorMessage,
        });
        return;
      }

      const { activities } = await response.json() as { activities: PlannedActivity[] };

      if (activities && activities.length > 0) {
        await addActivitiesForDay(selectedDayId, activities);
        // Refresh activities
        queryClient.invalidateQueries({ queryKey: ["activities", selectedDayId] });
        
        const day = days?.find((d) => d.id === selectedDayId);
        const dateStr = day ? format(new Date(day.date), "MMM d, yyyy") : "this day";
        addToast({
          variant: "success",
          title: "Day planned successfully",
          description: `Planned ${activities.length} activities for ${dateStr}`,
        });
      } else {
        addToast({
          variant: "default",
          title: "No activities generated",
          description: "The AI couldn't generate activities for this day. Try again or add activities manually.",
        });
      }
    } catch (error) {
      console.error("Error auto-planning day:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to auto-plan this day. Please try again.";
      addToast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setAutoPlanning(false);
    }
  };

  const handleDeleteTrip = async () => {
    if (!trip) return;

    try {
      // Delete the trip - related rows will be deleted via CASCADE
      const { error } = await supabase
        .from("trips")
        .delete()
        .eq("id", tripId);

      if (error) throw error;

      router.push("/trips");
    } catch (error) {
      console.error("Error deleting trip:", error);
      addToast({
        variant: "destructive",
        title: "Failed to delete trip",
        description: "Please try again.",
      });
    }
  };

  // Close settings menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
        setSettingsMenuOpen(false);
      }
    };

    if (settingsMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [settingsMenuOpen]);

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
            <h1 className="text-2xl font-bold">{trip.title}</h1>
            <p className="text-sm text-muted-foreground">
              {format(new Date(trip.start_date), "MMM d")} -{" "}
              {format(new Date(trip.end_date), "MMM d, yyyy")}
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <Button
              variant="outline"
              onClick={() => setMembersDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              <span>Tripmates</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShareDialogOpen(true)}
              title="Share Trip"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            {trip.owner_id === userId && (
              <div className="relative" ref={settingsMenuRef}>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSettingsMenuOpen(!settingsMenuOpen)}
                  title="Trip Settings"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
                {settingsMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-background border rounded-md shadow-lg z-10">
                    <button
                      onClick={() => {
                        setSettingsMenuOpen(false);
                        setDeleteDialogOpen(true);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-muted flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete trip
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Book Hotels Card */}
      {trip.start_date && trip.end_date && (
        <div className="mb-4">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Hotel className="h-5 w-5" />
                Need a place to stay?
              </CardTitle>
              <CardDescription>
                Search hotels for your trip dates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => {
                  const city = trip.destination_name || trip.title;
                  const startDate = new Date(trip.start_date);
                  const endDate = new Date(trip.end_date);
                  const checkin = format(startDate, "yyyy-MM-dd");
                  const checkout = format(endDate, "yyyy-MM-dd");
                  const url = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(city)}&checkin=${checkin}&checkout=${checkout}`;
                  window.open(url, "_blank", "noopener,noreferrer");
                }}
                className="w-full sm:w-auto"
              >
                Search hotels
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

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
        <div className="mb-4 flex gap-2 flex-wrap">
          <Button onClick={handleAddActivity} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Activity
          </Button>
          {selectedDayId && (
            <Button
              onClick={handleAutoPlanDay}
              size="sm"
              variant="outline"
              disabled={autoPlanning}
            >
              <span className="mr-2">✨</span>
              {autoPlanning ? "Planning..." : "Auto-plan this day"}
            </Button>
          )}
        </div>

        {selectedDayId ? (
          <ActivityList
            activities={activities}
            routeLegs={routeLegs}
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

      <DeleteTripDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteTrip}
        tripTitle={trip.title}
      />
    </div>
  );
}

