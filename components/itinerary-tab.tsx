"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Share2, Users, ArrowLeft, MoreVertical, Trash2 } from "lucide-react";
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
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import type { AiItinerary, ActivitySuggestion } from "@/app/api/ai-itinerary/route";

/**
 * Get a human-readable "good for" label based on place types
 * Reused from Explore tab
 */
function getGoodForLabel(types: string[] | undefined): string | null {
  if (!types || types.length === 0) return null;

  const t = types;

  if (t.includes("park") || t.includes("tourist_attraction")) {
    return "Ideal if you like parks and nature";
  }
  if (t.includes("museum") || t.includes("art_gallery")) {
    return "Ideal if you enjoy art and museums";
  }
  if (t.includes("restaurant") || t.includes("cafe")) {
    return "Great if you love food spots";
  }
  if (t.includes("bar") || t.includes("night_club")) {
    return "Nice if you like nightlife";
  }
  if (t.includes("shopping_mall") || t.includes("store")) {
    return "Perfect if you like shopping";
  }

  return null;
}

/**
 * Check if a suggestion is an ActivitySuggestion object
 */
function isActivitySuggestion(suggestion: string | ActivitySuggestion): suggestion is ActivitySuggestion {
  return typeof suggestion === 'object' && suggestion !== null && 'title' in suggestion;
}

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
  const [aiItinerary, setAiItinerary] = useState<AiItinerary | null>(null);
  const [loadingAiItinerary, setLoadingAiItinerary] = useState(false);
  const [aiItineraryError, setAiItineraryError] = useState<string | null>(null);
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
        </div>

        {/* Smart Itinerary Section */}
        <div className="mb-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-1">Smart itinerary</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Get a season-aware, story-like itinerary for your whole trip.
            </p>
            {!aiItinerary && (
              <Button
                onClick={async () => {
                  setLoadingAiItinerary(true);
                  setAiItineraryError(null);
                  try {
                    const response = await fetch("/api/ai-itinerary", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ tripId }),
                    });

                    if (!response.ok) {
                      const error = await response.json();
                      throw new Error(error.error || "Failed to generate itinerary");
                    }

                    const { itinerary } = await response.json();
                    setAiItinerary(itinerary);
                  } catch (error) {
                    console.error("Error generating AI itinerary:", error);
                    setAiItineraryError(
                      error instanceof Error
                        ? error.message
                        : "Failed to generate itinerary. Please try again."
                    );
                  } finally {
                    setLoadingAiItinerary(false);
                  }
                }}
                disabled={loadingAiItinerary}
                size="sm"
              >
                {loadingAiItinerary ? "Generating..." : "Generate smart itinerary"}
              </Button>
            )}
          </div>

          {aiItineraryError && (
            <div className="text-sm text-destructive p-3 bg-destructive/10 rounded-md border border-destructive/20 mb-4">
              {aiItineraryError}
            </div>
          )}

          {aiItinerary && (
            <div className="space-y-6 bg-muted/30 p-6 rounded-lg border">
              {/* Hero card for trip title and description */}
              <Card className="bg-muted/50 border-2">
                <CardHeader>
                  <CardTitle className="text-2xl mb-2">{aiItinerary.tripTitle}</CardTitle>
                  <CardDescription className="text-base">{aiItinerary.summary}</CardDescription>
                </CardHeader>
              </Card>

              {/* Day sections */}
              {aiItinerary.days.map((day, dayIdx) => {
                // Extract all activities with photos from this day
                const activitiesWithPhotos: ActivitySuggestion[] = []
                day.sections.forEach(section => {
                  section.suggestions.forEach(suggestion => {
                    if (isActivitySuggestion(suggestion) && suggestion.photoUrl) {
                      activitiesWithPhotos.push(suggestion)
                    }
                  })
                })

                return (
                  <Card key={dayIdx} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-bold">
                        Day {dayIdx + 1} – {day.title}
                      </CardTitle>
                      <CardDescription>
                        {format(new Date(day.date), "EEEE, MMMM d, yyyy")} • {day.theme}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Image grid for activities with photos */}
                      {activitiesWithPhotos.length > 0 && (
                        <div className="mb-3 flex gap-2 overflow-x-auto pb-2">
                          {activitiesWithPhotos.map((activity, imgIdx) => (
                            <img
                              key={imgIdx}
                              src={activity.photoUrl!}
                              alt={activity.title}
                              className="h-24 w-36 rounded-lg object-cover flex-shrink-0"
                            />
                          ))}
                        </div>
                      )}

                      {day.sections.map((section, sectionIdx) => (
                        <div
                          key={sectionIdx}
                          className={sectionIdx < day.sections.length - 1 ? "pb-4 border-b" : ""}
                        >
                          <h4 className="font-bold text-base mb-2">{section.partOfDay}</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            {section.description}
                          </p>
                          {section.suggestions.length > 0 && (
                            <ul className="list-disc list-inside space-y-2 text-sm text-foreground ml-4">
                              {section.suggestions.map((suggestion, sugIdx) => {
                                const activity = isActivitySuggestion(suggestion) ? suggestion : null
                                const title = activity ? activity.title : String(suggestion)
                                const goodFor = activity?.goodFor

                                return (
                                  <li key={sugIdx} className="space-y-1">
                                    <span>{title}</span>
                                    {goodFor && (
                                      <div className="text-xs text-muted-foreground ml-4 italic">
                                        {goodFor}
                                      </div>
                                    )}
                                  </li>
                                )
                              })}
                            </ul>
                          )}
                          {section.seasonalNotes && (
                            <p className="text-xs text-muted-foreground mt-3 italic">
                              {section.seasonalNotes}
                            </p>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Divider */}
        {aiItinerary && (
          <div className="my-6 border-t">
            <h2 className="text-xl font-semibold mt-6 mb-4">Your itinerary</h2>
          </div>
        )}

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

