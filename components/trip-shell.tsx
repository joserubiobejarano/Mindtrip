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
    <div className="h-[calc(100vh-80px)] flex flex-col md:flex-row overflow-hidden bg-gradient-to-br from-purple-50/30 via-white to-orange-50/20">
      {/* Map Panel - Left (Top on Mobile) - Only visible on Explore tab */}
      {showMap && (
        <div className="hidden lg:block lg:basis-[45%] h-[40vh] md:h-auto border-r border-border relative order-first">
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

      {/* Content Panel - Right (Bottom on Mobile) - 55% width on Explore, 100% on other tabs */}
      <div className={`flex flex-col bg-white/80 backdrop-blur-sm overflow-hidden ${showMap ? 'flex-1 lg:basis-[55%]' : 'flex-1'} h-[60vh] md:h-auto relative z-10 shadow-lg`}>
        {children}
      </div>
    </div>
  );
}

