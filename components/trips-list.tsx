"use client";

import { useEffect, useState, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { NewTripDialog } from "@/components/new-trip-dialog";
import { DeleteTripDialog } from "@/components/delete-trip-dialog";
import { format, startOfToday } from "date-fns";

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
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (userId) {
      fetchTrips();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchTrips = async () => {
    if (!userId) return;
    
    try {
      // Fetch trips where user is owner
      const { data: ownedTrips, error: ownedError } = await supabase
        .from("trips")
        .select("*")
        .eq("owner_id", userId)
        .order("start_date", { ascending: true });

      if (ownedError) throw ownedError;

      // Fetch trips where user is a member
      const { data: memberTrips, error: memberError } = await supabase
        .from("trip_members")
        .select("trip_id, trips(*)")
        .eq("user_id", userId);

      if (memberError) throw memberError;

      // Combine and deduplicate trips
      const allTrips = [
        ...(ownedTrips || []),
        ...(memberTrips || []).map((mt: any) => mt.trips).filter(Boolean),
      ];

      // Deduplicate by id
      const uniqueTrips = Array.from(
        new Map(allTrips.map((trip: any) => [trip.id, trip])).values()
      ) as Trip[];

      // Sort by start_date
      uniqueTrips.sort(
        (a, b) =>
          new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      );

      setTrips(uniqueTrips);
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
      const { error } = await supabase
        .from("trips")
        .delete()
        .eq("id", tripToDelete.id);

      if (error) throw error;

      // Remove trip from local state
      setTrips((prev) => prev.filter((t) => t.id !== tripToDelete.id));
      setTripToDelete(null);
    } catch (error) {
      console.error("Error deleting trip:", error);
      alert("Failed to delete trip. Please try again.");
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
      <div className="mb-6">
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Trip
        </Button>
      </div>

      {trips.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No trips yet. Create your first trip to get started!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Upcoming Trips */}
          {upcomingTrips.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Upcoming trips</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcomingTrips.map((trip) => (
                  <Card
                    key={trip.id}
                    className="relative group cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => router.push(`/trips/${trip.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle>{trip.title}</CardTitle>
                          <CardDescription>
                            {format(new Date(trip.start_date), "MMM d")} -{" "}
                            {format(new Date(trip.end_date), "MMM d, yyyy")}
                          </CardDescription>
                        </div>
                        {trip.owner_id === userId && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
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
            </div>
          )}

          {/* Past Trips */}
          {pastTrips.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Past trips</h2>
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
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {pastTrips.map((trip) => (
                    <Card
                      key={trip.id}
                      className="relative group cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => router.push(`/trips/${trip.id}`)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle>{trip.title}</CardTitle>
                            <CardDescription>
                              {format(new Date(trip.start_date), "MMM d")} -{" "}
                              {format(new Date(trip.end_date), "MMM d, yyyy")}
                            </CardDescription>
                          </div>
                          {trip.owner_id === userId && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
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

