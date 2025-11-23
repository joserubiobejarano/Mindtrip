/**
 * Helper function to get route and travel times between activities using Mapbox Directions API
 */

export interface RouteLeg {
  fromActivityId: string;
  toActivityId: string;
  durationMinutes: number;
}

export interface DayRouteResult {
  routeLineGeoJson: GeoJSON.LineString | null;
  legs: RouteLeg[];
}

export async function getDayRoute(
  activities: {
    id: string;
    place?: { lat: number; lng: number } | null;
  }[]
): Promise<DayRouteResult> {
  // Filter to activities that have a place with valid lat and lng
  const validActivities = activities.filter(
    (activity) =>
      activity.place &&
      activity.place.lat != null &&
      activity.place.lng != null &&
      !isNaN(activity.place.lat) &&
      !isNaN(activity.place.lng)
  );

  // If fewer than 2 valid points, return empty result
  if (validActivities.length < 2) {
    return {
      routeLineGeoJson: null,
      legs: [],
    };
  }

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) {
    console.error("NEXT_PUBLIC_MAPBOX_TOKEN is not configured");
    return {
      routeLineGeoJson: null,
      legs: [],
    };
  }

  // Build coordinates string: lng1,lat1;lng2,lat2;lng3,lat3...
  const coords = validActivities
    .map((activity) => `${activity.place!.lng},${activity.place!.lat}`)
    .join(";");

  try {
    const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${coords}?geometries=geojson&overview=full&access_token=${token}`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Mapbox Directions API error:", response.status, errorText);
      return {
        routeLineGeoJson: null,
        legs: [],
      };
    }

    const data = await response.json();

    // Check if we have routes
    if (!data.routes || data.routes.length === 0) {
      console.warn("No routes returned from Mapbox Directions API");
      return {
        routeLineGeoJson: null,
        legs: [],
      };
    }

    // Take the first route
    const route = data.routes[0];

    // Extract geometry (the LineString)
    const geometry = route.geometry as GeoJSON.LineString;

    // Extract legs and map to our format
    const legs: RouteLeg[] = [];
    if (route.legs && route.legs.length > 0) {
      for (let i = 0; i < route.legs.length; i++) {
        const leg = route.legs[i];
        const fromActivityId = validActivities[i].id;
        const toActivityId = validActivities[i + 1].id;

        // Convert duration from seconds to minutes (round to nearest integer)
        const durationMinutes = Math.round((leg.duration || 0) / 60);

        legs.push({
          fromActivityId,
          toActivityId,
          durationMinutes,
        });
      }
    }

    return {
      routeLineGeoJson: geometry,
      legs,
    };
  } catch (error) {
    console.error("Error fetching route from Mapbox Directions API:", error);
    return {
      routeLineGeoJson: null,
      legs: [],
    };
  }
}

