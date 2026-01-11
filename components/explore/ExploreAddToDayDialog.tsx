"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/components/ui/toast";
import { useLanguage } from "@/components/providers/language-provider";
import type { ExplorePlace } from "@/lib/google/explore-places";
import { useDays } from "@/hooks/use-days";
import { useTripProStatus } from "@/hooks/use-trip-pro-status";

interface ExploreAddToDayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  place: ExplorePlace | null;
  tripId: string;
}

export function ExploreAddToDayDialog({
  open,
  onOpenChange,
  place,
  tripId,
}: ExploreAddToDayDialogProps) {
  const [selectedDayId, setSelectedDayId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const { t } = useLanguage();
  const { data: days = [], isLoading: daysLoading } = useDays(tripId);
  const { data: proStatus } = useTripProStatus(tripId);
  const isPro = proStatus?.isProForThisTrip ?? false;

  // Initialize form when dialog opens
  useEffect(() => {
    if (open && place && days.length > 0) {
      // Reset selected day when dialog opens - user must explicitly choose
      setSelectedDayId("");
      setError(null);
    }
  }, [open, place, days]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedDayId("");
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedDayId) {
      setError(t('explore_error_select_day'));
      return;
    }

    if (!place) {
      setError(t('explore_error_no_place'));
      return;
    }

    setLoading(true);

    try {
      // Validate that the place has a valid Google Maps place_id
      if (place.place_id) {
        const validateResponse = await fetch('/api/places/validate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ place_id: place.place_id }),
        });

        if (validateResponse.ok) {
          const { valid } = await validateResponse.json();
          if (!valid) {
            throw new Error(t('explore_error_invalid_place_id') || 'This place is no longer available on Google Maps');
          }
        }
      } else {
        // If place doesn't have a place_id, don't add it
        throw new Error(t('explore_error_no_place_id') || 'This place does not have a valid Google Maps profile');
      }

      // Check if this place (by external_id/place_id) already exists in any activity in the itinerary
      // This prevents duplicates based on Google Maps place_id
      // First, get all days for this trip
      const { data: tripDays } = await supabase
        .from("days")
        .select("id")
        .eq("trip_id", tripId);

      if (tripDays && tripDays.length > 0) {
        const dayIds = tripDays.map((day: any) => day.id);
        
        // Get all activities with their places for this trip
        const { data: existingActivities } = await supabase
          .from("activities")
          .select(`
            id,
            place:places(external_id)
          `)
          .in("day_id", dayIds)
          .not("place_id", "is", null);

        // Check if any activity's place has the same external_id
        if (existingActivities && existingActivities.length > 0) {
          const hasDuplicate = existingActivities.some((activity: any) => 
            activity.place && activity.place.external_id === place.place_id
          );

          if (hasDuplicate) {
            // Place already exists in itinerary - show error
            const errorMessage = (t as any)('explore_error_already_in_itinerary') || 'This place is already in your itinerary';
            setError(errorMessage);
            addToast({
              title: (t as any)('explore_toast_already_in_itinerary') || 'Already in itinerary',
              description: errorMessage,
              variant: 'destructive',
            });
            return;
          }
        }
      }

      // First, upsert the place
      // Check if a place with this external_id already exists for this trip
      const { data: existingPlace } = await supabase
        .from("places")
        .select("*")
        .eq("trip_id", tripId)
        .eq("external_id", place.place_id)
        .maybeSingle();

      let placeId: string;

      type PlaceQueryResult = {
        id: string;
        [key: string]: any;
      };

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
            external_id: place.place_id,
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
          throw new Error(t('explore_error_create_place'));
        }

        if (!newPlace) {
          throw new Error(t('explore_error_create_place'));
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
        order_number: number | null;
        [key: string]: any;
      };

      const existingActivitiesTyped = (existingActivities || []) as ActivityQueryResult[];

      const maxOrder =
        existingActivitiesTyped && existingActivitiesTyped.length > 0
          ? existingActivitiesTyped[0].order_number || 0
          : 0;

      // Cache image to Supabase Storage
      let imageUrl: string | null = null;

      try {
        // Extract photoRef from place if available (not in ExplorePlace type but might exist)
        let photoRef: string | undefined;
        if ((place as any).photo_reference) {
          photoRef = (place as any).photo_reference;
        }

        // Extract city/country from address if available
        const addressParts = place.address?.split(',').map((p: string) => p.trim()) || [];
        const city = addressParts.length > 1 ? addressParts[addressParts.length - 2] : undefined;
        const country = addressParts.length > 0 ? addressParts[addressParts.length - 1] : undefined;

        // Call image caching API
        const cacheResponse = await fetch('/api/images/cache-place-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tripId,
            placeId: place.place_id,
            title: place.name,
            city,
            country,
            photoRef,
            lat: place.lat,
            lng: place.lng,
          }),
        });

        if (cacheResponse.ok) {
          const data = await cacheResponse.json();
          imageUrl = data.image_url || null;
        } else {
          console.warn('[ExploreAddToDayDialog] Image caching failed, continuing without image');
        }
      } catch (cacheError) {
        console.error('[ExploreAddToDayDialog] Error caching image:', cacheError);
        // Continue without image - not a fatal error
      }

      // Create the activity
      const { error: activityError } = await (supabase
        .from("activities") as any)
        .insert({
          day_id: selectedDayId,
          place_id: placeId,
          title: place.name,
          notes: null,
          start_time: null,
          end_time: null,
          order_number: maxOrder + 1,
          image_url: imageUrl,
        });

      if (activityError) {
        console.error("Error creating activity:", activityError);
        throw new Error(t('explore_error_create_activity'));
      }

      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["activities", selectedDayId] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      queryClient.invalidateQueries({ queryKey: ["days", tripId] });
      queryClient.invalidateQueries({ queryKey: ["trip-activities", tripId] });
      // Only invalidate explore-places for Pro users to prevent list refilling for free users
      if (isPro) {
        queryClient.invalidateQueries({ queryKey: ["explore-places", tripId] });
      }

      // Show success toast
      addToast({
        title: t('explore_toast_place_added'),
        description: t('explore_toast_added_to_day').replace('{name}', place.name),
        variant: 'success',
      });

      // Close dialog
      onOpenChange(false);
    } catch (err: any) {
      console.error("Error adding to itinerary:", err);
      setError(err.message || t('explore_error_generic'));
      addToast({
        title: t('explore_toast_error'),
        description: err.message || t('explore_error_generic'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!place) {
    return null;
  }

  if (daysLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('explore_button_add_to_itinerary')}</DialogTitle>
            <DialogDescription>
              {t('explore_loading_days')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('common_close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  if (days.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('explore_button_add_to_itinerary')}</DialogTitle>
            <DialogDescription>
              {t('explore_no_days_available')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('common_close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{(t as any)('explore_add_to_itinerary')}</DialogTitle>
          <DialogDescription>
            {(t as any)('explore_select_day_description')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="day" className="text-sm font-medium">
                {t('explore_select_day')} *
              </label>
              <Select
                value={selectedDayId}
                onValueChange={setSelectedDayId}
                required
              >
                <SelectTrigger id="day">
                  <SelectValue placeholder={t('explore_select_day_placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  {days.map((day) => (
                    <SelectItem key={day.id} value={day.id}>
                      {t('explore_day_format')
                        .replace('{number}', (day.day_number + 1).toString())
                        .replace('{date}', format(new Date(day.date), "EEE MMM d"))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              {t('common_cancel')}
            </Button>
            <Button
              type="submit"
              disabled={loading || !selectedDayId}
              className="bg-coral hover:bg-coral/90 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('explore_adding')}
                </>
              ) : (
                t('explore_button_add_to_itinerary')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
