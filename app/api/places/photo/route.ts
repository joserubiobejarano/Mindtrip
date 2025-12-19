import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Use server-side API key only (no NEXT_PUBLIC fallback)
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const isDev = process.env.NODE_ENV === 'development';

function getErrorHint(errorBody: string): string | null {
  const bodyLower = errorBody.toLowerCase();
  if (bodyLower.includes('request_denied')) {
    return 'REQUEST_DENIED - Check API key restrictions or billing';
  }
  if (bodyLower.includes('api key') && (bodyLower.includes('restrict') || bodyLower.includes('invalid'))) {
    return 'API key restriction - Verify key restrictions in Google Cloud Console';
  }
  if (bodyLower.includes('api not enabled') || bodyLower.includes('service not enabled')) {
    return 'API not enabled - Enable Places API in Google Cloud Console';
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const debug = searchParams.get('debug');

    // Dev-only debug endpoint
    if (debug === '1') {
      return NextResponse.json({ hasKey: !!GOOGLE_MAPS_API_KEY });
    }

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
        { error: 'Missing GOOGLE_MAPS_API_KEY' },
        { status: 500 }
      );
    }

    // Build Google Places Photo API URL
    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxwidth}&photo_reference=${encodeURIComponent(photoRef)}&key=${GOOGLE_MAPS_API_KEY}`;

    // Fetch the photo from Google Places API
    const photoResponse = await fetch(photoUrl);

    if (!photoResponse.ok) {
      const errorText = await photoResponse.text().catch(() => 'Unknown error');
      const errorBodyPreview = errorText.substring(0, 300);
      const hint = getErrorHint(errorText);
      
      const errorInfo = {
        status: 'error',
        googleStatusCode: photoResponse.status,
        googleResponseBody: errorBodyPreview,
        ...(hint && { hint })
      };

      // Log detailed error info server-side
      console.error('[photo-api] Google Places Photo API error:', {
        status: photoResponse.status,
        statusText: photoResponse.statusText,
        photoRef: photoRef.substring(0, 20) + '...',
        googleStatusCode: photoResponse.status,
        googleResponseBody: errorBodyPreview,
        hint
      });

      // In dev mode, return detailed error JSON; otherwise return 404 with generic message
      if (isDev) {
        return NextResponse.json(errorInfo, { status: 404 });
      }
      
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
