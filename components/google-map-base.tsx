"use client";

import { useJsApiLoader, GoogleMap, Marker, Polyline } from "@react-google-maps/api";
import { useMemo } from "react";

export interface BaseMarker {
  id: string;
  lat: number;
  lng: number;
}

export interface GoogleMapBaseProps {
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: BaseMarker[];
  routePath?: google.maps.LatLngLiteral[];
  onMarkerClick?: (id: string) => void;
  className?: string;
  onMapLoad?: (map: google.maps.Map) => void;
}

const DEFAULT_ZOOM = 12;

export function GoogleMapBase({
  center,
  zoom = DEFAULT_ZOOM,
  markers = [],
  routePath,
  onMarkerClick,
  className = "",
  onMapLoad,
}: GoogleMapBaseProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ["places"],
  });

  const mapOptions = useMemo<google.maps.MapOptions>(
    () => ({
      disableDefaultUI: false,
      zoomControl: true,
      streetViewControl: false,
      mapTypeControl: false,
    }),
    []
  );

  if (!isLoaded) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${className}`}>
        <div className="text-sm text-muted-foreground">Loading map...</div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full ${className}`}>
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={center}
        zoom={zoom}
        options={mapOptions}
        onLoad={(map) => {
          if (onMapLoad) {
            onMapLoad(map);
          }
        }}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={{ lat: marker.lat, lng: marker.lng }}
            onClick={() => {
              if (onMarkerClick) {
                onMarkerClick(marker.id);
              }
            }}
          />
        ))}
        {routePath && routePath.length > 0 && (
          <Polyline
            path={routePath}
            options={{
              strokeColor: "#3b82f6",
              strokeWeight: 3,
              strokeOpacity: 0.8,
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
}

