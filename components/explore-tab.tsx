"use client";

import { useState, useEffect, Component, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ExploreDeck } from "./explore/ExploreDeck";
import { ExploreFilters } from "./explore/ExploreFilters";
import { HotelSearchBanner } from "./hotel-search-banner";
import { useTrip } from "@/hooks/use-trip";
import { useExploreSession } from "@/hooks/use-explore";
import { useToast } from "@/components/ui/toast";
import { Loader2 } from "lucide-react";
import type { ExploreFilters as ExploreFiltersType } from "@/lib/google/explore-places";

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
}

export function ExploreTab({ tripId, onMapUpdate, onMarkerClickRef }: ExploreTabProps) {
  const router = useRouter();
  const { data: trip } = useTrip(tripId);
  const { data: session, isLoading: sessionLoading } = useExploreSession(tripId);
  const { addToast } = useToast();
  const [filters, setFilters] = useState<ExploreFiltersType>({});
  const [isAddingToItinerary, setIsAddingToItinerary] = useState(false);

  const handleAddToItinerary = async () => {
    if (!session || session.likedPlaces.length === 0 || isAddingToItinerary) return;

    setIsAddingToItinerary(true);

    try {
      // Call itinerary regeneration API with liked places
      const response = await fetch(`/api/trips/${tripId}/smart-itinerary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          must_include_place_ids: session.likedPlaces,
          preserve_structure: true, // Preserve existing day structure when regenerating
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to regenerate itinerary');
      }

      addToast({
        title: 'Success!',
        description: `Added ${session.likedPlaces.length} place${session.likedPlaces.length !== 1 ? 's' : ''} to your itinerary`,
        variant: 'success',
      });

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

  // Clear map markers since we're not showing a map in swipe mode
  useEffect(() => {
    if (onMapUpdate) {
      onMapUpdate([], null, undefined);
    }
  }, [onMapUpdate]);

  if (!trip) {
    return (
      <div className="p-6">
        <div className="text-muted-foreground">Loading trip...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Hotel Banner */}
      {trip.start_date && trip.end_date && (
        <HotelSearchBanner tripId={tripId} className="p-4 border-b flex-shrink-0" />
      )}

      {/* Filters Section */}
      <div className="p-4 border-b flex-shrink-0 overflow-x-auto">
        <ExploreFilters filters={filters} onFiltersChange={setFilters} />
      </div>

      {/* Swipe Deck */}
      <div className="flex-1 overflow-hidden min-h-0">
        <ExploreErrorBoundary>
          {sessionLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ExploreDeck
              tripId={tripId}
              filters={filters}
              onAddToItinerary={isAddingToItinerary ? undefined : handleAddToItinerary}
            />
          )}
        </ExploreErrorBoundary>
      </div>
    </div>
  );
}
