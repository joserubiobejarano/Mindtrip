import { createClient } from '@/lib/supabase/server';
import { GOOGLE_MAPS_API_KEY } from './places-server';

export type ExploreFilters = {
  neighborhood?: string;
  category?: string;
  timeOfDay?: 'morning' | 'afternoon' | 'evening';
  excludePlaceIds?: string[]; // For excluding swiped/planned places
  includeItineraryPlaces?: boolean; // If true, include places already in itinerary (default: false)
  // Pro tier filters
  budget?: number; // 0-4 (price_level from Google Places)
  maxDistance?: number; // Maximum distance in meters from center
};

export interface ExplorePlace {
  place_id: string; // Google place_id
  name: string;
  photo_url: string | null;
  category: string; // museum, viewpoint, café, etc.
  neighborhood: string;
  district: string | null;
  rating: number;
  user_ratings_total: number;
  tags: string[]; // "Locals love this", "Trending now", etc.
  price_level?: number; // 0-4
  types: string[]; // Google Places types
  address: string;
  lat: number;
  lng: number;
}

/**
 * Get a human-readable category from Google Places types
 */
function getPlaceCategory(types: string[]): string {
  if (!types || types.length === 0) return 'place';
  
  // Map common Google types to readable categories
  const categoryMap: Record<string, string> = {
    museum: 'Museum',
    art_gallery: 'Art Gallery',
    tourist_attraction: 'Attraction',
    park: 'Park',
    restaurant: 'Restaurant',
    cafe: 'Café',
    bar: 'Bar',
    night_club: 'Nightclub',
    shopping_mall: 'Shopping',
    store: 'Store',
    viewpoint: 'Viewpoint',
    church: 'Church',
    temple: 'Temple',
    zoo: 'Zoo',
    aquarium: 'Aquarium',
    stadium: 'Stadium',
  };

  for (const type of types) {
    if (categoryMap[type]) {
      return categoryMap[type];
    }
  }

  // Default: capitalize first type
  return types[0]?.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || 'Place';
}

/**
 * Extract neighborhood/district from address or place details
 */
function getNeighborhoodFromPlace(place: any, address: string): { neighborhood: string; district: string | null } {
  // Try to extract neighborhood from address components if available
  // For now, use a simple heuristic: extract city/district info from address
  const parts = address.split(',').map(p => p.trim());
  
  // Usually neighborhood is second-to-last part (city is last)
  const neighborhood = parts.length > 1 ? parts[parts.length - 2] : parts[0] || 'Unknown';
  const district = parts.length > 2 ? parts[parts.length - 3] : null;

  return { neighborhood, district };
}

/**
 * Enrich place with tags based on ratings, popularity, etc.
 */
function enrichPlaceWithTags(
  place: any,
  rating: number,
  userRatingsTotal: number
): string[] {
  const tags: string[] = [];

  // High rating with many reviews = "Locals love this"
  if (rating >= 4.5 && userRatingsTotal >= 100) {
    tags.push('Locals love this');
  }

  // Very high review count = "Popular"
  if (userRatingsTotal >= 1000) {
    tags.push('Popular');
  }

  // Recent popularity indicator (can be enhanced with actual trending data)
  if (userRatingsTotal >= 500 && rating >= 4.0) {
    tags.push('Trending now');
  }

  return tags;
}

/**
 * Fetch places to explore for a trip destination
 * Uses Google Places API REST endpoints (server-side)
 */
