"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

interface PlaceResult {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  category?: string;
  photoUrl?: string | null;
  types?: string[];
}

interface Day {
  id: string;
  trip_id: string;
  date: string;
  day_number: number;
}

interface AddToItineraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  place: PlaceResult;
  tripId: string;
  days: Day[];
}

export function AddToItineraryDialog({
  open,
  onOpenChange,
  place,
  tripId,
  days,
}: AddToItineraryDialogProps) {
  const [selectedDayId, setSelectedDayId] = useState<string>("");
  const [startTime, setStartTime] = useState("");
  const [activityTitle, setActivityTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const queryClient = useQueryClient();

  // Initialize form when dialog opens
  useEffect(() => {
    if (open && place) {
      setActivityTitle(place.name);
      if (days.length > 0 && !selectedDayId) {
        setSelectedDayId(days[0].id);
      }
    }
  }, [open, place, days, selectedDayId]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedDayId("");
      setStartTime("");
      setActivityTitle("");
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedDayId) {
      setError("Please select a day");
      return;
    }

    if (!activityTitle.trim()) {
      setError("Activity title is required");
      return;
    }

    setLoading(true);

    try {
      // First, upsert the place
      // Check if a place with this external_id already exists for this trip
      const { data: existingPlace } = await supabase
        .from("places")
        .select("*")
        .eq("trip_id", tripId)
        .eq("external_id", place.id)
        .maybeSingle();

      let placeId: string;

      type PlaceQueryResult = {
        id: string
        [key: string]: any
      }

      const existingPlaceTyped = existingPlace as PlaceQueryResult | null;

      if (existingPlaceTyped) {
        // Reuse existing place
        placeId = existingPlaceTyped.id;
      } else {
        // Create new place with trip_id
        const { data: newPlace, error: placeError } = await (supabase
          .from("places") as any)
          .insert({
            trip_id: tripId,
            external_id: place.id,
            name: place.name,
            address: place.address || null,
            lat: place.lat || null,
            lng: place.lng || null,
            category: place.category || null,
          })
          .select()
          .single();

        if (placeError) {
          console.error("Error creating place:", placeError);
          throw new Error("Failed to create place");
        }

        if (!newPlace) {
          throw new Error("Failed to create place");
        }

        placeId = newPlace.id;
      }

      // Get the max order_number for activities on this day
      const { data: existingActivities } = await supabase
        .from("activities")
        .select("order_number")
        .eq("day_id", selectedDayId)
        .order("order_number", { ascending: false })
        .limit(1);

      type ActivityQueryResult = {
        order_number: number | null
        [key: string]: any
      }

      const existingActivitiesTyped = (existingActivities || []) as ActivityQueryResult[];

      const maxOrder =
        existingActivitiesTyped && existingActivitiesTyped.length > 0
          ? existingActivitiesTyped[0].order_number || 0
          : 0;

      // Extract image URL from place
      let imageUrl: string | null = null;
      
      // If we already have a photoUrl string, use it
      if (place.photoUrl && typeof place.photoUrl === 'string') {
        imageUrl = place.photoUrl;
      } 
      // Otherwise, check if place has Google Maps photo objects
      else if ((place as any).photos && Array.isArray((place as any).photos) && (place as any).photos.length > 0) {
        const photo = (place as any).photos[0];
        // Check if it's a Google Maps photo object with getUrl method
        if (photo && typeof photo.getUrl === 'function') {
          try {
            imageUrl = photo.getUrl({ maxWidth: 1200 });
          } catch (err) {
            console.error("Error getting photo URL:", err);
            imageUrl = null;
          }
        }
      }

      // Create the activity
      const { error: activityError } = await (supabase
        .from("activities") as any)
        .insert({
          day_id: selectedDayId,
          place_id: placeId,
          title: activityTitle.trim(),
          notes: null,
          start_time: startTime || null,
          end_time: null,
          order_number: maxOrder + 1,
          image_url: imageUrl,
        });

      if (activityError) {
        console.error("Error creating activity:", activityError);
        throw new Error("Failed to create activity");
      }

      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["activities", selectedDayId] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      queryClient.invalidateQueries({ queryKey: ["days", tripId] });

      // Close dialog
      onOpenChange(false);
    } catch (err: any) {
      console.error("Error adding to itinerary:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (days.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Itinerary</DialogTitle>
            <DialogDescription>
              No days available for this trip. Please create days first.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add to Itinerary</DialogTitle>
          <DialogDescription>
            Choose a day and time for this activity. You can edit the title if
            needed.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="day">Day *</Label>
              <Select
                value={selectedDayId}
                onValueChange={setSelectedDayId}
                required
              >
                <SelectTrigger id="day">
                  <SelectValue placeholder="Select a day" />
                </SelectTrigger>
                <SelectContent>
                  {days.map((day) => (
                    <SelectItem key={day.id} value={day.id}>
                      Day {day.day_number} - {format(new Date(day.date), "EEE MMM d")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Activity Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Visit Museo Nacional del Prado"
                value={activityTitle}
                onChange={(e) => setActivityTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time (Optional)</Label>
              <Input
                id="start_time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            {error && (
              <div className="text-sm text-destructive">{error}</div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !selectedDayId || !activityTitle.trim()}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add to Itinerary"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

