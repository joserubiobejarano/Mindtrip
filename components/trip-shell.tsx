"use client";

import { TripMapPanel } from "@/components/trip-map-panel";
import { BaseMarker } from "@/components/google-map-base";

interface TripShellProps {
  tripId: string;
  activeTab: string;
  children: React.ReactNode;
  // Map props
  selectedDayId: string | null;
  selectedActivityId?: string | null;
  exploreMarkers?: BaseMarker[];
  exploreCenter?: { lat: number; lng: number } | null;
  exploreZoom?: number;
  onExploreMarkerClick?: (id: string) => void;
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
}: TripShellProps) {
  return (
    <div className="h-[calc(100vh-64px)] flex flex-col md:flex-row overflow-hidden">
      {/* Map Panel - Left (Top on Mobile) */}
      <div className="w-full md:w-1/2 h-[40vh] md:h-auto border-r relative order-first">
        <TripMapPanel
          tripId={tripId}
          selectedDayId={selectedDayId}
          selectedActivityId={selectedActivityId}
          activeTab={activeTab}
          exploreMarkers={exploreMarkers}
          exploreCenter={exploreCenter}
          exploreZoom={exploreZoom}
          onExploreMarkerClick={onExploreMarkerClick}
        />
      </div>

      {/* Content Panel - Right (Bottom on Mobile) */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden h-[60vh] md:h-auto relative z-10">
        {children}
      </div>
    </div>
  );
}

