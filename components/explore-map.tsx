"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface PlaceResult {
  id: string;
  place_id?: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  category?: string;
}

interface SavedPlace {
  place_id: string;
  id: string;
  name: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  category: string | null;
}

interface ExploreMapProps {
  tripId: string;
  centerLat?: number | null;
  centerLng?: number | null;
  searchResults: PlaceResult[];
  savedPlaces: SavedPlace[];
  selectedPlace: PlaceResult | SavedPlace | null;
  onPlaceSelect?: (place: PlaceResult | SavedPlace) => void;
  height?: string;
  className?: string;
}

export function ExploreMap({
  tripId,
  centerLat,
  centerLng,
  searchResults,
  savedPlaces,
  selectedPlace,
  onPlaceSelect,
  height = "100%",
  className,
}: ExploreMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || map.current) return;

    mapboxgl.accessToken = mapboxToken;
    
    // Disable Mapbox telemetry to prevent errors from ad blockers
    if (typeof mapboxgl !== "undefined" && "setTelemetryEnabled" in mapboxgl) {
      // @ts-expect-error: mapboxgl.setTelemetryEnabled may not be typed
      mapboxgl.setTelemetryEnabled(false);
    }

    const initialCenter: [number, number] =
      centerLat && centerLng ? [centerLng, centerLat] : [0, 0];
    const initialZoom = centerLat && centerLng ? 11 : 2;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: initialCenter,
      zoom: initialZoom,
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
  }, [mapboxToken, centerLat, centerLng]);

  // Center map on trip destination when map loads
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    if (centerLat && centerLng) {
      map.current.flyTo({
        center: [centerLng, centerLat],
        zoom: 11,
        duration: 1000,
      });
    }
  }, [mapLoaded, centerLat, centerLng]);

  // Update markers when search results or saved places change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Combine search results and saved places
    const allPlaces: (PlaceResult | SavedPlace)[] = [
      ...searchResults,
      ...savedPlaces,
    ].filter(
      (place) =>
        place.lat !== null &&
        place.lat !== undefined &&
        place.lng !== null &&
        place.lng !== undefined &&
        place.lat !== 0 &&
        place.lng !== 0
    );

    if (allPlaces.length === 0) return;

    // Create markers for each place
    allPlaces.forEach((place) => {
      const lat = place.lat || 0;
      const lng = place.lng || 0;

      if (lat === 0 || lng === 0) return;

      // Check if this is a saved place (has place_id)
      const isSaved = place.place_id !== undefined && place.place_id !== null;
      
      // Check if this place is selected
      // Compare by place_id first (most reliable), then by external id (if both are PlaceResult)
      let isSelected = false;
      if (selectedPlace) {
        // First try to match by place_id (database ID) - most reliable
        if (place.place_id && selectedPlace.place_id) {
          isSelected = place.place_id === selectedPlace.place_id;
        }
        // If not matched and both have external_id (id starts with "poi."), match by external_id
        else if (
          place.id &&
          selectedPlace.id &&
          place.id.startsWith("poi.") &&
          selectedPlace.id.startsWith("poi.")
        ) {
          isSelected = place.id === selectedPlace.id;
        }
      }

      const markerElement = document.createElement("div");
      markerElement.className = "explore-place-marker";
      markerElement.style.width = isSaved ? "28px" : "24px";
      markerElement.style.height = isSaved ? "28px" : "24px";
      markerElement.style.borderRadius = "50%";
      markerElement.style.backgroundColor = isSelected
        ? "#3b82f6"
        : isSaved
        ? "#fbbf24"
        : "#ef4444";
      markerElement.style.border = "2px solid white";
      markerElement.style.cursor = "pointer";
      markerElement.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-2">
          <h3 class="font-semibold text-sm">${place.name}</h3>
          ${place.address ? `<p class="text-xs text-gray-500 mt-1">${place.address}</p>` : ""}
        </div>
      `);

      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map.current!);

      // Add click handler to marker
      markerElement.addEventListener("click", () => {
        if (onPlaceSelect) {
          onPlaceSelect(place);
        }
      });

      // Open popup and highlight if selected
      if (isSelected) {
        marker.togglePopup();
      }

      markersRef.current.push(marker);
    });

    // Fit map to show all markers if there are multiple
    if (allPlaces.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      allPlaces.forEach((place) => {
        if (place.lat && place.lng) {
          bounds.extend([place.lng, place.lat]);
        }
      });
      map.current.fitBounds(bounds, {
        padding: 50,
        duration: 1000,
      });
    }
  }, [searchResults, savedPlaces, mapLoaded, selectedPlace, onPlaceSelect]);

  // Center map on selected place when it changes
  useEffect(() => {
    if (!map.current || !mapLoaded || !selectedPlace) return;

    const lat = selectedPlace.lat;
    const lng = selectedPlace.lng;

    if (!lat || !lng || lat === 0 || lng === 0) return;

    map.current.flyTo({
      center: [lng, lat],
      zoom: 14,
      duration: 1000,
    });
  }, [selectedPlace, mapLoaded]);

  if (!mapboxToken) {
    return (
      <div
        className="w-full bg-gray-200 flex items-center justify-center rounded-lg"
        style={{ height }}
      >
        <p className="text-sm text-muted-foreground p-4">
          Mapbox token not configured. Please add NEXT_PUBLIC_MAPBOX_TOKEN to
          your .env.local file.
        </p>
      </div>
    );
  }

  return (
    <div className={`relative w-full overflow-hidden ${className || "rounded-lg border"}`} style={{ height }}>
      <div ref={mapContainer} className="h-full w-full" />
      {/* Map controls */}
      {mapLoaded && map.current && (
        <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg p-2">
          <button
            onClick={() => {
              if (map.current) {
                map.current.zoomIn();
              }
            }}
            className="block w-8 h-8 mb-1 border rounded hover:bg-gray-100 font-semibold"
          >
            +
          </button>
          <button
            onClick={() => {
              if (map.current) {
                map.current.zoomOut();
              }
            }}
            className="block w-8 h-8 border rounded hover:bg-gray-100 font-semibold"
          >
            −
          </button>
        </div>
      )}
    </div>
  );
}

