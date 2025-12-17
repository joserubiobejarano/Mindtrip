"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { DateRangePicker } from "@/components/date-range-picker";
import { X, Lock, Calendar, MapPin } from "lucide-react";
import { DialogDescription } from "@/components/ui/dialog";
import { ProPaywallModal } from "@/components/pro/ProPaywallModal";
import { useToast } from "@/components/ui/toast";
import { getTripUrl } from "@/lib/routes";

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
  const [destinationInput, setDestinationInput] = useState("");
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
  const { addToast } = useToast();

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
      setDestinationInput("");
      setDestination(null);
      setStartDate("");
      setEndDate("");
      setSegments([]);
      setError(null);
      setFieldErrors({});
      setShowProPaywall(false);
    }
  }, [open]);

  // Safety guard: Reset state on unmount to prevent stuck overlay
  useEffect(() => {
    return () => {
      if (open) {
        onOpenChange(false);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      if (!destinationInput.trim()) {
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
    if (!destinationInput.trim()) {
      setFieldErrors(prev => ({ ...prev, destination: "Enter a destination first" }));
      return;
    }

    // If user is not Pro, show paywall modal instead of adding a segment
    if (!isPro) {
      setShowProPaywall(true);
      return;
    }

    // Create destination object from input
    const destinationObj: DestinationOption = {
      id: `city-${destinationInput.toLowerCase().replace(/\s+/g, '-')}`,
      placeName: destinationInput.trim(),
      region: "",
      type: "City",
      center: [0, 0],
    };

    // Pro users: add segment normally
    const newSegment: CitySegment = {
      id: `segment-${Date.now()}`,
      cityPlaceId: destinationObj.id,
      cityName: destinationObj.placeName,
      nights: 2, // Default 2 nights
    };

    setSegments([...segments, newSegment]);
    setDestinationInput(""); // Clear for next city
    setDestination(null);
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
    setError(null);
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    // Determine primary destination (first segment for multi-city, or main destination for single-city)
    let primaryDestination: { placeId: string; name: string; center: [number, number] } | null = null;
    
    if (isPro && segments.length > 0) {
      primaryDestination = {
        placeId: segments[0].cityPlaceId,
        name: segments[0].cityName,
        center: [0, 0],
      };
    } else if (destinationInput.trim()) {
      // Create destination object from input
      const destinationObj: DestinationOption = {
        id: `city-${destinationInput.toLowerCase().replace(/\s+/g, '-')}`,
        placeName: destinationInput.trim(),
        region: "",
        type: "City",
        center: [0, 0],
      };
      primaryDestination = {
        placeId: destinationObj.id,
        name: destinationObj.placeName,
        center: destinationObj.center,
      };
    }

    if (!primaryDestination) {
      setError("Destination is required");
      return;
    }

    // Create trip directly with default personalization
    setLoading(true);
    setError(null);

    try {
      const payload: any = {
        destinationPlaceId: primaryDestination.placeId,
        destinationName: primaryDestination.name,
        destinationCenter: primaryDestination.center,
        startDate,
        endDate,
        ...(isPro && segments.length > 0 && {
          segments: segments.map(s => ({
            cityPlaceId: s.cityPlaceId,
            cityName: s.cityName,
            nights: s.nights,
          })),
        }),
        // Default personalization payload (travelers=1, hasAccommodation=false)
        personalization: {
          travelers: 1,
          hasAccommodation: false,
        },
      };

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
      
      // Log full response (sanitized - only log structure, not sensitive data)
      console.log('[trip-create-client] POST /api/trips response:', {
        hasData: !!data,
        hasTrip: !!data?.trip,
        tripId: data?.trip?.id,
        tripKeys: data?.trip ? Object.keys(data.trip) : null,
        hasSegments: !!data?.segments,
        responseShape: {
          trip: data?.trip ? { id: data.trip.id, title: data.trip.title } : null,
          segments: data?.segments?.length || 0,
        },
      });
      
      // Explicitly extract tripId with hard validation
      const tripId = data?.trip?.id;
      console.log('[trip-create-client] extracted tripId:', tripId, 'type:', typeof tripId);

      // Hard assertion: tripId must be a non-empty string
      if (!tripId || typeof tripId !== 'string' || tripId.trim() === '') {
        const errorMsg = 'Trip created but no tripId returned';
        console.error('[trip-create-client] tripId validation failed:', {
          tripId,
          type: typeof tripId,
          data: data,
        });
        setError(errorMsg);
        addToast({
          title: 'Error',
          description: errorMsg,
          variant: 'destructive',
        });
        return;
      }

      onOpenChange(false);
      onSuccess();
      
      // Bulletproof navigation: use replace + refresh + fallback
      const targetUrl = getTripUrl(tripId, 'itinerary');
      console.log('[trip-create] redirecting to', targetUrl);
      
      try {
        router.replace(targetUrl);
        router.refresh();
        
        // Fallback: if still on /trips after 300ms, force hard navigation
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.location.pathname === '/trips') {
            console.warn('[trip-create] fallback: using hard navigation');
            window.location.assign(targetUrl);
          }
        }, 300);
      } catch (navError: any) {
        console.error('[trip-create-client] navigation failed', navError);
        // Fallback to hard navigation on error
        if (typeof window !== 'undefined') {
          window.location.assign(targetUrl);
        } else {
          addToast({
            title: 'Navigation failed',
            description: 'Trip created but could not navigate to workspace. Please refresh the page.',
            variant: 'destructive',
          });
        }
      }
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
          <DialogHeader>
            <DialogTitle>Loading...</DialogTitle>
          </DialogHeader>
          <div className="p-6 text-center">Loading...</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(92vw,560px)] rounded-2xl shadow-xl p-0 overflow-auto flex flex-col max-h-[90vh] [&>button]:hidden">
        {/* Blue top border matching search box */}
        <div className="absolute top-0 left-0 right-0 h-[60px] bg-primary rounded-t-2xl z-10 pointer-events-none"></div>
        {/* Close button positioned above the colored header */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 z-50 h-8 w-8 text-white hover:bg-white/20 hover:text-white rounded-full"
          onClick={() => onOpenChange(false)}
          type="button"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
        <DialogHeader className="pt-[60px] px-6 py-5 flex-shrink-0 relative z-20 bg-background rounded-t-2xl">
          <DialogTitle className="text-2xl font-bold text-foreground">
            Create New Trip
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Plan a single or multi-city trip. Add multiple cities with Pro.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 relative z-20 bg-background">
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
                <Input
                  value={destinationInput}
                  onChange={(e) => {
                    setDestinationInput(e.target.value);
                    if (e.target.value.trim()) {
                      setFieldErrors((prev) => ({ ...prev, destination: undefined }));
                    }
                  }}
                  className="pl-14 bg-accent border-0 rounded-xl h-12 font-body placeholder:text-muted-foreground"
                  placeholder="Search destinations..."
                />
              </div>
              {fieldErrors.destination && (
                <p className="text-sm text-destructive mt-1">{fieldErrors.destination}</p>
              )}
            </div>

            {/* Always show "+ Add city" button with PRO/lock badge */}
            {segments.length === 0 && destinationInput && (
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
                    disabled={!destinationInput.trim()}
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

          <DialogFooter className="px-6 py-4 border-t justify-center gap-3 flex-shrink-0 bg-background rounded-b-2xl">
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
              Continue
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
    </>
  );
}
