"use client";

import { useState, useEffect } from "react";
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
import { PlaceSearch } from "@/components/place-search";

interface Activity {
  id?: string;
  title: string;
  start_time: string | null;
  end_time: string | null;
  notes: string | null;
  place_id: string | null;
}

interface ActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (activity: Omit<Activity, "id">) => void;
  initialData?: Activity | null;
  dayId: string;
}

export function ActivityDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  dayId,
}: ActivityDialogProps) {
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setStartTime(initialData.start_time || "");
      setEndTime(initialData.end_time || "");
      setNotes(initialData.notes || "");
      setSelectedPlaceId(initialData.place_id);
    } else {
      setTitle("");
      setStartTime("");
      setEndTime("");
      setNotes("");
      setSelectedPlaceId(null);
    }
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit({
        title,
        start_time: startTime || null,
        end_time: endTime || null,
        notes: notes || null,
        place_id: selectedPlaceId,
      });
      onOpenChange(false);
      // Reset form
      setTitle("");
      setStartTime("");
      setEndTime("");
      setNotes("");
      setSelectedPlaceId(null);
    } catch (error) {
      console.error("Error submitting activity:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Activity" : "Add Activity"}</DialogTitle>
          <DialogDescription>
            Add an activity to your itinerary. You can search for places to link them.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Activity Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Visit Eiffel Tower"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Place (Optional)</Label>
              <PlaceSearch
                onSelectPlace={(placeId) => setSelectedPlaceId(placeId)}
                selectedPlaceId={selectedPlaceId}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time">Start Time</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_time">End Time</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                placeholder="Additional details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
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
            <Button type="submit" disabled={loading || !title}>
              {loading ? "Saving..." : initialData ? "Update" : "Add Activity"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

