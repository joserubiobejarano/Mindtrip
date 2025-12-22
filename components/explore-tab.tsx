"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ExploreDeck } from "./explore/ExploreDeck";
import { ExploreFilters } from "./explore/ExploreFilters";
import { SwipeCounter } from "./explore/SwipeCounter";
import { ExplorePlaceDetailsCard } from "./explore/ExplorePlaceDetailsCard";
import { HotelSearchBanner } from "./hotel-search-banner";
import { ErrorBoundary } from "./error-boundary";
import { useTrip } from "@/hooks/use-trip";
import { useTripSegments } from "@/hooks/use-trip-segments";
import { useExploreSession, useExplorePlaces } from "@/hooks/use-explore";
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
  const debugMode = searchParams.get('debugExplore');
  const hideDeck = debugMode === 'noDeck';
  const { data: trip, isLoading: tripLoading, error: tripError } = useTrip(tripId);
  const { data: segments = [], isLoading: segmentsLoading, error: segmentsError } = useTripSegments(tripId);
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);
  const { 
    data: session, 
    isLoading: sessionLoading, 
    error: sessionError 
  } = useExploreSession(tripId, true, activeSegmentId || undefined);
  const { addToast } = useToast();
  const { t } = useLanguage();
  const [filters, setFilters] = useState<ExploreFiltersType>({});
  const [isAddingToItinerary, setIsAddingToItinerary] = useState(false);
  const [currentPlace, setCurrentPlace] = useState<ExplorePlace | null>(null);
  
  // Replace mode state
  const [replaceTarget, setReplaceTarget] = useState<{ tripId: string; dayId: string; activityId: string; activityName?: string } | null>(null);
  
  // Gate for showing affiliate promo boxes (currently disabled)
  const showAffiliates = false;
  
  // Safe default for session - never throw in render
  const safeSession = session || {
    likedPlaces: [],
    discardedPlaces: [],
    swipeCount: 0,
    remainingSwipes: null,
    dailyLimit: null,
  };

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
  }, [tripError, segmentsError, addToast]);

  // Set initial segment if multi-city
  useEffect(() => {
    if (segments.length > 1 && !activeSegmentId) {
      setActiveSegmentId(segments[0].id);
    } else if (segments.length <= 1) {
      setActiveSegmentId(null);
    }
  }, [segments, activeSegmentId]);

  // Handle URL params for add/replace modes
  useEffect(() => {
    const mode = searchParams.get('mode');
    const day = searchParams.get('day');
    const slot = searchParams.get('slot');
    const activity = searchParams.get('activity');

    if (mode === 'add' && day && slot) {
      addToast({
        title: t('explore_toast_add_activities'),
        description: t('explore_toast_select_place'),
        variant: 'default',
      });
      setReplaceTarget(null);
    } else if (mode === 'replace' && day && activity) {
      // Set replace target from URL params
      const newReplaceTarget = {
        tripId,
        dayId: day,
        activityId: activity,
      };
      setReplaceTarget(newReplaceTarget);
      
      // DEV logging
      if (process.env.NODE_ENV === 'development') {
        console.debug('[ReplaceMode] target', newReplaceTarget);
      }

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

  // Log mount/unmount for debugging
  useEffect(() => {
    console.log('[DEBUG] ExploreTab mounted');
    return () => {
      console.log('[DEBUG] ExploreTab unmounted');
    };
  }, []);

  useEffect(() => {
    if (!hideDeck) {
      console.log('[DEBUG] ExploreDeck mounted');
      return () => {
        console.log('[DEBUG] ExploreDeck unmounted');
      };
    }
  }, [hideDeck]);

  const handleAddToItinerary = async (selectedPlace?: ExplorePlace) => {
    // Handle replace mode
    if (replaceTarget) {
      if (!selectedPlace || !selectedPlace.place_id) {
        addToast({
          title: t('explore_toast_no_place_selected'),
          description: t('explore_toast_select_replace'),
          variant: 'default',
        });
        return;
      }

      if (isAddingToItinerary) return;
      setIsAddingToItinerary(true);

      try {
        // Pass the full ExplorePlace object to the API
        const response = await fetch(`/api/trips/${tripId}/activities/${replaceTarget.activityId}/replace`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            place: {
              place_id: selectedPlace.place_id,
              name: selectedPlace.name,
              address: selectedPlace.address,
              lat: selectedPlace.lat,
              lng: selectedPlace.lng,
              neighborhood: selectedPlace.neighborhood,
              district: selectedPlace.district,
              types: selectedPlace.types,
              photo_url: selectedPlace.photo_url,
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
            // Keep user in Explore to pick another
            return;
          }
          
          throw new Error(error.error || error.message || t('explore_toast_failed_replace'));
        }

        // DEV logging
        if (process.env.NODE_ENV === 'development') {
          console.debug('[ReplaceMode] replacing with', selectedPlace.place_id, selectedPlace.name);
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
      } finally {
        setIsAddingToItinerary(false);
      }
      return;
    }

    // Normal add mode (existing flow)
    if (!safeSession || (safeSession.likedPlaces?.length ?? 0) === 0 || isAddingToItinerary) return;
    setIsAddingToItinerary(true);

    try {
      // Call distribution endpoint instead of regeneration
      const response = await fetch(`/api/trips/${tripId}/activities/distribute-liked-places`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          likedPlaceIds: safeSession.likedPlaces || [],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add places to itinerary');
      }

      const result = await response.json();

      // Show appropriate toast based on distribution result
      if (result.addedToLastDayOnly) {
        addToast({
          title: t('explore_toast_places_added'),
          description: t('explore_toast_places_added_last_day').replace('{count}', result.distributed.toString()),
          variant: 'default',
        });
      } else {
        addToast({
          title: t('explore_toast_success'),
          description: t('explore_toast_added_to_itinerary').replace('{count}', result.distributed.toString()),
          variant: 'success',
        });
      }

      // Navigate to itinerary tab
      router.push(`/trips/${tripId}?tab=itinerary`);
    } catch (error: any) {
      addToast({
        title: t('explore_toast_error'),
        description: error.message || t('explore_toast_failed_add'),
        variant: 'destructive',
      });
    } finally {
      setIsAddingToItinerary(false);
    }
  };

  // Legacy callback handler (kept for backwards compatibility but not used for map updates)
  const handleActivePlaceChange = useCallback((place: { placeId: string; lat: number; lng: number }) => {
    // Call parent callback if provided (but map is no longer rendered in Explore)
    onActivePlaceChange?.(place);
  }, [onActivePlaceChange]);

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

  // Handle session error gracefully - don't crash, show fallback
  if (sessionError && !sessionLoading) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-muted-foreground mb-4">
          {t('explore_error_session')}
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

      {/* Main Content - 2-column layout on desktop, full screen on mobile */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Sidebar - Desktop only */}
        <div className="hidden lg:flex lg:w-[340px] lg:flex-shrink-0 flex-col border-r border-sage/20 bg-cream/30 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Filters */}
            <div>
              <ExploreFilters filters={filters} onFiltersChange={setFilters} tripId={tripId} />
            </div>

            {/* Swipe Counter */}
            <div>
              <SwipeCounter tripId={tripId} />
            </div>

            {/* Place Details Card */}
            <div>
              <ExplorePlaceDetailsCard place={currentPlace} tripCity={trip?.destination_name || undefined} />
            </div>
          </div>
        </div>

        {/* Right Main Area - Swipe Deck */}
        <div className="flex-1 flex items-center justify-center overflow-hidden min-h-0 p-4 lg:p-8">
          {hideDeck ? (
            <div className="text-sm text-muted-foreground">ExploreDeck hidden (debug mode: noDeck)</div>
          ) : (
            <ErrorBoundary
              fallbackTitle={t('explore_error_boundary_title')}
              fallbackMessage={t('explore_error_boundary_message')}
            >
              <ExploreDeck
                tripId={tripId}
                filters={filters}
                mode="trip"
                tripSegmentId={activeSegmentId || undefined}
                onAddToItinerary={isAddingToItinerary ? undefined : handleAddToItinerary}
                onActivePlaceChange={handleActivePlaceChange}
                onCurrentPlaceChange={setCurrentPlace}
                hideHeader={true}
                replaceTarget={replaceTarget ? { tripId: replaceTarget.tripId, dayId: replaceTarget.dayId, activityId: replaceTarget.activityId } : undefined}
                replacingActivityName={replaceTarget?.activityName}
              />
            </ErrorBoundary>
          )}
        </div>
      </div>
    </div>
  );
}
