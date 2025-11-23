
/**
 * Calculates a bounding box around a center point with a given radius in kilometers.
 * Returns [minLng, minLat, maxLng, maxLat] compatible with Mapbox API.
 */
export function calculateBBox(lat: number, lng: number, radiusKm: number = 50): [number, number, number, number] {
  const earthRadius = 6371; // km

  const latDelta = (radiusKm / earthRadius) * (180 / Math.PI);
  const lngDelta =
    (radiusKm / earthRadius) * (180 / Math.PI) / Math.cos((lat * Math.PI) / 180);

  return [
    lng - lngDelta, // minLng
    lat - latDelta, // minLat
    lng + lngDelta, // maxLng
    lat + latDelta, // maxLat
  ];
}

