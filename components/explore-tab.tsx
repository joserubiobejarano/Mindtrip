"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ExplorePlaceList } from "./explore/ExplorePlaceList";
import { ExploreFilters } from "./explore/ExploreFilters";
import { ExploreAddToDayDialog } from "./explore/ExploreAddToDayDialog";
import { HotelSearchBanner } from "./hotel-search-banner";
import { ErrorBoundary } from "./error-boundary";
import { useTrip } from "@/hooks/use-trip";
import { useTripSegments } from "@/hooks/use-trip-segments";
import { useToast } from "@/components/ui/toast";
import type { ExploreFilters as ExploreFiltersType, ExplorePlace } from "@/lib/google/explore-places";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/language-provider";

interface ExploreTabProps {
  tripId: string;
  onActivePlaceChange?: (place: { placeId: string; lat: number; lng: number }) => void;
}

export function ExploreTab({ tripId, onActivePlaceChange }: ExploreTabProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: trip, isLoading: tripLoading, error: tripError } = useTrip(tripId);
  const { data: segments = [], isLoading: segmentsLoading, error: segmentsError } = useTripSegments(tripId);
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);
  const { addToast } = useToast();
  const { t } = useLanguage();
  const [filters, setFilters] = useState<ExploreFiltersType>({});
  const [selectedPlace, setSelectedPlace] = useState<ExplorePlace | null>(null);
  const [dayDialogOpen, setDayDialogOpen] = useState(false);
  
  // Replace mode state (for replacing activities from itinerary)
  const [replaceTarget, setReplaceTarget] = useState<{ tripId: string; dayId: string; activityId: string; activityName?: string } | null>(null);
  
  // Gate for showing affiliate promo boxes (currently disabled)
  const showAffiliates = false;

  // Handle errors from trip and segments hooks
  useEffect(() => {
    if (tripError || segmentsError) {
      const error = tripError || segmentsError;
      // Check if it's a 403 or 500 error
      const isForbidden = error && (
        (error as any)?.message?.includes('Forbidden') ||
        (error as any)?.status === 403 ||
        (error as any)?.code === '403'
      );
      const isServerError = error && (
        (error as any)?.status === 500 ||
        (error as any)?.code === '500'
      );

      if (isForbidden || isServerError) {
        addToast({
          title: t('explore_error_loading_trip'),
          description: t('explore_error_couldnt_load'),
          variant: 'destructive',
        });
      } else {
        addToast({
          title: t('explore_error_loading_trip'),
          description: error?.message || t('explore_error_failed_load'),
          variant: 'destructive',
        });
      }
    }
  }, [tripError, segmentsError, addToast, t]);

  // Set initial segment if multi-city
  useEffect(() => {
    if (segments.length > 1 && !activeSegmentId) {
      setActiveSegmentId(segments[0].id);
    } else if (segments.length <= 1) {
      setActiveSegmentId(null);
    }
  }, [segments, activeSegmentId]);

  // Handle URL params for replace mode (for replacing activities from itinerary)
  useEffect(() => {
    const mode = searchParams.get('mode');
    const day = searchParams.get('day');
    const activity = searchParams.get('activity');

    if (mode === 'replace' && day && activity) {
      // Set replace target from URL params
      const newReplaceTarget = {
        tripId,
        dayId: day,
        activityId: activity,
      };
      setReplaceTarget(newReplaceTarget);
      
      // Fetch activity name for label
      const fetchActivityName = async () => {
        try {
          const response = await fetch(`/api/trips/${tripId}/smart-itinerary?mode=load`);
          if (response.ok) {
            const itinerary = await response.json();
            // Find the activity in the itinerary
            for (const itineraryDay of itinerary.days || []) {
              if (itineraryDay.id === day) {
                for (const slot of itineraryDay.slots || []) {
                  const place = slot.places?.find((p: any) => p.id === activity);
                  if (place) {
                    setReplaceTarget(prev => prev ? { ...prev, activityName: place.name } : null);
                    break;
                  }
                }
                break;
              }
            }
          }
        } catch (error) {
          console.error('[ReplaceMode] Failed to fetch activity name:', error);
          // Continue without activity name - not critical
        }
      };
      fetchActivityName();
    } else {
      setReplaceTarget(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, tripId]);

  // Handle adding place to itinerary - opens day selection dialog
  const handleAddToItinerary = (place: ExplorePlace) => {
    // Handle replace mode
    if (replaceTarget) {
      handleReplacePlace(place);
      return;
    }

    // Normal mode: open day selection dialog
    setSelectedPlace(place);
    setDayDialogOpen(true);
  };

  // Handle replacing an activity with a new place
  const handleReplacePlace = async (place: ExplorePlace) => {
    if (!replaceTarget || !place.place_id) {
      addToast({
        title: t('explore_toast_no_place_selected'),
        description: t('explore_toast_select_replace'),
        variant: 'default',
      });
      return;
    }

    try {
      const response = await fetch(`/api/trips/${tripId}/activities/${replaceTarget.activityId}/replace`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          place: {
            place_id: place.place_id,
            name: place.name,
            address: place.address,
            lat: place.lat,
            lng: place.lng,
            neighborhood: place.neighborhood,
            district: place.district,
            types: place.types,
            photo_url: place.photo_url,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        
        // Handle 409 (duplicate) error
        if (response.status === 409) {
          addToast({
            title: t('explore_toast_already_in_itinerary'),
            description: error.message || t('explore_toast_already_in_itinerary_desc'),
            variant: 'destructive',
          });
          return;
        }
        
        throw new Error(error.error || error.message || t('explore_toast_failed_replace'));
      }

      // Show success toast
      addToast({
        title: t('explore_toast_replaced'),
        description: t('explore_toast_replaced_desc'),
        variant: 'success',
      });

      // Clear URL params and navigate to itinerary tab
      setReplaceTarget(null);
      router.push(`/trips/${tripId}?tab=itinerary`);
    } catch (error: any) {
      addToast({
        title: t('explore_toast_error'),
        description: error.message || t('explore_toast_failed_replace'),
        variant: 'destructive',
      });
    }
  };

  // Handle day dialog close
  const handleDayDialogClose = (open: boolean) => {
    setDayDialogOpen(open);
    if (!open) {
      setSelectedPlace(null);
    }
  };

  // Show loading state
  if ((tripLoading || segmentsLoading) && !trip) {
    return (
      <div className="p-6">
        <div className="text-muted-foreground">{t('explore_loading_trip')}</div>
      </div>
    );
  }

  // Show error state for trip or segments errors (403/500)
  if (tripError || segmentsError) {
    const error = tripError || segmentsError;
    const isForbidden = error && (
      (error as any)?.message?.includes('Forbidden') ||
      (error as any)?.status === 403 ||
      (error as any)?.code === '403'
    );
    const isServerError = error && (
      (error as any)?.status === 500 ||
      (error as any)?.code === '500'
    );

    if (isForbidden || isServerError) {
      return (
        <div className="p-6 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            {t('explore_error_couldnt_load')}
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
          >
            {t('explore_button_refresh')}
          </Button>
        </div>
      );
    }
  }

  // Ensure trip exists before rendering
  if (!trip) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-muted-foreground mb-4">
          {t('explore_error_couldnt_load')}
        </p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
        >
          {t('explore_button_refresh')}
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Affiliate Promo Boxes - Hidden by default */}
      {showAffiliates && trip.start_date && trip.end_date && (
        <HotelSearchBanner tripId={tripId} className="p-4 border-b flex-shrink-0" />
      )}

      {/* Segment Selector - Only show if multi-city */}
      {segments.length > 1 && (
        <div className="px-6 py-3 border-b border-sage/20 flex-shrink-0">
          <Tabs value={activeSegmentId || undefined} onValueChange={setActiveSegmentId}>
            <TabsList className="w-full justify-start">
              {segments.map((segment) => (
                <TabsTrigger key={segment.id} value={segment.id} className="text-sm">
                  {segment.city_name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      )}

      {/* Replace mode banner */}
      {replaceTarget && replaceTarget.activityName && (
        <div className="px-6 py-3 border-b border-sage/20 bg-peach/20 flex-shrink-0">
          <p className="text-sm text-muted-foreground">
            {t('explore_replace_mode_replacing').replace('{name}', replaceTarget.activityName)}
          </p>
        </div>
      )}

      {/* Main Content - 2-column layout on desktop, single column on mobile */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Sidebar - Desktop only (Filters) */}
        <div className="hidden lg:flex lg:w-[340px] lg:flex-shrink-0 flex-col border-r border-sage/20 bg-cream/30 overflow-y-auto">
          <div className="p-6">
            <ExploreFilters filters={filters} onFiltersChange={setFilters} tripId={tripId} />
          </div>
        </div>

        {/* Main Area - Places List */}
        <div className="flex-1 overflow-hidden min-h-0">
          <ErrorBoundary
            fallbackTitle={t('explore_error_boundary_title')}
            fallbackMessage={t('explore_error_boundary_message')}
          >
            <ExplorePlaceList
              tripId={tripId}
              filters={filters}
              tripSegmentId={activeSegmentId || undefined}
              onAddToItinerary={handleAddToItinerary}
            />
          </ErrorBoundary>
        </div>
      </div>

      {/* Day Selection Dialog */}
      <ExploreAddToDayDialog
        open={dayDialogOpen}
        onOpenChange={handleDayDialogClose}
        place={selectedPlace}
        tripId={tripId}
      />
    </div>
  );
}
