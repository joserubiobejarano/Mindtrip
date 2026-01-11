import { NextRequest, NextResponse } from 'next/server';
import { validatePlaceId } from '@/lib/google/places-server';

/**
 * API endpoint to validate if a Google Maps place_id exists and is valid
 * POST /api/places/validate
 * Body: { place_id: string }
 * Returns: { valid: boolean }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { place_id } = body;

    if (!place_id || typeof place_id !== 'string') {
      return NextResponse.json(
        { error: 'place_id is required' },
        { status: 400 }
      );
    }

    const isValid = await validatePlaceId(place_id);

    return NextResponse.json({ valid: isValid });
  } catch (error: any) {
    console.error('[validate-place] Error validating place_id:', error);
    return NextResponse.json(
      { error: 'Failed to validate place_id', details: error.message },
      { status: 500 }
    );
  }
}
