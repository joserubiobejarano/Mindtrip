"use client";

import { useState, useEffect, Component, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ExploreDeck } from "./explore/ExploreDeck";
import { ExploreFilters } from "./explore/ExploreFilters";
import { SwipeCounter } from "./explore/SwipeCounter";
import { HotelSearchBanner } from "./hotel-search-banner";
import { useTrip } from "@/hooks/use-trip";
import { useTripSegments } from "@/hooks/use-trip-segments";
import { useExploreSession, useExplorePlaces } from "@/hooks/use-explore";
import { useToast } from "@/components/ui/toast";
import type { ExploreFilters as ExploreFiltersType } from "@/lib/google/explore-places";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

// Error boundary for Explore feature
class ExploreErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error?: Error; errorInfo?: any }
> {
  state = { hasError: false, error: undefined, errorInfo: undefined };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Comprehensive server-side logging for Vercel
    console.error('[Explore Error Boundary]', {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
      timestamp: new Date().toISOString(),
    });
    
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
          <div className="max-w-md space-y-4">
            <h2 className="text-lg font-semibold text-destructive">Something went wrong</h2>
            <p className="text-sm text-muted-foreground">
              We encountered an error while loading Explore. This has been logged and we&apos;ll look into it.
            </p>
            {this.state.error && (
              <details className="text-left mt-4 p-3 bg-muted rounded-md text-xs">
                <summary className="cursor-pointer text-muted-foreground mb-2">Error details</summary>
                <pre className="whitespace-pre-wrap break-words text-muted-foreground">
                  {(this.state.error as Error).message}
                  {(this.state.error as Error).stack && `\n\n${(this.state.error as Error).stack}`}
                </pre>
              </details>
            )}
            <Button
              onClick={this.handleReset}
              className="mt-6"
              variant="default"
            >
              Try again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface ExploreTabProps {
  tripId: string;
  onMapUpdate?: (
    markers: import("@/components/google-map-base").BaseMarker[],
    center: { lat: number; lng: number } | null,
    zoom: number | undefined
  ) => void;
  onMarkerClickRef?: React.MutableRefObject<((id: string) => void) | null>;
  onActivePlaceChange?: (place: { placeId: string; lat: number; lng: number }) => void;
}

export function ExploreTab({ tripId, onMapUpdate, onMarkerClickRef, onActivePlaceChange }: ExploreTabProps) {
  const router = useRouter();
  const { data: trip, isLoading: tripLoading, error: tripError } = useTrip(tripId);
  const { data: segments = [], isLoading: segmentsLoading, error: segmentsError } = useTripSegments(tripId);
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);
  const { 
    data: session, 
    isLoading: sessionLoading, 
    error: sessionError 
  } = useExploreSession(tripId, true, activeSegmentId || undefined);
  const { addToast } = useToast();
  const [filters, setFilters] = useState<ExploreFiltersType>({});
  const [isAddingToItinerary, setIsAddingToItinerary] = useState(false);
  const [activePlace, setActivePlace] = useState<{ placeId: string; lat: number; lng: number } | null>(null);
  
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
          title: 'Error loading trip',
          description: 'Couldn\'t load places, please refresh',
          variant: 'destructive',
        });
      } else {
        addToast({
          title: 'Error loading trip',
          description: error?.message || 'Failed to load trip data',
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

  const handleAddToItinerary = async () => {
    if (!safeSession || safeSession.likedPlaces.length === 0 || isAddingToItinerary) return;

    setIsAddingToItinerary(true);

    try {
      // Call distribution endpoint instead of regeneration
      const response = await fetch(`/api/trips/${tripId}/activities/distribute-liked-places`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          likedPlaceIds: safeSession.likedPlaces,
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
          title: 'Places added',
          description: `We added ${result.distributed} place${result.distributed !== 1 ? 's' : ''} to your last day. Consider removing some activities if it feels too packed.`,
          variant: 'default',
        });
      } else {
        addToast({
          title: 'Success!',
          description: `Added ${result.distributed} place${result.distributed !== 1 ? 's' : ''} to your itinerary`,
          variant: 'success',
        });
      }

      // Navigate to itinerary tab
      router.push(`/trips/${tripId}?tab=itinerary`);
    } catch (error: any) {
      addToast({
        title: 'Error',
        description: error.message || 'Failed to add places to itinerary',
        variant: 'destructive',
      });
    } finally {
      setIsAddingToItinerary(false);
    }
  };

  // Update map with active place marker (without forcing pan/zoom to avoid lag)
  useEffect(() => {
    if (onMapUpdate && activePlace) {
      // Only update markers, don't force center/zoom to avoid lag
      onMapUpdate(
        [{
          id: activePlace.placeId,
          lat: activePlace.lat,
          lng: activePlace.lng,
        }],
        null, // Don't force center
        undefined // Don't force zoom
      );
    } else if (onMapUpdate && !activePlace) {
      // Clear markers when no active place
      onMapUpdate([], null, undefined);
    }
  }, [onMapUpdate, activePlace]);

  // Show loading state
  if ((tripLoading || segmentsLoading) && !trip) {
    return (
      <div className="p-6">
        <div className="text-muted-foreground">Loading trip...</div>
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
            Couldn't load places, please refresh
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
          >
            Refresh
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
          Couldn't load places, please refresh
        </p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
        >
          Refresh
        </Button>
      </div>
    );
  }

  // Handle session error gracefully - don't crash, show fallback
  if (sessionError && !sessionLoading) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Unable to load explore session. Please refresh the page.
        </p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
        >
          Refresh
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

      {/* Filters Section - Hidden on mobile for full-screen card experience */}
      <div className="hidden lg:block px-6 py-4 border-b border-sage/20 flex-shrink-0">
        <ExploreFilters filters={filters} onFiltersChange={setFilters} tripId={tripId} />
      </div>

      {/* Swipe limit message - only shown when limit is reached - Hidden on mobile */}
      <div className="hidden lg:block px-6 pt-4 flex-shrink-0">
        <SwipeCounter tripId={tripId} />
      </div>

      {/* Swipe Deck - Full screen on mobile, centered on desktop */}
      <div className="flex-1 flex items-center justify-center overflow-hidden min-h-0 lg:p-6">
        <ExploreErrorBoundary>
          <ExploreDeck
            tripId={tripId}
            filters={filters}
            mode="trip"
            tripSegmentId={activeSegmentId || undefined}
            onAddToItinerary={isAddingToItinerary ? undefined : handleAddToItinerary}
            onActivePlaceChange={(place) => {
              setActivePlace(place);
              onActivePlaceChange?.(place);
            }}
            hideHeader={true}
          />
        </ExploreErrorBoundary>
      </div>
    </div>
  );
}
