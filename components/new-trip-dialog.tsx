"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
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
import { DestinationAutocomplete } from "@/components/destination-autocomplete";
import { DateRangePicker } from "@/components/date-range-picker";
import { X, Lock, Calendar, MapPin } from "lucide-react";
import { DialogDescription } from "@/components/ui/dialog";
import { ProPaywallModal } from "@/components/pro/ProPaywallModal";

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

interface CitySegment {
  id: string;
  cityPlaceId: string;
  cityName: string;
  nights: number;
}

export function NewTripDialog({
  open,
  onOpenChange,
  onSuccess,
  userId,
}: NewTripDialogProps) {
  const [isPro, setIsPro] = useState(false);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [destination, setDestination] = useState<DestinationOption | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [segments, setSegments] = useState<CitySegment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showProPaywall, setShowProPaywall] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    destination?: string;
    startDate?: string;
    endDate?: string;
  }>({});

  const router = useRouter();
  const { user } = useUser();

  // Fetch subscription status on mount
  useEffect(() => {
    if (open && userId) {
      fetch('/api/user/subscription-status')
        .then(res => res.json())
        .then(data => {
          setIsPro(data.isPro || false);
          setLoadingSubscription(false);
        })
        .catch(() => {
          setIsPro(false);
          setLoadingSubscription(false);
        });
    }
  }, [open, userId]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setDestination(null);
      setStartDate("");
      setEndDate("");
      setSegments([]);
      setError(null);
      setFieldErrors({});
      setShowProPaywall(false);
    }
  }, [open]);

  if (!userId) {
    return null;
  }

  const validateForm = (): boolean => {
    const errors: typeof fieldErrors = {};
    let isValid = true;

    // For multi-city (Pro users with segments), validate segments
    // For single-city (Free users or Pro users without segments), validate destination
    if (isPro && segments.length > 0) {
      // Multi-city: validate segments
      if (segments.length === 0) {
        errors.destination = "At least one city is required";
        isValid = false;
      }
    } else {
      // Single-city: validate destination
      if (!destination) {
        errors.destination = "Destination is required";
        isValid = false;
      }
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

  const handleAddCity = () => {
    if (!destination) {
      setFieldErrors(prev => ({ ...prev, destination: "Select a destination first" }));
      return;
    }

    // If user is not Pro, show paywall modal instead of adding a segment
    if (!isPro) {
      setShowProPaywall(true);
      return;
    }

    // Pro users: add segment normally
    const newSegment: CitySegment = {
      id: `segment-${Date.now()}`,
      cityPlaceId: destination.id,
      cityName: destination.placeName,
      nights: 2, // Default 2 nights
    };

    setSegments([...segments, newSegment]);
    setDestination(null); // Clear for next city
  };

  const handleRemoveCity = (segmentId: string) => {
    setSegments(segments.filter(s => s.id !== segmentId));
  };

  const handleUpdateSegmentNights = (segmentId: string, nights: number) => {
    setSegments(segments.map(s =>
      s.id === segmentId ? { ...s, nights: Math.max(1, nights) } : s
    ));
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
      const payload: any = {
        destinationPlaceId: isPro && segments.length > 0
          ? segments[0].cityPlaceId
          : destination!.id,
        startDate,
        endDate,
      };

      if (isPro && segments.length > 0) {
        payload.segments = segments.map(s => ({
          cityPlaceId: s.cityPlaceId,
          cityName: s.cityName,
          nights: s.nights,
        }));
      }

      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create trip');
      }

      const data = await response.json();
      onOpenChange(false);
      onSuccess();
      router.push(`/trips/${data.trip.id}?tab=itinerary`);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loadingSubscription) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <div className="p-6 text-center">Loading...</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl shadow-xl p-0 overflow-hidden flex flex-col relative [&>button]:hidden">
        {/* Blue top border matching search box */}
        <div className="absolute top-0 left-0 right-0 h-[60px] bg-primary rounded-t-2xl"></div>
        {/* Close button positioned above the colored header */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 z-50 h-8 w-8 text-white hover:bg-white/20 hover:text-white rounded-full"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
        <DialogHeader className="pt-[60px] px-6 py-5 flex-shrink-0">
          <DialogTitle className="text-2xl font-bold text-foreground">
            Create New Trip
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Plan a single or multi-city trip. Add multiple cities with Pro.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="px-6 py-6 space-y-4 overflow-y-auto flex-1">
            {/* Always show multi-city UI structure */}
            <div className="flex flex-col items-start">
              <Label className="font-mono text-[10px] tracking-wider uppercase text-foreground font-semibold mb-2">
                {segments.length > 0 ? "Primary City" : "Where to?"}
              </Label>
              <div className="relative w-full">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-muted-foreground" strokeWidth={2} />
                  </div>
                </div>
                <DestinationAutocomplete
                  value={destination}
                  onChange={(value) => {
                    setDestination(value);
                    if (value) {
                      setFieldErrors((prev) => ({ ...prev, destination: undefined }));
                    }
                  }}
                  className="w-full"
                  inputClassName="pl-14 bg-accent border-0 rounded-xl h-12 font-body placeholder:text-muted-foreground"
                  placeholder="Search destinations..."
                />
              </div>
              {fieldErrors.destination && (
                <p className="text-sm text-destructive mt-1">{fieldErrors.destination}</p>
              )}
            </div>

            {/* Always show "+ Add city" button with PRO/lock badge */}
            {segments.length === 0 && destination && (
              <Button
                type="button"
                variant="outline"
                onClick={handleAddCity}
                className="w-full"
              >
                + Add City
                {!isPro && (
                  <Lock className="ml-2 h-3 w-3" />
                )}
                <span className={`ml-2 px-2 py-0.5 text-white text-xs rounded-full ${
                  isPro ? "bg-orange-500" : "bg-gray-400"
                }`}>
                  {isPro ? "Pro" : "Pro"}
                </span>
              </Button>
            )}

            {/* Show segments if any exist */}
            {segments.length > 0 && (
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Cities</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddCity}
                    disabled={!destination}
                    className="text-xs"
                  >
                    + Add City
                    {!isPro && (
                      <Lock className="ml-1 h-3 w-3" />
                    )}
                    <span className={`ml-1 px-1.5 py-0.5 text-white text-xs rounded-full ${
                      isPro ? "bg-orange-500" : "bg-gray-400"
                    }`}>
                      Pro
                    </span>
                  </Button>
                </div>
                {segments.map((segment, index) => (
                  <div
                    key={segment.id}
                    className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{segment.cityName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Label htmlFor={`nights-${segment.id}`} className="text-xs text-gray-600">
                          Nights:
                        </Label>
                        <Input
                          id={`nights-${segment.id}`}
                          type="number"
                          min="1"
                          value={segment.nights}
                          onChange={(e) =>
                            handleUpdateSegmentNights(segment.id, parseInt(e.target.value) || 1)
                          }
                          className="w-16 h-8 text-xs"
                        />
                      </div>
                    </div>
                    {segments.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCity(segment.id)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="border-t pt-4 space-y-4">
              <div className="flex flex-col items-start">
                <Label className="font-mono text-[10px] tracking-wider uppercase text-foreground font-semibold mb-2">
                  Check-in
                </Label>
                <div className="relative w-full">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <DateRangePicker
                    startDate={startDate}
                    endDate={endDate}
                    onStartDateChange={(date) => {
                      setStartDate(date);
                      setFieldErrors((prev) => ({ ...prev, startDate: undefined }));
                    }}
                    onEndDateChange={(date) => {
                      setEndDate(date);
                      setFieldErrors((prev) => ({ ...prev, endDate: undefined }));
                    }}
                    className="w-full pl-10 bg-secondary border-0 rounded-xl h-12 font-body text-left justify-start hover:bg-secondary"
                    placeholder="Add dates"
                    hideIcon={true}
                  />
                </div>
                {(fieldErrors.startDate || fieldErrors.endDate) && (
                  <p className="text-sm text-destructive mt-1">
                    {fieldErrors.startDate || fieldErrors.endDate}
                  </p>
                )}
              </div>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                {error}
              </div>
            )}
          </div>

          <DialogFooter className="px-6 py-4 border-t justify-center gap-3 flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">
              {loading ? "Creating..." : "Create Trip"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      <ProPaywallModal
        open={showProPaywall}
        onClose={() => setShowProPaywall(false)}
        context="multi-city"
      />
    </Dialog>
  );
}
