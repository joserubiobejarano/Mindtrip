"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { eachDayOfInterval, format } from "date-fns";
import { DestinationAutocomplete } from "@/components/destination-autocomplete";

interface NewTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  userId: string;
}

interface DestinationOption {
  id: string;
  placeName: string;
  region: string;
  type: "City" | "Country" | "Region";
  center: [number, number];
}

export function NewTripDialog({
  open,
  onOpenChange,
  onSuccess,
  userId,
}: NewTripDialogProps) {
  const [destination, setDestination] = useState<DestinationOption | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [accommodationAddress, setAccommodationAddress] = useState("");
  const [findAccommodation, setFindAccommodation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    destination?: string;
    startDate?: string;
    endDate?: string;
  }>({});

  const generateTripTitle = (dest: DestinationOption | null, start: string, end: string): string => {
    if (!dest) return "";
    const cityName = dest.placeName;
    if (!start || !end) return `Trip to ${cityName}`;
    
    const startDate = new Date(start);
    const season = getSeason(startDate);
    
    return `${season} getaway to ${cityName}`;
  };

  const getSeason = (date: Date): string => {
    const month = date.getMonth();
    if (month >= 2 && month <= 4) return "Spring";
    if (month >= 5 && month <= 7) return "Summer";
    if (month >= 8 && month <= 10) return "Fall";
    return "Winter";
  };

  const router = useRouter();
  const supabase = createClient();
  const { user } = useUser();
  
  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setDestination(null);
      setStartDate("");
      setEndDate("");
      setAccommodationAddress("");
      setFindAccommodation(false);
      setError(null);
    }
  }, [open]);
  
  if (!userId) {
    return null;
  }

  const validateForm = (): boolean => {
    const errors: typeof fieldErrors = {};
    let isValid = true;

    if (!destination) {
      errors.destination = "Destination is required";
      isValid = false;
    }

    if (!startDate) {
      errors.startDate = "Start date is required";
      isValid = false;
    }

    if (!endDate) {
      errors.endDate = "End date is required";
      isValid = false;
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) {
        errors.endDate = "End date must be after start date";
        isValid = false;
      }
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const title = generateTripTitle(destination, startDate, endDate);
      const [centerLng, centerLat] = destination?.center || [null, null];
      const destinationCountry = destination?.region 
        ? destination.region.split(",").slice(-1)[0].trim() 
        : null;

      const { data: trip, error: tripError } = await supabase
        .from("trips")
        .insert({
          title,
          start_date: startDate,
          end_date: endDate,
          default_currency: "USD",
          accommodation_address: findAccommodation ? null : (accommodationAddress || null),
          find_accommodation: findAccommodation,
          destination_name: destination?.placeName || null,
          destination_country: destinationCountry || null,
          destination_place_id: destination?.id || null,
          center_lat: centerLat || null,
          center_lng: centerLng || null,
          owner_id: userId,
        })
        .select()
        .single();

      if (tripError) throw tripError;
      if (!trip) throw new Error("Failed to create trip");

      const days = eachDayOfInterval({ start, end });
      const dayRecords = days.map((date, index) => ({
        trip_id: trip.id,
        date: format(date, "yyyy-MM-dd"),
        day_number: index + 1,
      }));

      const { error: daysError } = await supabase
        .from("days")
        .insert(dayRecords);

      if (daysError) throw daysError;

      const userEmail = user?.primaryEmailAddress?.emailAddress || null;
      const displayName = user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : userEmail || null;

      const { error: memberError } = await supabase
        .from("trip_members")
        .insert({
          trip_id: trip.id,
          user_id: userId,
          email: userEmail,
          role: "owner",
          display_name: displayName,
        });

      if (memberError) {
        console.error("Error creating owner member:", memberError);
        await supabase.from("trips").delete().eq("id", trip.id);
        throw new Error("Failed to create trip member. Please try again.");
      }

      onOpenChange(false);
      onSuccess();
      router.push(`/trips/${trip.id}?tab=itinerary`);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl shadow-xl p-0 overflow-hidden max-h-[80vh] flex flex-col">
        {/* Header with icon and gradient background */}
        <DialogHeader className="bg-gradient-to-r from-sky-50 to-emerald-50 px-6 py-5 border-b flex-shrink-0">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Create New Trip
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-1">
            Plan your next adventure. We&apos;ll generate a smart itinerary for you.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="px-6 py-6 space-y-6 overflow-y-auto flex-1">
            {/* Destination */}
            <div className="space-y-2">
              <Label htmlFor="destination" className="text-base font-medium">
                Destination
              </Label>
              <DestinationAutocomplete
                value={destination}
                onChange={(value) => {
                  setDestination(value);
                  if (value) {
                    setFieldErrors((prev) => ({ ...prev, destination: undefined }));
                  }
                }}
              />
              {fieldErrors.destination && (
                <p className="text-sm text-destructive">{fieldErrors.destination}</p>
              )}
            </div>

            {/* Travel Dates */}
            <div className="border-t pt-6 space-y-4">
              <h3 className="text-base font-medium">Travel Dates</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, startDate: undefined }));
                    }}
                    required
                    className="rounded-lg"
                  />
                  {fieldErrors.startDate && (
                    <p className="text-sm text-destructive">{fieldErrors.startDate}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, endDate: undefined }));
                    }}
                    required
                    className="rounded-lg"
                  />
                  {fieldErrors.endDate && (
                    <p className="text-sm text-destructive">{fieldErrors.endDate}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Accommodation Section */}
            <div className="border-t pt-6 space-y-4">
              <h3 className="text-base font-medium">Accommodation</h3>
              <div className="space-y-4">
                {!findAccommodation && (
                  <div className="space-y-2">
                    <Label htmlFor="accommodation_address">
                      Accommodation Address (optional)
                    </Label>
                    <Input
                      id="accommodation_address"
                      placeholder="Enter address..."
                      value={accommodationAddress}
                      onChange={(e) => setAccommodationAddress(e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="find_accommodation"
                    checked={findAccommodation}
                    onCheckedChange={(checked) => {
                      setFindAccommodation(checked as boolean);
                      if (checked) {
                        setAccommodationAddress("");
                      }
                    }}
                  />
                  <Label htmlFor="find_accommodation" className="font-normal cursor-pointer">
                    I want you to find me a great place to stay
                  </Label>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                We&apos;ll use this to help plan your itinerary around where you&apos;re staying.
              </p>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                {error}
              </div>
            )}
          </div>

          {/* Footer with centered buttons */}
          <DialogFooter className="px-6 py-4 bg-gray-50 border-t justify-center gap-3 flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="rounded-lg">
              {loading ? "Creating..." : "Create Trip"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