export async function getPlacesToExplore(
  tripId: string,
  filters: ExploreFilters
): Promise<{ places: ExplorePlace[]; totalCount: number }> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key is not configured');
  }

  const supabase = await createClient();

  // Read trip destination from database
  const { data: tripData, error: tripError } = await supabase
    .from('trips')
    .select('destination_name, destination_country, center_lat, center_lng, title')
    .eq('id', tripId)
    .single();

  if (tripError || !tripData) {
    throw new Error('Trip not found');
  }

  type TripQueryResult = {
    destination_name: string | null
    destination_country: string | null
    center_lat: number | null
    center_lng: number | null
    title: string
  }

  const trip = tripData as TripQueryResult;

  // Get coordinates for search
  // If center_lat/lng are missing, try to get from segments
  let centerLat = trip.center_lat;
  let centerLng = trip.center_lng;
  let destinationName = trip.destination_name || trip.title;

  if (!centerLat || !centerLng) {
    // Try to get from first segment
    const { data: segmentsData } = await supabase
      .from('trip_segments')
      .select('city_name, city_place_id')
      .eq('trip_id', tripId)
      .order('order_index', { ascending: true })
      .limit(1);

    type SegmentQueryResult = {
      city_name: string
      city_place_id: string
    }

    const segments = (segmentsData || []) as SegmentQueryResult[];

    if (segments && segments.length > 0) {
      const segment = segments[0];
      destinationName = segment.city_name || destinationName;
      // Note: We'd need to fetch coordinates from Google Places API using city_place_id
      // For now, we'll throw an error to prompt fixing the trip data
    }

    if (!centerLat || !centerLng) {
      throw new Error('Trip location is required for searching places. Please ensure your trip has a valid destination.');
    }
  }

  const location = `${centerLat},${centerLng}`;

  // Build search query based on filters
  let query: string;
  if (filters.category) {
    query = `${filters.category} in ${destinationName}`;
  } else if (filters.neighborhood) {
    query = `things to do in ${filters.neighborhood}, ${destinationName}`;
  } else {
    query = `tourist attractions in ${destinationName}`;
  }

  // Use Places API Text Search
  const searchUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
  searchUrl.searchParams.set('query', query);
  searchUrl.searchParams.set('location', location);
  searchUrl.searchParams.set('radius', '20000'); // 20km radius
  searchUrl.searchParams.set('key', GOOGLE_MAPS_API_KEY);

  const searchResponse = await fetch(searchUrl.toString());
  if (!searchResponse.ok) {
    throw new Error('Failed to fetch places from Google Places API');
  }

  const searchData = await searchResponse.json();

  if (searchData.status !== 'OK' && searchData.status !== 'ZERO_RESULTS') {
    throw new Error(`Google Places API error: ${searchData.status}`);
  }

  let places: any[] = searchData.results || [];

  // Filter out places without ratings (must have rating > 0 OR user_ratings_total > 0)
  places = places.filter(p => {
    const rating = p.rating || 0;
    const userRatingsTotal = p.user_ratings_total || 0;
    return rating > 0 || userRatingsTotal > 0;
  });

  // Filter out excluded place IDs
  if (filters.excludePlaceIds && filters.excludePlaceIds.length > 0) {
    const excludeSet = new Set(filters.excludePlaceIds);
    places = places.filter(p => !excludeSet.has(p.place_id));
  }

  // Apply Pro tier filters
  // Budget filter (price_level: 0 = free, 1 = $, 2 = $$, 3 = $$$, 4 = $$$$)
  if (filters.budget !== undefined) {
    places = places.filter(p => {
      const priceLevel = p.price_level ?? -1;
      return priceLevel <= filters.budget!;
    });
  }

  // Distance filter (maxDistance in meters)
  // Distance is calculated from trip center (center_lat, center_lng)
  // For day mode, this still uses trip center - could be enhanced to use day's area cluster center in future
  if (filters.maxDistance !== undefined && trip.center_lat && trip.center_lng) {
    const centerLat = trip.center_lat;
    const centerLng = trip.center_lng;
    const maxDistanceMeters = filters.maxDistance;

    places = places.filter(p => {
      if (!p.geometry?.location) return false;
      
      const placeLat = p.geometry.location.lat;
      const placeLng = p.geometry.location.lng;
      
      // Haversine formula to calculate distance
      const R = 6371000; // Earth radius in meters
      const dLat = (placeLat - centerLat) * Math.PI / 180;
      const dLng = (placeLng - centerLng) * Math.PI / 180;
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(centerLat * Math.PI / 180) * Math.cos(placeLat * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      
      return distance <= maxDistanceMeters;
    });
  }

  // Sort by rating and review count
  places.sort((a, b) => {
    const aRatings = a.user_ratings_total || 0;
    const bRatings = b.user_ratings_total || 0;
    if (bRatings !== aRatings) {
      return bRatings - aRatings;
    }
    const aRating = a.rating || 0;
    const bRating = b.rating || 0;
    return bRating - aRating;
  });

  // Limit to top 50 places
  places = places.slice(0, 50);

  // Shuffle results to prevent same place appearing first every time
  // Fisher-Yates shuffle algorithm
  for (let i = places.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [places[i], places[j]] = [places[j], places[i]];
  }

  // Transform to ExplorePlace format
  const explorePlaces: ExplorePlace[] = await Promise.all(
    places.map(async (place) => {
      const address = place.formatted_address || place.vicinity || '';
      const { neighborhood, district } = getNeighborhoodFromPlace(place, address);
      const category = getPlaceCategory(place.types || []);
      const rating = place.rating || 0;
      const userRatingsTotal = place.user_ratings_total || 0;
      const tags = enrichPlaceWithTags(place, rating, userRatingsTotal);

      // Get photo URL if available
      let photoUrl: string | null = null;
      if (place.photos && place.photos.length > 0) {
        const photoRef = place.photos[0].photo_reference;
        photoUrl = `/api/places/photo?ref=${encodeURIComponent(photoRef)}&maxwidth=1000`;
      }

      return {
        place_id: place.place_id,
        name: place.name,
        photo_url: photoUrl,
        category,
        neighborhood,
        district,
        rating,
        user_ratings_total: userRatingsTotal,
        tags,
        price_level: place.price_level,
        types: place.types || [],
        address,
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
      };
    })
  );

  return {
    places: explorePlaces,
    totalCount: explorePlaces.length,
  };
}

