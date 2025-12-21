"use client";

import { BaseMarker } from "@/components/google-map-base";

interface TripShellProps {
  tripId: string;
  activeTab: string;
  children: React.ReactNode;
  // Map props (only used for Itinerary tab now)
  selectedDayId: string | null;
  selectedActivityId?: string | null;
  exploreMarkers?: BaseMarker[];
  exploreCenter?: { lat: number; lng: number } | null;
  exploreZoom?: number;
  onExploreMarkerClick?: (id: string) => void;
  activePlace?: { placeId: string; lat: number; lng: number } | null;
}

export function TripShell({
  tripId,
  activeTab,
  children,
  selectedDayId,
  selectedActivityId,
  exploreMarkers,
  exploreCenter,
  exploreZoom,
  onExploreMarkerClick,
  activePlace,
}: TripShellProps) {
  // Explore tab no longer uses map - content is full width
  // Map props are kept for potential future use with other tabs but not used for Explore
  
  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Content Panel - Full width for all tabs now */}
      <div className="flex-1 bg-background flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}

