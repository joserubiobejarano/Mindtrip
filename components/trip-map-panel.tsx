"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { GoogleMapBase, BaseMarker } from "@/components/google-map-base";
import { useTrip } from "@/hooks/use-trip";
import { useActivities } from "@/hooks/use-activities";
import { getDayRoute, RouteLeg } from "@/lib/mapboxDirections";

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
}: TripMapPanelProps) {
  const { data: trip } = useTrip(tripId);
  const { activities } = useActivities(selectedDayId || "");
  const [routePath, setRoutePath] = useState<google.maps.LatLngLiteral[]>([]);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Calculate route for itinerary tab
  useEffect(() => {
    if (activeTab !== "itinerary" || !selectedDayId || !activities || activities.length < 2) {
      setRoutePath([]);
      return;
    }

    const activitiesWithValidPlaces = activities
      .filter(
        (activity) =>
          activity.place &&
          activity.place.lat != null &&
          activity.place.lng != null &&
          !isNaN(activity.place.lat) &&
          !isNaN(activity.place.lng)
      )
      .map((activity) => ({
        id: activity.id,
        place: {
          lat: activity.place!.lat!,
          lng: activity.place!.lng!,
        },
      }));

    if (activitiesWithValidPlaces.length < 2) {
      setRoutePath([]);
      return;
    }

    getDayRoute(activitiesWithValidPlaces).then((result) => {
      // Convert Mapbox route to Google Maps format
      if (result.routeLineGeoJson && result.routeLineGeoJson.coordinates) {
        const path = result.routeLineGeoJson.coordinates.map((coord) => ({
          lat: coord[1],
          lng: coord[0],
        }));
        setRoutePath(path);
      } else {
        setRoutePath([]);
      }
    });
  }, [activities, selectedDayId, activeTab]);

  // Get initial center and zoom based on active tab (only used on mount or tab change)
  const getInitialMapCenter = useCallback(() => {
    if (activeTab === "explore" && exploreCenter) {
      return exploreCenter;
    }
    if (trip?.center_lat != null && trip?.center_lng != null) {
      return { lat: trip.center_lat, lng: trip.center_lng };
    }
    return { lat: 0, lng: 0 };
  }, [activeTab, exploreCenter, trip?.center_lat, trip?.center_lng]);

  const getInitialMapZoom = useCallback(() => {
    if (activeTab === "explore" && exploreZoom != null) {
      return exploreZoom;
    }
    return 12;
  }, [activeTab, exploreZoom]);

  // Get markers based on active tab
  const getMarkers = (): BaseMarker[] => {
    if (activeTab === "explore") {
      return exploreMarkers;
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
    if (activeTab !== "explore") return;
    
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
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
  
  // Update map center/zoom only when switching tabs (not on every explore state change)
  useEffect(() => {
    if (!mapInstance) return;

    const tabChanged = prevTabRef.current !== activeTab;
    prevTabRef.current = activeTab;

    // Only update map position on tab change or initial load
    if (tabChanged || !mapInstance.getCenter()) {
      if (activeTab === "explore") {
        // On Explore tab, prefer user location if available, otherwise use exploreCenter or trip center
        if (userLocation && !exploreCenter) {
          mapInstance.panTo(userLocation);
          mapInstance.setZoom(14);
        } else if (exploreCenter) {
          mapInstance.panTo(exploreCenter);
          if (exploreZoom != null) {
            mapInstance.setZoom(exploreZoom);
          }
        } else if (trip?.center_lat != null && trip?.center_lng != null) {
          mapInstance.panTo({ lat: trip.center_lat, lng: trip.center_lng });
          mapInstance.setZoom(12);
        }
      } else if (activeTab === "itinerary" && activities && activities.length > 0) {
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
      } else if (trip?.center_lat != null && trip?.center_lng != null) {
        mapInstance.panTo({ lat: trip.center_lat, lng: trip.center_lng });
        mapInstance.setZoom(12);
      }
    }
  }, [activeTab, mapInstance, activities, trip, userLocation, exploreCenter, exploreZoom]);

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

  // Use initial center/zoom only - map will manage its own state after load
  const initialCenter = getInitialMapCenter();
  const initialZoom = getInitialMapZoom();

  return (
    <div className="h-full w-full" style={{ pointerEvents: 'auto' }}>
      <GoogleMapBase
        center={initialCenter}
        zoom={initialZoom}
        markers={getMarkers()}
        routePath={activeTab === "itinerary" && routePath.length > 0 ? routePath : undefined}
        onMarkerClick={handleMarkerClick}
        onMapLoad={(map) => {
          setMapInstance(map);
        }}
        className="h-full w-full"
      />
    </div>
  );
}

