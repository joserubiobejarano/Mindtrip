import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrCreateSmartItinerary, upsertSmartItinerary } from '@/lib/supabase/smart-itineraries'
import type { AiItinerary } from '@/app/api/ai-itinerary/route'

/**
 * Validate if a string is a valid UUID
 */
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

/**
 * GET /api/trips/[tripId]/smart-itinerary
 * Returns the cached smart itinerary for a trip, or generates one if not found
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params

    // Validate tripId is present and looks like a UUID
    if (!tripId) {
      return NextResponse.json(
        { error: 'tripId is required' },
        { status: 400 }
      )
    }

    if (!isValidUUID(tripId)) {
      return NextResponse.json(
        { error: 'Invalid tripId format' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify user has access to this trip
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('id')
      .eq('id', tripId)
      .single()

    if (tripError || !trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      )
    }

    // FIRST: Try to load existing itinerary from smart_itineraries table
    const { data: existing, error: loadError } = await supabase
      .from('smart_itineraries')
      .select('id, content')
      .eq('trip_id', tripId)
      .maybeSingle()

    // If there was an error loading, log it and return error (do NOT call OpenAI)
    if (loadError) {
      console.error('Error loading smart itinerary', loadError)
      return NextResponse.json(
        { error: 'Failed to load smart itinerary' },
        { status: 500 }
      )
    }

    // If existing itinerary found, return it immediately (no regeneration, no OpenAI call)
    if (existing) {
      return NextResponse.json(
        { itinerary: existing.content },
        { status: 200 }
      )
    }

    // ONLY if no existing itinerary: generate a new one using the helper
    // This will call OpenAI and save the result
    try {
      const { itinerary: generatedItinerary } = await getOrCreateSmartItinerary(tripId)
      
      // The helper already saves it, so just return the generated itinerary
      return NextResponse.json(
        { itinerary: generatedItinerary },
        { status: 200 }
      )
    } catch (genError) {
      console.error('Error generating smart itinerary', genError)
      // If generation fails, try to save what we can (though generation failed)
      // But actually, if generation failed, we don't have an itinerary to save
      return NextResponse.json(
        { error: 'Failed to generate itinerary' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Unhandled error in smart itinerary route', error)
    return NextResponse.json(
      { error: 'Unexpected error loading itinerary' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/trips/[tripId]/smart-itinerary
 * Explicitly regenerates the smart itinerary (force regenerate)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params

    if (!tripId) {
      return NextResponse.json(
        { error: 'tripId is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify user has access to this trip
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('id')
      .eq('id', tripId)
      .single()

    if (tripError || !trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      )
    }

    // Force regenerate itinerary
    const { itinerary, fromCache } = await getOrCreateSmartItinerary(tripId, {
      forceRegenerate: true,
    })

    return NextResponse.json({ itinerary, fromCache })
  } catch (error) {
    console.error('Error in POST /api/trips/[tripId]/smart-itinerary:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/trips/[tripId]/smart-itinerary
 * Updates the smart itinerary content (e.g., when user marks activities as visited/removed)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params
    const body = await request.json()
    const { itinerary } = body

    if (!tripId) {
      return NextResponse.json(
        { error: 'tripId is required' },
        { status: 400 }
      )
    }

    if (!itinerary) {
      return NextResponse.json(
        { error: 'itinerary is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify user has access to this trip
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('id')
      .eq('id', tripId)
      .single()

    if (tripError || !trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      )
    }

    // Update the itinerary
    const { error: updateError } = await upsertSmartItinerary(tripId, itinerary as AiItinerary)

    if (updateError) {
      console.error('Error updating smart itinerary:', updateError)
      return NextResponse.json(
        { error: 'Failed to update itinerary' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in PATCH /api/trips/[tripId]/smart-itinerary:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
