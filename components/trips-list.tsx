"use client";

import { useEffect, useState, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { NewTripDialog } from "@/components/new-trip-dialog";
import { DeleteTripDialog } from "@/components/delete-trip-dialog";
import { format, startOfToday } from "date-fns";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { getTripUrl } from "@/lib/routes";
import { useLanguage } from "@/components/providers/language-provider";

interface Trip {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  default_currency: string;
  created_at: string;
  owner_id: string;
}

export function TripsList() {
  const { user } = useUser();
  const userId = user?.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null);
  const [showPastTrips, setShowPastTrips] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const { addToast } = useToast();
  const supabase = createClient();
  const { t } = useLanguage();

  useEffect(() => {
    if (userId) {
      // Link trip invitations first, then fetch trips
      linkTripInvitations().then((linkedTripIds) => {
        // If any trips were linked, refresh the list
        if (linkedTripIds.length > 0) {
          fetchTrips();
        } else {
          fetchTrips();
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Fetch profileId from Supabase using Clerk user ID
  useEffect(() => {
    if (!userId) {
      setProfileId(null);
      return;
    }

    const fetchProfileId = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id")
          .eq("clerk_user_id", userId)
          .single<{ id: string }>();

        if (error && error.code !== "PGRST116") {
          // PGRST116 is "not found" - that's okay, profile might not exist yet
          console.error("Error fetching profile:", error);
          return;
        }

        if (data) {
          setProfileId(data.id);
        }
      } catch (error) {
        console.error("Error fetching profileId:", error);
      }
    };

    fetchProfileId();
  }, [userId, supabase]);

  const linkTripInvitations = async (): Promise<string[]> => {
    try {
      const response = await fetch("/api/user/link-trip-invitations", {
        method: "POST",
      });

      if (!response.ok) {
        console.error("Error linking trip invitations: response not ok");
        return [];
      }

      const data = await response.json();
      return data.linkedTripIds || [];
    } catch (error) {
      console.error("Error linking trip invitations:", error);
      // Don't block trip fetching if this fails
      return [];
    }
  };

  const fetchTrips = async () => {
    if (!userId) return;
    
    try {
      // Use API endpoint that uses profileId (UUID) instead of userId (Clerk ID)
      const response = await fetch('/api/trips', {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch trips');
      }

      const data = await response.json();
      setTrips(data.trips || []);
    } catch (error) {
      console.error("Error fetching trips:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle redirect after linking invitations
  useEffect(() => {
    const handleInviteRedirect = async () => {
      if (!userId || loading) return;

      const invitedTripId = searchParams.get("invitedTripId");
      if (!invitedTripId) return;

      // Check if user is now a member of the invited trip
      const isMember = trips.some((trip) => trip.id === invitedTripId);

      if (isMember) {
        // Remove query param and redirect to trip
        router.replace(getTripUrl(invitedTripId));
      }
    };

    handleInviteRedirect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trips, loading, userId, searchParams]);

  // Split trips into upcoming and past based on end_date
  const { upcomingTrips, pastTrips } = useMemo(() => {
    const today = startOfToday();
    const upcoming: Trip[] = [];
    const past: Trip[] = [];

    trips.forEach((trip) => {
      const endDate = new Date(trip.end_date);
      endDate.setHours(0, 0, 0, 0);
      
      if (endDate >= today) {
        upcoming.push(trip);
      } else {
        past.push(trip);
      }
    });

    return { upcomingTrips: upcoming, pastTrips: past };
  }, [trips]);

  const handleDeleteClick = (trip: Trip, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent card click
    setTripToDelete(trip);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!tripToDelete || !userId) return;

    try {
      const response = await fetch(`/api/trips/${tripToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete trip');
      }

      // Remove trip from local state
      setTrips((prev) => prev.filter((t) => t.id !== tripToDelete.id));
      setTripToDelete(null);
      setDeleteDialogOpen(false);
      
      addToast({
        title: 'Trip removed',
        description: `"${tripToDelete.title}" has been deleted successfully.`,
        variant: 'default',
      });
    } catch (error: any) {
      console.error("Error deleting trip:", error);
      addToast({
        title: 'Failed to delete trip',
        description: error?.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (!userId) {
    return <div>Please sign in to view your trips.</div>;
  }

  if (loading) {
    return <div>Loading trips...</div>;
  }

  return (
    <div>
      <div className="mb-10 flex justify-between items-center">
        <h2 className="font-mono text-[10px] tracking-wider uppercase text-muted-foreground font-semibold">
          {upcomingTrips.length} {upcomingTrips.length === 1 ? t('my_trips_trip') : t('my_trips_trips')} Found
        </h2>
        <Button 
          onClick={() => setOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 shadow-md transform hover:scale-105 transition-transform font-mono text-xs tracking-wider uppercase"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('my_trips_new_trip_button')}
        </Button>
      </div>

      {trips.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mb-6">
            <Plus className="w-10 h-10 text-muted-foreground/40" />
          </div>
          <h3 className="text-2xl font-normal mb-2" style={{ fontFamily: "'Patrick Hand', cursive" }}>{t('my_trips_empty_title')}</h3>
          <p className="text-muted-foreground max-w-xs mx-auto mb-8">
            {t('my_trips_empty_description')}
          </p>
          <Button 
            onClick={() => setOpen(true)}
            variant="outline"
            className="rounded-full px-8 border-dashed"
          >
            {t('my_trips_create_button')}
          </Button>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Upcoming Trips */}
          {upcomingTrips.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2">
              {upcomingTrips.map((trip) => (
                <Link
                  key={trip.id}
                  href={`/trips/${trip.id}?tab=itinerary`}
                  className="block group"
                >
                  <Card className="relative h-full cursor-pointer rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-border/40 bg-white group-hover:-translate-y-1 overflow-hidden">
                    {/* Color accent bar */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary/40 group-hover:bg-primary transition-colors"></div>
                    
                    <CardHeader className="p-6 pt-8">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <CardTitle 
                            className="text-2xl mb-2 leading-tight group-hover:text-primary transition-colors"
                            style={{ fontFamily: "'Patrick Hand', cursive" }}
                          >
                            {trip.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <span className="font-mono text-[10px] tracking-wider uppercase">
                              {format(new Date(trip.start_date), "MMM d")} - {format(new Date(trip.end_date), "MMM d, yyyy")}
                            </span>
                          </div>
                        </div>
                        {trip.owner_id === profileId && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 text-muted-foreground hover:text-destructive"
                            onClick={(e) => handleDeleteClick(trip, e)}
                            title={t('my_trips_delete_trip')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    {/* Decorative tape effect */}
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-6 bg-primary/10 rotate-2 pointer-events-none group-hover:bg-primary/20 transition-colors"></div>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {/* Past Trips */}
          {pastTrips.length > 0 && (
            <div className="pt-8 border-t border-dashed border-border/60">
              <div className="flex items-center justify-between mb-8">
                <h2 
                  className="text-3xl font-normal tracking-tight"
                  style={{ fontFamily: "'Patrick Hand', cursive" }}
                >
                  {t('my_trips_past_trips')}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPastTrips(!showPastTrips)}
                  className="gap-2 font-mono text-[10px] tracking-wider uppercase"
                >
                  {showPastTrips ? (
                    <>
                      {t('my_trips_hide_past')}
                      <ChevronUp className="h-3 w-3" />
                    </>
                  ) : (
                    <>
                      {t('my_trips_show_past')}
                      <ChevronDown className="h-3 w-3" />
                    </>
                  )}
                </Button>
              </div>
              {showPastTrips && (
                <div className="grid gap-6 md:grid-cols-2 opacity-80">
                  {pastTrips.map((trip) => (
                    <Link
                      key={trip.id}
                      href={`/trips/${trip.id}?tab=itinerary`}
                      className="block group"
                    >
                      <Card className="relative h-full cursor-pointer rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-border/40 bg-white/60 group-hover:-translate-y-1 overflow-hidden grayscale-[0.5] group-hover:grayscale-0">
                        <CardHeader className="p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <CardTitle 
                                className="text-xl mb-1 leading-tight group-hover:text-primary transition-colors"
                                style={{ fontFamily: "'Patrick Hand', cursive" }}
                              >
                                {trip.title}
                              </CardTitle>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <span className="font-mono text-[10px] tracking-wider uppercase">
                                  {format(new Date(trip.start_date), "MMM d")} - {format(new Date(trip.end_date), "MMM d, yyyy")}
                                </span>
                              </div>
                            </div>
                            {trip.owner_id === profileId && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 text-muted-foreground hover:text-destructive"
                                onClick={(e) => handleDeleteClick(trip, e)}
                                title="Delete trip"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {tripToDelete && (
        <DeleteTripDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          tripTitle={tripToDelete.title}
        />
      )}

      {userId && (
        <NewTripDialog open={open} onOpenChange={setOpen} onSuccess={fetchTrips} userId={userId} />
      )}
    </div>
  );
}

