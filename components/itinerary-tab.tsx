"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Share2, Users, ArrowLeft, MoreVertical, Trash2, Loader2, Send, MapPin, Star, Check, X } from "lucide-react";
import { useTrip } from "@/hooks/use-trip";
import { useDays } from "@/hooks/use-days";
import { useActivities } from "@/hooks/use-activities";
import { DaySelector } from "@/components/day-selector";
import { ActivityList } from "@/components/activity-list";
import { ActivityDialog } from "@/components/activity-dialog";
import { format, formatDistanceToNow } from "date-fns";
import { ShareTripDialog } from "@/components/share-trip-dialog";
import { TripMembersDialog } from "@/components/trip-members-dialog";
import { DeleteTripDialog } from "@/components/delete-trip-dialog";
import { HotelSearchBanner } from "@/components/hotel-search-banner";
import { useRouter } from "next/navigation";
import { getDayRoute, RouteLeg } from "@/lib/mapboxDirections";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import type { AiItinerary, ActivitySuggestion } from "@/app/api/ai-itinerary/route";
import { TripAssistantPanel } from "@/components/trip-assistant-panel";

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
  const [smartItinerary, setSmartItinerary] = useState<AiItinerary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { addToast } = useToast();
  const settingsMenuRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const [visitedPlaces, setVisitedPlaces] = useState<Set<string>>(new Set());

  const { data: trip, isLoading: tripLoading } = useTrip(tripId);
  const { data: days, isLoading: daysLoading } = useDays(tripId);
  const {
    activities,
    createActivity,
    updateActivity,
    deleteActivity,
    isLoading: activitiesLoading,
  } = useActivities(selectedDayId || "");

  // Load itinerary from smart_itineraries table - fetch only once per tripId
  // The GET endpoint will return existing itinerary or generate one if missing (idempotent)
  // Response shape: { id, trip_id, content, created_at }
  useEffect(() => {
    if (!tripId) return;

    let cancelled = false;

    const loadItinerary = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/trips/${tripId}/smart-itinerary`);

        if (cancelled) return;

        if (!res.ok) {
          throw new Error('Failed to load smart itinerary');
        }

        const data = await res.json();
        if (cancelled) return;

        // Extract content from the response (data.content is the jsonb object)
        if (!cancelled && data && data.content) {
          setSmartItinerary(data.content);
        }
      } catch (err) {
        console.error('[smart-itinerary] frontend error', err);
        if (!cancelled) {
          setError('We couldn\'t load your itinerary. Please try again.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadItinerary();

    return () => {
      cancelled = true;
    };
  }, [tripId]);

  // Note: The itinerary is now loaded automatically via the GET endpoint above
  // which will return existing itinerary or generate one if missing (idempotent).

  // Fetch route legs when activities change (only relevant for manual view)
  useEffect(() => {
    if (!activities || activities.length === 0) {
      setRouteLegs([]);
      return;
    }

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
    <div className="p-6 h-full flex flex-col overflow-hidden bg-gray-50/50">
      {/* Hotel & Flight Boxes - positioned right below tabs */}
      {trip.start_date && trip.end_date && (
        <HotelSearchBanner tripId={tripId} className="mb-6" compact={true} />
      )}

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

      {/* Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto pr-2">
        
        {/* Loading State Card - only show when loading and no itinerary exists */}
        {isLoading && !smartItinerary && !error && (
          <Card className="mb-6 border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg rounded-2xl">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-purple-600 mb-4" />
              <h3 className="text-lg font-bold text-purple-900">
                We&apos;re crafting your story-like itinerary...
              </h3>
              <p className="text-sm text-purple-700 mt-2 max-w-sm text-center">
                Using AI to find the best spots, photos, and schedule for your trip.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Error State - show friendly message in the same style as loading */}
        {error && !smartItinerary && (
          <Card className="mb-6 border-2 border-red-300 bg-gradient-to-br from-red-50 to-red-100 shadow-lg rounded-2xl">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-base font-medium text-red-900 text-center">
                {error || "We couldn't load your itinerary. Please refresh the page or try again later."}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Smart Itinerary View */}
        {smartItinerary && smartItinerary.days && smartItinerary.days.length > 0 ? (
          <div className="space-y-8 pb-10">
            {/* Intro Card */}
            <Card className="bg-gradient-to-br from-white to-gray-50 border-none shadow-sm ring-1 ring-black/5">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                  {smartItinerary.tripTitle}
                </CardTitle>
                <CardDescription className="text-lg leading-relaxed text-gray-700">
                  {smartItinerary.summary}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Days */}
            {smartItinerary.days.map((day, dayIdx) => {
              // Use heroImages if available, otherwise extract from activities
              const heroImages = (day as any).heroImages || [];
              const displayPhotos = heroImages.slice(0, 6);

              return (
                <Card key={dayIdx} className="overflow-hidden border-none shadow-md ring-1 ring-black/5">
                  <CardHeader className="bg-white border-b pb-4">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-2">
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900">
                          Day {dayIdx + 1} – {day.title}
                        </CardTitle>
                        <CardDescription className="text-base mt-1 font-medium text-primary/80">
                          {format(new Date(day.date), "EEEE, MMMM d")} • {day.theme}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-0">
                    {/* Photo Strip */}
                    {displayPhotos.length > 0 && (
                      <div className="w-full h-40 flex overflow-x-auto scrollbar-hide bg-gray-100">
                        {displayPhotos.map((photoUrl: string, idx: number) => (
                          <div key={idx} className="relative h-full min-w-[200px] flex-1 first:pl-0">
                            <Image
                              src={photoUrl}
                              alt={`Day ${dayIdx + 1} photo ${idx + 1}`}
                              fill
                              className="object-cover border-r border-white/20"
                              unoptimized
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Day Summary */}
                    {(day as any).summary && (
                      <div className="p-6 bg-white border-b">
                        <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-slate-700">
                          {(day as any).summary}
                        </p>
                      </div>
                    )}

                    <div className="p-6 space-y-8 bg-white">
                      {day.sections?.map((section, sectionIdx) => {
                        // Handle both old format (suggestions) and new format (activities)
                        const activities = (section as any).activities || section.suggestions || [];
                        const partOfDay = section.partOfDay || (section as any).label || "Morning";
                        
                        return (
                          <div key={sectionIdx} className="relative pl-4 border-l-2 border-gray-100">
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary/20 border-2 border-white ring-1 ring-primary/40" />
                            
                            <h4 className="font-bold text-lg text-gray-900 mb-2">
                              {partOfDay}
                            </h4>
                            
                            {/* Section Description */}
                            {section.description && (
                              <p className="text-sm text-gray-600 mb-4 leading-relaxed max-w-3xl">
                                {section.description}
                              </p>
                            )}
                            
                            <div className="space-y-3">
                              {activities?.map((activity: any, actIdx: number) => {
                                const activityObj = isActivitySuggestion(activity) ? activity : {
                                  title: typeof activity === 'string' ? activity : activity.name || activity.title,
                                  description: activity.description || null,
                                  photoUrl: activity.photoUrl || null,
                                  goodFor: activity.goodFor || null,
                                  alreadyVisited: activity.alreadyVisited || false,
                                } as ActivitySuggestion;
                                
                                const title = activityObj.title;
                                const description = activityObj.description;
                                const goodFor = activityObj.goodFor;
                                const photoUrl = activityObj.photoUrl;
                                const placeKey = `${dayIdx}-${sectionIdx}-${actIdx}`;
                                const isVisited = visitedPlaces.has(placeKey) || activityObj.alreadyVisited;

                                return (
                                  <div 
                                    key={actIdx} 
                                    className={`flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group ${isVisited ? 'opacity-60' : ''}`}
                                  >
                                    {photoUrl ? (
                                      <div className="relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden shadow-sm">
                                        <Image
                                          src={photoUrl}
                                          alt={title}
                                          fill
                                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                                          unoptimized
                                        />
                                      </div>
                                    ) : (
                                      <div className="flex-shrink-0 w-16 h-16 rounded-md bg-gray-100 flex items-center justify-center text-gray-400 shadow-sm">
                                        <MapPin size={20} />
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0 py-1">
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                          <h5 className="font-semibold text-gray-900 flex items-center gap-2">
                                            {title}
                                            {isVisited && <Check className="h-4 w-4 text-green-600" />}
                                          </h5>
                                          {description && (
                                            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                                              {description}
                                            </p>
                                          )}
                                          {goodFor && (
                                            <p className="text-xs text-primary mt-2 font-medium">
                                              {goodFor}
                                            </p>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={async () => {
                                              const newVisited = !isVisited;
                                              setVisitedPlaces(prev => {
                                                const next = new Set(prev)
                                                if (newVisited) {
                                                  next.add(placeKey)
                                                } else {
                                                  next.delete(placeKey)
                                                }
                                                return next
                                              });
                                              
                                              // Update itinerary state
                                              const updatedItinerary = { ...smartItinerary! };
                                              const day = updatedItinerary.days[dayIdx];
                                              const section = day.sections[sectionIdx];
                                              if ((section as any).activities) {
                                                (section as any).activities[actIdx].alreadyVisited = newVisited;
                                              }
                                              setSmartItinerary(updatedItinerary);
                                              
                                              // Persist to backend
                                              try {
                                                await fetch(`/api/trips/${tripId}/smart-itinerary`, {
                                                  method: 'PATCH',
                                                  headers: { 'Content-Type': 'application/json' },
                                                  body: JSON.stringify({ itinerary: updatedItinerary }),
                                                });
                                              } catch (error) {
                                                console.error('Error updating itinerary:', error);
                                              }
                                            }}
                                            title={isVisited ? "Mark as not visited" : "Mark as visited"}
                                          >
                                            {isVisited ? (
                                              <Check className="h-4 w-4 text-green-600" />
                                            ) : (
                                              <Check className="h-4 w-4 text-gray-400" />
                                            )}
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-gray-400 hover:text-destructive"
                                            onClick={async () => {
                                              // Remove from day - update local state
                                              const updatedItinerary = { ...smartItinerary! };
                                              const day = updatedItinerary.days[dayIdx];
                                              const section = day.sections[sectionIdx];
                                              
                                              if ((section as any).activities) {
                                                (section as any).activities = (section as any).activities.filter((_: any, idx: number) => idx !== actIdx);
                                              } else if (section.suggestions) {
                                                section.suggestions = section.suggestions.filter((_, idx) => idx !== actIdx);
                                              }
                                              
                                              setSmartItinerary(updatedItinerary);
                                              
                                              // Persist to backend
                                              try {
                                                await fetch(`/api/trips/${tripId}/smart-itinerary`, {
                                                  method: 'PATCH',
                                                  headers: { 'Content-Type': 'application/json' },
                                                  body: JSON.stringify({ itinerary: updatedItinerary }),
                                                });
                                              } catch (error) {
                                                console.error('Error updating itinerary:', error);
                                              }
                                            }}
                                            title="Remove from day"
                                          >
                                            <X className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                            
                            {section.seasonalNotes && (
                              <div className="mt-4 text-xs text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-100 inline-block">
                                ✨ {section.seasonalNotes}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : !isLoading && !error ? (
          // Empty state - no itinerary yet
          <Card className="mb-6 border-2 border-gray-200 bg-white shadow-sm rounded-2xl">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-base font-medium text-gray-700 text-center">
                No itinerary yet. Try generating one or adding activities.
              </p>
            </CardContent>
          </Card>
        ) : (
          // Fallback / Manual View
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Daily Activities</h3>
              <Button 
                onClick={handleAddActivity} 
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 text-white border-2 border-black rounded-xl"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Activity
              </Button>
            </div>
            
            <DaySelector
              days={days}
              selectedDayId={selectedDayId}
              onSelectDay={onSelectDay}
            />
            
            {selectedDayId ? (
              <ActivityList
                activities={activities}
                routeLegs={routeLegs}
                onEdit={handleEditActivity}
                onDelete={handleDeleteActivity}
                onSelect={handleSelectActivity}
              />
            ) : (
              <div className="text-sm text-muted-foreground py-12 text-center bg-white rounded-lg border border-dashed">
                Select a day to view activities
              </div>
            )}
          </div>
        )}
        </div>

        {/* Trip Assistant Panel - Bottom of Itinerary Tab */}
        <TripAssistantPanel tripId={tripId} />
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
