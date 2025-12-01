/**
 * Stable configuration constants for Google Maps API
 * These must be module-level constants to prevent unnecessary re-renders
 * and avoid "LoadScript has been reloaded unintentionally" warnings.
 */

import type { Library } from '@googlemaps/js-api-loader';

export const GOOGLE_MAPS_LIBRARIES: Library[] = ['places'];

export const DEFAULT_MAP_CONTAINER_STYLE: React.CSSProperties = {
  width: '100%',
  height: '100%',
};

export const DEFAULT_MAP_OPTIONS: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  clickableIcons: false,
  gestureHandling: 'greedy',
};

export const DEFAULT_POLYLINE_OPTIONS: google.maps.PolylineOptions = {
  strokeColor: '#3b82f6',
  strokeWeight: 3,
  strokeOpacity: 0.8,
};

