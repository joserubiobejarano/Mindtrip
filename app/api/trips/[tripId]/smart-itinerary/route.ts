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
 * This route is idempotent - it will never re-generate an itinerary if one already exists.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params

    // 1. Extract tripId from route params. If missing or not valid UUID, return 400.
    if (!tripId) {
      console.error('[smart-itinerary] missing tripId')
      return NextResponse.json(
        { error: 'Invalid trip id' },
        { status: 400 }
      )
    }

    if (!isValidUUID(tripId)) {
      console.error('[smart-itinerary] invalid tripId format', { tripId })
      return NextResponse.json(
        { error: 'Invalid trip id' },
        { status: 400 }
      )
    }

    // 2. Create Supabase server client
    const supabase = await createClient()

    // 3. First try to read the itinerary
    const { data, error } = await supabase
      .from('smart_itineraries')
      .select('content')
      .eq('trip_id', tripId)
      .maybeSingle()

    // 4. If error is not null (and it's not the usual "no rows found"), log and return 500
    if (error) {
      console.error('[smart-itinerary] select failed', { tripId, error })
      return NextResponse.json(
        { error: 'Failed to load smart itinerary' },
        { status: 500 }
      )
    }

    // 5. If data exists, return it immediately (prevents re-generation on reload/re-login)
    if (data) {
      return NextResponse.json({ itinerary: data.content })
    }

    // 6. If no existing row is found, generate a new one
    // Load trip details from trips table
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('id, title, start_date, end_date, destination_name, destination_country, center_lat, center_lng')
      .eq('id', tripId)
      .single()

    if (tripError || !trip) {
      console.error('[smart-itinerary] trip not found', { tripId, tripError })
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      )
    }

    // Generate itinerary using the helper function
    // The helper will call OpenAI and insert the result into smart_itineraries
    let itinerary: AiItinerary
    try {
      const result = await getOrCreateSmartItinerary(tripId)
      itinerary = result.itinerary
    } catch (genError) {
      console.error('[smart-itinerary] generation failed', { tripId, genError })
      return NextResponse.json(
        { error: 'Failed to load smart itinerary' },
        { status: 500 }
      )
    }

    // Verify the itinerary was inserted (the helper should have done this)
    const { data: inserted, error: insertError } = await supabase
      .from('smart_itineraries')
      .select('content')
      .eq('trip_id', tripId)
      .maybeSingle()

    if (insertError) {
      console.error('[smart-itinerary] insert failed', { tripId, insertError })
      return NextResponse.json(
        { error: 'Failed to load smart itinerary' },
        { status: 500 }
      )
    }

    // Return the generated itinerary
    return NextResponse.json({ itinerary: inserted?.content || itinerary })
  } catch (err) {
    console.error('[smart-itinerary] unhandled error', err)
    return NextResponse.json(
      { error: 'Failed to load smart itinerary' },
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
  let tripId: string | undefined
  try {
    const resolvedParams = await params
    tripId = resolvedParams.tripId

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
    console.error('[smart-itinerary] POST failed', { tripId, error })
    return NextResponse.json(
      { error: 'Failed to load smart itinerary' },
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
  let tripId: string | undefined
  try {
    const resolvedParams = await params
    tripId = resolvedParams.tripId
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
    console.error('[smart-itinerary] PATCH failed', { tripId, error })
    return NextResponse.json(
      { error: 'Failed to load smart itinerary' },
      { status: 500 }
    )
  }
}
