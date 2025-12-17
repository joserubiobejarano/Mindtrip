"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { GoogleMapBase, BaseMarker } from "@/components/google-map-base";
import { useTrip } from "@/hooks/use-trip";
import { useActivities } from "@/hooks/use-activities";

interface TripMapPanelProps {
  tripId: string;
  selectedDayId: string | null;
  selectedActivityId?: string | null;
  activeTab: string;
  // Explore tab markers
  exploreMarkers?: BaseMarker[];
  exploreCenter?: { lat: number; lng: number } | null;
  exploreZoom?: number;
  onExploreMarkerClick?: (id: string) => void;
  activePlace?: { placeId: string; lat: number; lng: number } | null;
}

export function TripMapPanel({
  tripId,
  selectedDayId,
  selectedActivityId,
  activeTab,
  exploreMarkers = [],
  exploreCenter,
  exploreZoom,
  onExploreMarkerClick,
  activePlace,
}: TripMapPanelProps) {
  const { data: trip } = useTrip(tripId);
  const { activities } = useActivities(selectedDayId || "");
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const geolocationRequestedRef = useRef(false);
  const prevUserLocationRef = useRef<{ lat: number; lng: number } | null>(null);

  // Create stable activityIds key for dependency tracking
  const activityIds = useMemo(() => {
    if (!activities || activities.length === 0) return "";
    return activities
      .filter((a) => a.place?.lat != null && a.place?.lng != null)
      .map((a) => a.id)
      .sort()
      .join(",");
  }, [activities]);


  // Get markers based on active tab
  const getMarkers = (): BaseMarker[] => {
    if (activeTab === "explore") {
      return stableExploreMarkers;
    }
    if (activeTab === "itinerary" && activities) {
      return activities
        .filter(
          (activity) =>
            activity.place &&
            activity.place.lat != null &&
            activity.place.lng != null
        )
        .map((activity) => ({
          id: activity.id,
          lat: activity.place!.lat!,
          lng: activity.place!.lng!,
        }));
    }
    return [];
  };

  const handleMarkerClick = (id: string) => {
    if (activeTab === "explore" && onExploreMarkerClick) {
      onExploreMarkerClick(id);
    }
    // For itinerary, we could add activity selection here if needed
  };

  // Get user location on mount (Explore tab only)
  useEffect(() => {
    if (activeTab !== "explore") {
      geolocationRequestedRef.current = false;
      return;
    }
    
    // Only request geolocation once per tab switch
    if (geolocationRequestedRef.current) return;
    
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      geolocationRequestedRef.current = true;
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          
          // Only update if coordinates actually changed
          const prev = prevUserLocationRef.current;
          if (!prev || prev.lat !== newLocation.lat || prev.lng !== newLocation.lng) {
            prevUserLocationRef.current = newLocation;
            setUserLocation(newLocation);
          }
        },
        (error) => {
          // Silently fail - keep using trip center
          console.log("Geolocation error:", error.message);
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 300000, // Cache for 5 minutes
        }
      );
    }
  }, [activeTab]);

  // Track previous tab to detect tab changes
  const prevTabRef = useRef(activeTab);
  const prevCenterRef = useRef<{ lat: number; lng: number } | null>(null);
  const prevZoomRef = useRef<number | undefined>(undefined);
  const prevActivityIdsRef = useRef<string>("");
  
  // Extract primitives for dependency tracking
  const exploreCenterLat = exploreCenter?.lat;
  const exploreCenterLng = exploreCenter?.lng;
  const userLocationLat = userLocation?.lat;
  const userLocationLng = userLocation?.lng;
  const tripCenterLat = trip?.center_lat;
  const tripCenterLng = trip?.center_lng;
  const activitiesLength = activities?.length ?? 0;
  
  // Memoize exploreMarkers to prevent re-creation on every render
  // Create stable array reference only when contents change
  const markersKey = useMemo(() => {
    if (!exploreMarkers || exploreMarkers.length === 0) return "";
    return exploreMarkers.map(m => `${m.id}:${m.lat}:${m.lng}`).sort().join(',');
  }, [exploreMarkers]);
  
  const stableExploreMarkers = useMemo(() => {
    if (!exploreMarkers || exploreMarkers.length === 0) return [];
    // Create normalized array with stable structure
    return exploreMarkers.map(m => ({ id: m.id, lat: m.lat, lng: m.lng }));
  }, [exploreMarkers]);
  
  // Use initial center/zoom only - map will manage its own state after load
  // Memoize to prevent unnecessary re-renders when values haven't changed
  // IMPORTANT: Must be called before any early returns (Rules of Hooks)
  const initialCenter = useMemo(() => {
    if (activeTab === "explore" && exploreCenter) {
      return exploreCenter;
    }
    if (trip?.center_lat != null && trip?.center_lng != null) {
      return { lat: trip.center_lat, lng: trip.center_lng };
    }
    return { lat: 0, lng: 0 };
  }, [activeTab, exploreCenter, trip?.center_lat, trip?.center_lng]);
  
  const initialZoom = useMemo(() => {
    if (activeTab === "explore" && exploreZoom != null) {
      return exploreZoom;
    }
    // Closer zoom for city center view
    return 13;
  }, [activeTab, exploreZoom]);
  
  // Note: Removed automatic map focusing to prevent lag when zooming
  // The marker is still shown, but we don't force pan/zoom to avoid performance issues

  // Helper function to check if center coordinates changed
  const centerChanged = (newCenter: { lat: number; lng: number } | null): boolean => {
    const prev = prevCenterRef.current;
    if (!prev && !newCenter) return false;
    if (!prev || !newCenter) return true;
    return prev.lat !== newCenter.lat || prev.lng !== newCenter.lng;
  };

  // Update map center/zoom only when switching tabs or when values actually change
  useEffect(() => {
    if (!mapInstance) return;

    const tabChanged = prevTabRef.current !== activeTab;
    prevTabRef.current = activeTab;

    // Only update map position on tab change, initial load, or when values actually changed
    if (tabChanged || !mapInstance.getCenter()) {
      if (activeTab === "explore") {
        // On Explore tab, prefer user location if available, otherwise use exploreCenter or trip center
        let targetCenter: { lat: number; lng: number } | null = null;
        let targetZoom: number | undefined = undefined;

        if (userLocation && !exploreCenter) {
          targetCenter = userLocation;
          targetZoom = 14;
        } else if (exploreCenter) {
          targetCenter = exploreCenter;
          targetZoom = exploreZoom ?? undefined;
        } else if (trip?.center_lat != null && trip?.center_lng != null) {
          targetCenter = { lat: trip.center_lat, lng: trip.center_lng };
          targetZoom = 13;
        }

        if (targetCenter && centerChanged(targetCenter)) {
          prevCenterRef.current = targetCenter;
          mapInstance.panTo(targetCenter);
        }
        if (targetZoom != null && targetZoom !== prevZoomRef.current) {
          prevZoomRef.current = targetZoom;
          mapInstance.setZoom(targetZoom);
        }
      } else if (activeTab === "itinerary" && activities && activities.length > 0) {
        // Check if activity IDs changed (indicating activities actually changed)
        if (activityIds !== prevActivityIdsRef.current) {
          prevActivityIdsRef.current = activityIds;
          
          const activitiesWithPlaces = activities.filter(
            (activity) =>
              activity.place &&
              activity.place.lat != null &&
              activity.place.lng != null
          );

          if (activitiesWithPlaces.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            activitiesWithPlaces.forEach((activity) => {
              if (activity.place && activity.place.lat && activity.place.lng) {
                bounds.extend({
                  lat: activity.place.lat,
                  lng: activity.place.lng,
                });
              }
            });
            mapInstance.fitBounds(bounds);
          }
        }
      } else if (trip?.center_lat != null && trip?.center_lng != null) {
        const tripCenter = { lat: trip.center_lat, lng: trip.center_lng };
        if (centerChanged(tripCenter)) {
          prevCenterRef.current = tripCenter;
          mapInstance.panTo(tripCenter);
        }
        if (13 !== prevZoomRef.current) {
          prevZoomRef.current = 13;
          mapInstance.setZoom(13);
        }
      }
    } else {
      // Not a tab change - only update if explore center actually changed
      if (activeTab === "explore" && exploreCenter && centerChanged(exploreCenter)) {
        prevCenterRef.current = exploreCenter;
        mapInstance.panTo(exploreCenter);
        if (exploreZoom != null && exploreZoom !== prevZoomRef.current) {
          prevZoomRef.current = exploreZoom;
          mapInstance.setZoom(exploreZoom);
        }
      }
    }
  }, [
    activeTab,
    mapInstance,
    exploreCenter,
    exploreZoom,
    userLocation,
    trip?.center_lat,
    trip?.center_lng,
    activities,
    activityIds,
  ]);

  if (!trip) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <p className="text-sm text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  if (trip.center_lat == null || trip.center_lng == null) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <p className="text-sm text-muted-foreground">
          Trip location is required to display the map.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full w-full" style={{ pointerEvents: 'auto' }}>
      <GoogleMapBase
        center={initialCenter}
        zoom={initialZoom}
        markers={getMarkers()}
        onMarkerClick={handleMarkerClick}
        onMapLoad={(map) => {
          setMapInstance(map);
        }}
        className="h-full w-full"
      />
    </div>
  );
}

