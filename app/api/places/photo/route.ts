import { NextRequest, NextResponse } from 'next/server';
import { isGooglePhotoReference } from '@/lib/placePhotos';

export const runtime = 'nodejs';

// Use server-side API key only (no NEXT_PUBLIC fallback)
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const isDev = process.env.NODE_ENV === 'development';


/**
 * Returns a small 1x1 transparent PNG as a placeholder image.
 * This is returned with 200 status to prevent retry storms when photos are unavailable.
 */
function getPlaceholderImage(): Buffer {
  // 1x1 transparent PNG (67 bytes)
  const placeholderBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  return Buffer.from(placeholderBase64, 'base64');
}

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

    const maxwidth = searchParams.get('maxWidth') || searchParams.get('maxwidth') || '1200';
    const photoRef = searchParams.get('ref') || searchParams.get('photo_reference');

    if (!photoRef) {
      if (isDev) {
        console.warn('[photo-api] Missing photo_reference parameter - returning placeholder');
      }
      // Return placeholder image (200) with dev-only warning
      const placeholder = getPlaceholderImage();
      const placeholderArray = new Uint8Array(placeholder);
      return new NextResponse(placeholderArray, {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=3600',
          'Content-Length': placeholder.length.toString(),
        },
      });
    }

    // Validate photo reference - must be a valid Google Places photo_reference
    if (!isGooglePhotoReference(photoRef)) {
      if (isDev) {
        console.error('[photo-api] Invalid photo reference:', {
          ref: photoRef.substring(0, 50) + (photoRef.length > 50 ? '...' : ''),
          length: photoRef.length,
          startsWithChIJ: photoRef.startsWith('ChIJ'),
          hasSpaces: photoRef.includes(' '),
        });
      }
      return NextResponse.json(
        { error: 'Invalid photo reference' },
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

      // Log detailed error info server-side
      console.error('[photo-api] Google Places Photo API error:', {
        status: photoResponse.status,
        statusText: photoResponse.statusText,
        photoRef: photoRef.substring(0, 20) + '...',
        googleStatusCode: photoResponse.status,
        googleResponseBody: errorBodyPreview,
        hint
      });

      // Return placeholder image (200) instead of 404 to prevent retry storms
      const placeholder = getPlaceholderImage();
      const placeholderArray = new Uint8Array(placeholder);
      return new NextResponse(placeholderArray, {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=3600',
          'Content-Length': placeholder.length.toString(),
        },
      });
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
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
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
