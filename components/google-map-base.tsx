"use client";

import { GoogleMap, Marker, Polyline } from "@react-google-maps/api";
import { useMemo, memo } from "react";
import { useGoogleMaps } from "./google-maps-provider";
import {
  DEFAULT_MAP_CONTAINER_STYLE,
  DEFAULT_MAP_OPTIONS,
  DEFAULT_POLYLINE_OPTIONS,
} from "@/lib/google/maps-config";

export interface BaseMarker {
  id: string;
  lat: number;
  lng: number;
}

export interface GoogleMapBaseProps {
  center: { lat: number; lng: number } | null;
  zoom?: number;
  markers?: BaseMarker[];
  routePath?: google.maps.LatLngLiteral[];
  onMarkerClick?: (id: string) => void;
  className?: string;
  onMapLoad?: (map: google.maps.Map) => void;
}

const DEFAULT_ZOOM = 12;
const DEFAULT_CENTER = { lat: 0, lng: 0 };

// Memoize markers array to prevent unnecessary re-renders
const MemoizedMarker = memo(({ marker, onMarkerClick }: { marker: BaseMarker; onMarkerClick?: (id: string) => void }) => (
  <Marker
    position={{ lat: marker.lat, lng: marker.lng }}
    onClick={() => {
      if (onMarkerClick) {
        onMarkerClick(marker.id);
      }
    }}
  />
));

MemoizedMarker.displayName = 'MemoizedMarker';

function GoogleMapBaseComponent({
  center,
  zoom = DEFAULT_ZOOM,
  markers = [],
  routePath,
  onMarkerClick,
  className = "",
  onMapLoad,
}: GoogleMapBaseProps) {
  const { isLoaded } = useGoogleMaps();

  const mapOptions = useMemo<google.maps.MapOptions>(
    () => DEFAULT_MAP_OPTIONS,
    []
  );

  // Memoize markers to prevent re-creation on every render
  const memoizedMarkers = useMemo(() => markers, [markers]);

  // Memoize route path
  const memoizedRoutePath = useMemo(() => routePath, [routePath]);

  if (!isLoaded) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${className}`}>
        <div className="text-sm text-muted-foreground">Loading map...</div>
      </div>
    );
  }

  const mapCenter = center || DEFAULT_CENTER;

  return (
    <div className={`w-full h-full ${className}`} style={{ pointerEvents: 'auto' }}>
      <GoogleMap
        mapContainerStyle={DEFAULT_MAP_CONTAINER_STYLE}
        center={mapCenter}
        zoom={zoom}
        options={mapOptions}
        onLoad={(map) => {
          if (onMapLoad) {
            onMapLoad(map);
          }
        }}
      >
        {memoizedMarkers.map((marker) => (
          <MemoizedMarker
            key={marker.id}
            marker={marker}
            onMarkerClick={onMarkerClick}
          />
        ))}
        {memoizedRoutePath && memoizedRoutePath.length > 0 && (
          <Polyline
            path={memoizedRoutePath}
            options={DEFAULT_POLYLINE_OPTIONS}
          />
        )}
      </GoogleMap>
    </div>
  );
}

// Export memoized component
export const GoogleMapBase = memo(GoogleMapBaseComponent);

