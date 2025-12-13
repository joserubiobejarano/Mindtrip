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

// Error boundary for Explore feature
class ExploreErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error?: Error }
> {
  state = { hasError: false, error: undefined };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ExploreError:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center">
          <p className="text-lg font-medium mb-2 text-destructive">Something went wrong loading Explore.</p>
          <p className="text-sm text-muted-foreground">Please refresh the page and try again.</p>
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
  const { data: trip } = useTrip(tripId);
  const { data: segments = [] } = useTripSegments(tripId);
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);
  const { data: session, isLoading: sessionLoading } = useExploreSession(tripId, true, activeSegmentId || undefined);
  const { addToast } = useToast();
  const [filters, setFilters] = useState<ExploreFiltersType>({});
  const [isAddingToItinerary, setIsAddingToItinerary] = useState(false);
  const [activePlace, setActivePlace] = useState<{ placeId: string; lat: number; lng: number } | null>(null);
  
  // Gate for showing affiliate promo boxes (currently disabled)
  const showAffiliates = false;

  // Set initial segment if multi-city
  useEffect(() => {
    if (segments.length > 1 && !activeSegmentId) {
      setActiveSegmentId(segments[0].id);
    } else if (segments.length <= 1) {
      setActiveSegmentId(null);
    }
  }, [segments, activeSegmentId]);

  const handleAddToItinerary = async () => {
    if (!session || session.likedPlaces.length === 0 || isAddingToItinerary) return;

    setIsAddingToItinerary(true);

    try {
      // Call distribution endpoint instead of regeneration
      const response = await fetch(`/api/trips/${tripId}/activities/distribute-liked-places`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          likedPlaceIds: session.likedPlaces,
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

  if (!trip) {
    return (
      <div className="p-6">
        <div className="text-muted-foreground">Loading trip...</div>
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
