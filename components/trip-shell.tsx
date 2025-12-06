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
  const showMap = activeTab === "explore";
  
  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Map Panel - Left (Top on Mobile) - Only visible on Explore tab */}
      {showMap && (
        <div className="flex-1 bg-sage/20 flex items-center justify-center overflow-hidden">
          <TripMapPanel
            tripId={tripId}
            selectedDayId={selectedDayId}
            selectedActivityId={selectedActivityId}
            activeTab={activeTab}
            exploreMarkers={exploreMarkers}
            exploreCenter={exploreCenter}
            exploreZoom={exploreZoom}
            onExploreMarkerClick={onExploreMarkerClick}
            activePlace={activePlace}
          />
        </div>
      )}

      {/* Content Panel - Right (Bottom on Mobile) - Fixed width on Explore, 100% on other tabs */}
      <div className={`flex flex-col overflow-hidden ${showMap ? 'w-[500px] bg-cream' : 'flex-1 bg-background'}`}>
        {children}
      </div>
    </div>
  );
}

