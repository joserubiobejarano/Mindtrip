"use client";

import { useEffect, useState, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { NewTripDialog } from "@/components/new-trip-dialog";
import { DeleteTripDialog } from "@/components/delete-trip-dialog";
import { format, startOfToday } from "date-fns";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";

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
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null);
  const [showPastTrips, setShowPastTrips] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const router = useRouter();
  const { addToast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    if (userId) {
      // Link trip invitations first, then fetch trips
      linkTripInvitations().then(() => {
        fetchTrips();
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
          .single();

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

  const linkTripInvitations = async () => {
    try {
      await fetch("/api/user/link-trip-invitations", {
        method: "POST",
      });
    } catch (error) {
      console.error("Error linking trip invitations:", error);
      // Don't block trip fetching if this fails
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
      <div className="mb-10">
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Trip
        </Button>
      </div>

      {trips.length === 0 ? (
        <Card className="rounded-2xl shadow-md border-0 bg-card/50">
          <CardContent className="pt-8 pb-8">
            <p className="text-center text-muted-foreground text-base">
              No trips yet. Create your first trip to get started!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-12">
          {/* Upcoming Trips */}
          {upcomingTrips.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingTrips.map((trip) => (
                <Card
                  key={trip.id}
                  className="relative group cursor-pointer rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 border-0 bg-card/80 backdrop-blur-sm"
                  onClick={() => router.push(`/trips/${trip.id}`)}
                >
                  <CardHeader className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl mb-2 leading-tight">{trip.title}</CardTitle>
                        <CardDescription className="text-sm mt-1">
                          {format(new Date(trip.start_date), "MMM d")} -{" "}
                          {format(new Date(trip.end_date), "MMM d, yyyy")}
                        </CardDescription>
                      </div>
                      {trip.owner_id === profileId && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          onClick={(e) => handleDeleteClick(trip, e)}
                          title="Delete trip"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}

          {/* Past Trips */}
          {pastTrips.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-display text-3xl font-semibold tracking-tight">Past trips</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPastTrips(!showPastTrips)}
                  className="gap-2"
                >
                  {showPastTrips ? (
                    <>
                      Hide past trips
                      <ChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Show past trips
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
              {showPastTrips && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {pastTrips.map((trip) => (
                    <Card
                      key={trip.id}
                      className="relative group cursor-pointer rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 border-0 bg-card/80 backdrop-blur-sm"
                      onClick={() => router.push(`/trips/${trip.id}`)}
                    >
                      <CardHeader className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-xl mb-2 leading-tight">{trip.title}</CardTitle>
                            <CardDescription className="text-sm mt-1">
                              {format(new Date(trip.start_date), "MMM d")} -{" "}
                              {format(new Date(trip.end_date), "MMM d, yyyy")}
                            </CardDescription>
                          </div>
                          {trip.owner_id === profileId && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                              onClick={(e) => handleDeleteClick(trip, e)}
                              title="Delete trip"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                    </Card>
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

