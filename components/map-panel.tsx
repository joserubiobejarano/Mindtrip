"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useActivities } from "@/hooks/use-activities";
import { useDays } from "@/hooks/use-days";
import { useTrip } from "@/hooks/use-trip";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

interface MapPanelProps {
  tripId: string;
  selectedDayId: string | null;
  selectedActivityId?: string | null;
}

export function MapPanel({
  tripId,
  selectedDayId,
  selectedActivityId,
}: MapPanelProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  const { data: days } = useDays(tripId);
  const { data: trip } = useTrip(tripId);
  const { activities } = useActivities(selectedDayId || "");

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || map.current) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [0, 0],
      zoom: 2,
    });

    map.current.on("load", () => {
      setMapLoaded(true);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken]);

  // Update markers when activities change
  useEffect(() => {
    if (!map.current || !mapLoaded || !activities) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Filter activities with places that have coordinates
    const activitiesWithPlaces = activities.filter(
      (activity) =>
        activity.place &&
        activity.place.lat !== null &&
        activity.place.lng !== null
    );

    if (activitiesWithPlaces.length === 0) {
      // If no activities, center on trip destination if available
      if (map.current) {
        if (trip?.center_lat && trip?.center_lng) {
          map.current.flyTo({
            center: [trip.center_lng, trip.center_lat],
            zoom: 10,
            duration: 1000,
          });
        } else {
          // Fall back to default location
          map.current.setCenter([0, 0]);
          map.current.setZoom(2);
        }
      }
      return;
    }

    // Create markers for each activity
    activitiesWithPlaces.forEach((activity) => {
      if (!activity.place || !activity.place.lat || !activity.place.lng) return;

      const markerElement = document.createElement("div");
      markerElement.className = "activity-marker";
      markerElement.style.width = "32px";
      markerElement.style.height = "32px";
      markerElement.style.borderRadius = "50%";
      markerElement.style.backgroundColor =
        selectedActivityId === activity.id ? "#3b82f6" : "#ef4444";
      markerElement.style.border = "2px solid white";
      markerElement.style.cursor = "pointer";

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-2">
          <h3 class="font-semibold text-sm">${activity.title}</h3>
          ${activity.start_time ? `<p class="text-xs text-gray-600">${format(new Date(`2000-01-01T${activity.start_time}`), "h:mm a")}</p>` : ""}
          ${activity.place?.address ? `<p class="text-xs text-gray-500 mt-1">${activity.place.address}</p>` : ""}
        </div>
      `);

      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([activity.place.lng, activity.place.lat])
        .setPopup(popup)
        .addTo(map.current!);

      if (selectedActivityId === activity.id) {
        marker.togglePopup();
        map.current!.flyTo({
          center: [activity.place.lng, activity.place.lat],
          zoom: 14,
          duration: 1000,
        });
      }

      markersRef.current.push(marker);
    });

    // Fit map to show all markers
    if (activitiesWithPlaces.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      activitiesWithPlaces.forEach((activity) => {
        if (activity.place && activity.place.lat && activity.place.lng) {
          bounds.extend([activity.place.lng, activity.place.lat]);
        }
      });
      map.current.fitBounds(bounds, {
        padding: 50,
        duration: 1000,
      });
    } else if (activitiesWithPlaces.length === 1) {
      const activity = activitiesWithPlaces[0];
      if (activity.place && activity.place.lat && activity.place.lng) {
        map.current.flyTo({
          center: [activity.place.lng, activity.place.lat],
          zoom: 14,
          duration: 1000,
        });
      }
    }
  }, [activities, selectedActivityId, mapLoaded, trip]);

  if (!mapboxToken) {
    return (
      <div className="h-full w-full bg-gray-200 flex items-center justify-center">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              Mapbox token not configured. Please add NEXT_PUBLIC_MAPBOX_TOKEN to
              your .env.local file.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div ref={mapContainer} className="h-full w-full relative">
      {/* Map controls */}
      {mapLoaded && map.current && (
        <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg p-2">
          <button
            onClick={() => {
              if (map.current) {
                map.current.zoomIn();
              }
            }}
            className="block w-8 h-8 mb-1 border rounded hover:bg-gray-100"
          >
            +
          </button>
          <button
            onClick={() => {
              if (map.current) {
                map.current.zoomOut();
              }
            }}
            className="block w-8 h-8 border rounded hover:bg-gray-100"
          >
            −
          </button>
        </div>
      )}
    </div>
  );
}
