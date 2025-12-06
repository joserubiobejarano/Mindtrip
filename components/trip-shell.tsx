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
      {/* Map Panel - Left (Hidden on Mobile for Explore tab) - Only visible on Explore tab */}
      {showMap && (
        <div className="hidden lg:flex lg:w-[50%] bg-sage/20 items-center justify-center overflow-hidden">
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

      {/* Content Panel - Right (Full screen on Mobile for Explore, 50% on Desktop) - 100% on other tabs */}
      <div className={`flex flex-col overflow-hidden ${showMap ? 'flex-1 lg:w-[50%] bg-cream' : 'flex-1 bg-background'}`}>
        {children}
      </div>
    </div>
  );
}

