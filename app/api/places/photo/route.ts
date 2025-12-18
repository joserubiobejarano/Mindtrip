import { NextRequest, NextResponse } from 'next/server';

// Use server-side API key only (no NEXT_PUBLIC fallback)
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const photoRef = searchParams.get('ref') || searchParams.get('photo_reference');
    const maxwidth = searchParams.get('maxwidth') || '1000';

    if (!photoRef) {
      console.error('[photo-api] Missing photo_reference parameter');
      return NextResponse.json(
        { error: 'Missing required parameter: ref or photo_reference' },
        { status: 400 }
      );
    }

    if (!GOOGLE_MAPS_API_KEY) {
      console.error('[photo-api] Google Maps API key not configured (server key missing)');
      return NextResponse.json(
        { error: 'Google Maps API key not configured' },
        { status: 500 }
      );
    }

    // Build Google Places Photo API URL
    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxwidth}&photo_reference=${encodeURIComponent(photoRef)}&key=${GOOGLE_MAPS_API_KEY}`;

    // Fetch the photo from Google Places API
    const photoResponse = await fetch(photoUrl);

    if (!photoResponse.ok) {
      const errorText = await photoResponse.text().catch(() => 'Unknown error');
      console.error('[photo-api] Google Places Photo API error:', {
        status: photoResponse.status,
        statusText: photoResponse.statusText,
        photoRef: photoRef.substring(0, 20) + '...',
        errorText: errorText.substring(0, 200)
      });
      return NextResponse.json(
        { error: 'Failed to fetch photo from Google Places API' },
        { status: 404 }
      );
    }

    // Get the image data as a buffer
    const imageBuffer = await photoResponse.arrayBuffer();

    // Determine content type from response or default to jpeg
    const contentType = photoResponse.headers.get('content-type') || 'image/jpeg';

    // Return the image with appropriate headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
        'Content-Length': imageBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('Error in photo API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
