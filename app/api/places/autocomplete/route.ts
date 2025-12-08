import { NextRequest, NextResponse } from 'next/server';
import { GOOGLE_MAPS_API_KEY } from '@/lib/google/places-server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const input = searchParams.get('input');
    const types = searchParams.get('types'); // e.g., '(cities)', '(regions)', 'lodging'
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

    // Build the autocomplete request URL
    let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${GOOGLE_MAPS_API_KEY}`;
    
    if (types) {
      url += `&types=${types}`;
    }
    
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

    // Transform predictions to a simpler format
    const predictions = (data.predictions || []).map((pred: any) => ({
      placeId: pred.place_id,
      description: pred.description,
      structuredFormatting: pred.structured_formatting,
      types: pred.types,
    }));

    return NextResponse.json({ predictions });
  } catch (error) {
    console.error('Error in autocomplete API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

