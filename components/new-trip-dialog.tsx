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
import { DestinationAutocomplete, type DestinationOption as AutocompleteDestinationOption } from "@/components/destination-autocomplete";
import { useLanguage } from "@/components/providers/language-provider";

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
  placeId?: string; // Google Places ID
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
  const [tripCount, setTripCount] = useState(0);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [destinationInput, setDestinationInput] = useState("");
  const [destination, setDestination] = useState<DestinationOption | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<AutocompleteDestinationOption | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [segments, setSegments] = useState<CitySegment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showProPaywall, setShowProPaywall] = useState(false);
  const [paywallContext, setPaywallContext] = useState<string>("multi-city");
  const [fieldErrors, setFieldErrors] = useState<{
    destination?: string;
    startDate?: string;
    endDate?: string;
  }>({});

  const router = useRouter();
  const { user } = useUser();
  const { addToast } = useToast();
  const { t } = useLanguage();

  // Fetch subscription status on mount
  useEffect(() => {
    if (open && userId) {
      const fetchSubscriptionStatus = fetch('/api/user/subscription-status')
        .then(res => res.json())
        .then(data => data.isPro || false);

      const fetchTripCount = fetch('/api/trips')
        .then(res => res.json())
        .then(data => data.trips.length || 0);

      Promise.all([fetchSubscriptionStatus, fetchTripCount])
        .then(([isProUser, tripCount]) => {
          setIsPro(isProUser);
          setTripCount(tripCount);
          setLoadingSubscription(false);
        })
        .catch((err) => {
          console.error("Failed to fetch subscription status or trip count", err);
          setIsPro(false);
          setTripCount(0); // Assume 0 trips on error
          setLoadingSubscription(false);
        });
    }
  }, [open, userId]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setDestinationInput("");
      setDestination(null);
      setSelectedDestination(null);
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
      if (!selectedDestination && !destinationInput.trim()) {
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
    if (!selectedDestination && !destinationInput.trim()) {
      setFieldErrors(prev => ({ ...prev, destination: "Enter a destination first" }));
      return;
    }

    // If user is not Pro, show paywall modal instead of adding a segment
    if (!isPro) {
      setPaywallContext("multi-city");
      setShowProPaywall(true);
      return;
    }

    // Use selected destination if available, otherwise create from input
    const cityName = selectedDestination?.name || destinationInput.trim();
    const cityPlaceId = selectedDestination?.placeId || `city-${cityName.toLowerCase().replace(/\s+/g, '-')}`;

    // Pro users: add segment normally
    const newSegment: CitySegment = {
      id: `segment-${Date.now()}`,
      cityPlaceId,
      cityName,
      nights: 2, // Default 2 nights
    };

    setSegments([...segments, newSegment]);
    setDestinationInput(""); // Clear for next city
    setDestination(null);
    setSelectedDestination(null);
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

    // Free user trip duration limit check
    const FREE_TRIP_MAX_DAYS = 4;
    if (!isPro && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
      
      if (diffDays > FREE_TRIP_MAX_DAYS) {
        setPaywallContext("trip-duration");
        setShowProPaywall(true);
        setLoading(false);
        return;
      }
    }

    // Free user trip limit check
    const FREE_TRIP_LIMIT = 1;
    if (!isPro && tripCount >= FREE_TRIP_LIMIT) {
      setPaywallContext("trip-limit");
      setShowProPaywall(true);
      setLoading(false);
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
    } else if (selectedDestination) {
      // Use selected destination from autocomplete
      primaryDestination = {
        placeId: selectedDestination.placeId,
        name: selectedDestination.name,
        center: selectedDestination.center,
      };
    } else if (destinationInput.trim()) {
      // Fallback: create destination object from input (shouldn't happen with autocomplete)
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
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          // If we can't parse JSON, still check status for paywall scenarios
          if (response.status === 403) {
            setPaywallContext("trip-duration");
            setShowProPaywall(true);
            setError(null); // Clear any error state
            setLoading(false);
            return;
          }
          throw new Error('Failed to create trip');
        }
        
        // If trip limit reached, show paywall modal (don't set error state)
        if (response.status === 403 && (errorData.error === 'trip_limit_reached' || errorData.message?.includes('trip limit'))) {
          setPaywallContext("trip-limit");
          setShowProPaywall(true);
          setError(null); // Clear any error state
          setLoading(false);
          return;
        }
        
        // If trip duration limit reached, show paywall modal (don't set error state)
        if (response.status === 403 && (
          errorData.error === 'trip_duration_limit_reached' || 
          errorData.error?.includes('trip_duration_limit') ||
          errorData.message?.includes('trip duration') ||
          errorData.message?.includes('4 days') ||
          errorData.message?.toLowerCase().includes('free users are only allowed')
        )) {
          setPaywallContext("trip-duration");
          setShowProPaywall(true);
          setError(null); // Clear any error state - don't show the ugly message
          setLoading(false);
          return;
        }
        
        // For other errors, show a user-friendly message (not the raw error code)
        const userFriendlyError = errorData.message || 'Failed to create trip. Please try again.';
        throw new Error(userFriendlyError);
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
      // Never display the raw "trip_duration_limit_reached" error code to users
      const errorMessage = err.message || "An error occurred";
      if (errorMessage.includes('trip_duration_limit_reached') || errorMessage.includes('trip_duration_limit')) {
        // If somehow this error made it here, show paywall instead
        setPaywallContext("trip-duration");
        setShowProPaywall(true);
        setError(null); // Don't show the error message
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingSubscription) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('trip_create_loading')}</DialogTitle>
          </DialogHeader>
          <div className="p-6 text-center">{t('trip_create_loading')}</div>
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
          <span className="sr-only">{t('trip_create_close')}</span>
        </Button>
        <DialogHeader className="pt-[60px] px-6 py-5 flex-shrink-0 relative z-20 bg-background rounded-t-2xl">
          <DialogTitle className="text-2xl font-bold text-foreground">
            {t('trip_create_title')}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {t('trip_create_description')}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 relative z-20 bg-background">
          <div className="px-6 py-6 space-y-4 overflow-y-auto flex-1">
            {/* Always show multi-city UI structure */}
            <div className="flex flex-col items-start">
              <Label className="font-mono text-[10px] tracking-wider uppercase text-foreground font-semibold mb-2">
                {segments.length > 0 ? t('trip_create_primary_city_label') : t('trip_create_destination_label')}
              </Label>
              <div className="relative w-full">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-muted-foreground" strokeWidth={2} />
                  </div>
                </div>
                <DestinationAutocomplete
                  value={destinationInput}
                  onChange={(value) => {
                    setDestinationInput(value);
                    if (value.trim()) {
                      setFieldErrors((prev) => ({ ...prev, destination: undefined }));
                    }
                    // Clear selected destination if input is cleared
                    if (!value.trim()) {
                      setSelectedDestination(null);
                    }
                  }}
                  onSelect={(destination) => {
                    setSelectedDestination(destination);
                    setDestinationInput(destination.description);
                    setFieldErrors((prev) => ({ ...prev, destination: undefined }));
                  }}
                  className="w-full"
                  inputClassName="pl-14 bg-accent border-0 rounded-xl h-12 font-body placeholder:text-muted-foreground"
                  placeholder={t('trip_create_destination_placeholder')}
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
                {t('trip_create_add_city')}
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
                  <Label className="text-base font-medium">{t('trip_create_cities_label')}</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddCity}
                    disabled={!destinationInput.trim()}
                    className="text-xs"
                  >
                    {t('trip_create_add_city')}
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
                          {t('trip_create_nights_label')}
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
                  {t('trip_create_checkin_label')}
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
                    placeholder={t('trip_create_dates_placeholder')}
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

            {error && !error.includes('trip_duration_limit_reached') && !error.includes('trip_duration_limit') && (
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
              {t('trip_create_cancel')}
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">
              {t('trip_create_continue')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      <ProPaywallModal
        open={showProPaywall}
        onClose={() => setShowProPaywall(false)}
        context={paywallContext}
      />
      </Dialog>
    </>
  );
}
