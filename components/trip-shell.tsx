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
  const showMap = activeTab === "explore";
  
  return (
    <div className="h-[calc(100vh-80px)] flex flex-col md:flex-row overflow-hidden bg-gradient-to-br from-purple-50/30 via-white to-orange-50/20">
      {/* Map Panel - Left (Top on Mobile) - Only visible on Explore tab */}
      {showMap && (
        <div className="w-full md:flex-[0.6] h-[40vh] md:h-auto border-r-2 border-black/10 relative order-first">
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
      )}

      {/* Content Panel - Right (Bottom on Mobile) - 40% width on Explore, 100% on other tabs */}
      <div className={`flex flex-col bg-white/80 backdrop-blur-sm overflow-hidden ${showMap ? 'md:flex-[0.4]' : 'flex-1'} h-[60vh] md:h-auto relative z-10 shadow-lg ${showMap ? 'border-l-2 border-black/10' : ''}`}>
        {children}
      </div>
    </div>
  );
}

