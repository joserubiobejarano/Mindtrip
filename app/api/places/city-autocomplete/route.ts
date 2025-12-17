import { NextRequest, NextResponse } from 'next/server';
import { GOOGLE_MAPS_API_KEY } from '@/lib/google/places-server';
import { getPlaceDetails } from '@/lib/google/places-server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const input = searchParams.get('q') || searchParams.get('input');
    const location = searchParams.get('location'); // optional: lat,lng for biasing

    if (!input || input.length < 2) {
      return NextResponse.json({ predictions: [] });
    }

    if (!GOOGLE_MAPS_API_KEY) {
      return NextResponse.json(
        { error: 'Google Maps API key not configured' },
        { status: 500 }
      );
    }

    // Build the autocomplete request URL with types=(cities) to restrict to cities only
    let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&types=(cities)&key=${GOOGLE_MAPS_API_KEY}`;
    
    if (location) {
      url += `&location=${location}&radius=50000`; // 50km radius for biasing
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Places Autocomplete error:', data.status, data.error_message);
      return NextResponse.json(
        { error: data.error_message || 'Autocomplete request failed' },
        { status: 500 }
      );
    }

    // Transform predictions to include city + country format
    const predictions = (data.predictions || []).map((pred: any) => {
      // Extract city and country from description
      // Format is usually "City, Country" or "City, State, Country"
      const parts = pred.description.split(',').map((p: string) => p.trim());
      const city = parts[0];
      const country = parts[parts.length - 1];
      
      return {
        placeId: pred.place_id,
        description: pred.description,
        city,
        country,
        structuredFormatting: pred.structured_formatting,
        types: pred.types,
      };
    });

    return NextResponse.json({ predictions });
  } catch (error) {
    console.error('Error in city autocomplete API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get place details including lat/lng for a selected city
 * This endpoint is used after a city is selected to get coordinates
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { placeId } = body;

    if (!placeId) {
      return NextResponse.json(
        { error: 'placeId is required' },
        { status: 400 }
      );
    }

    if (!GOOGLE_MAPS_API_KEY) {
      return NextResponse.json(
        { error: 'Google Maps API key not configured' },
        { status: 500 }
      );
    }

    // Get place details to extract lat/lng
    const placeDetails = await getPlaceDetails(placeId);
    
    if (!placeDetails) {
      return NextResponse.json(
        { error: 'Place not found' },
        { status: 404 }
      );
    }

    const location = placeDetails.geometry?.location;
    if (!location) {
      return NextResponse.json(
        { error: 'Location not available for this place' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      placeId,
      name: placeDetails.name,
      center: [location.lat, location.lng],
      formattedAddress: placeDetails.formatted_address,
    });
  } catch (error) {
    console.error('Error in city details API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
