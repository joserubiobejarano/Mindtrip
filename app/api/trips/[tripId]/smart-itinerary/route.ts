import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateSmartItineraryWithOpenAI } from '@/lib/supabase/smart-itineraries'
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
 * Returns the smart itinerary for a trip, or generates one if not found.
 * This route is fully idempotent - it will never re-generate an itinerary if one already exists.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params

    // 1) Validate tripId is a valid UUID; if not, return 400
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

    // 2) Create Supabase server client
    const supabase = await createClient()

    // 3) First try to LOAD an existing itinerary
    const { data: existing, error: existingError } = await supabase
      .from('smart_itineraries')
      .select('id, trip_id, content, created_at')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    // 4) If existingError is not null, log it and return 500
    if (existingError) {
      console.error('[smart-itinerary] select error', existingError)
      return NextResponse.json(
        { error: 'Could not load itinerary' },
        { status: 500 }
      )
    }

    // 5) If existing exists, return it directly
    if (existing) {
      return NextResponse.json(existing)
    }

    // 6) If there is no existing row: Load the trip from trips table
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

    // 7) Call the existing helper that generates the AI itinerary
    // The helper returns a plain JS object (AiItinerary), not a JSON string
    let itineraryObject: AiItinerary
    try {
      const raw = await generateSmartItineraryWithOpenAI(tripId, supabase)
      // Ensure it's an object (it should already be, but just in case)
      itineraryObject = typeof raw === 'string' ? JSON.parse(raw) : raw
    } catch (genError) {
      console.error('[smart-itinerary] generation failed', { tripId, genError })
      return NextResponse.json(
        { error: 'Failed to load smart itinerary' },
        { status: 500 }
      )
    }

    // 8) Insert ONE row into smart_itineraries
    // CRITICAL: Pass itineraryObject as a JS object, NOT a JSON string
    // PostgREST will automatically cast it to jsonb
    const { data: insertData, error: insertError } = await supabase
      .from('smart_itineraries')
      .insert({
        trip_id: tripId,
        content: itineraryObject, // Pass as object, not stringified
      })
      .select('id, trip_id, content, created_at')
      .single()

    // 9) If insertError is not null, log it and return 500
    if (insertError) {
      console.error('[smart-itinerary] insert error', insertError)
      return NextResponse.json(
        { error: 'Failed to load smart itinerary' },
        { status: 500 }
      )
    }

    // 10) Return the inserted row as JSON
    return NextResponse.json(insertData)
  } catch (error) {
    // Wrap the whole handler in try/catch
    console.error('[smart-itinerary] unexpected error', error)
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
    const itineraryObject = await generateSmartItineraryWithOpenAI(tripId, supabase)

    // Delete existing and insert new
    await supabase
      .from('smart_itineraries')
      .delete()
      .eq('trip_id', tripId)

    const { data: insertData, error: insertError } = await supabase
      .from('smart_itineraries')
      .insert({
        trip_id: tripId,
        content: itineraryObject,
      })
      .select('id, trip_id, content, created_at')
      .single()

    if (insertError) {
      console.error('[smart-itinerary] POST insert error', insertError)
      return NextResponse.json(
        { error: 'Failed to regenerate itinerary' },
        { status: 500 }
      )
    }

    return NextResponse.json(insertData)
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

    // Update the itinerary - pass as object, not string
    const { data: updateData, error: updateError } = await supabase
      .from('smart_itineraries')
      .upsert(
        {
          trip_id: tripId,
          content: itinerary as AiItinerary, // Pass as object
        },
        {
          onConflict: 'trip_id',
        }
      )
      .select('id, trip_id, content, created_at')
      .single()

    if (updateError) {
      console.error('[smart-itinerary] PATCH update error', updateError)
      return NextResponse.json(
        { error: 'Failed to update itinerary' },
        { status: 500 }
      )
    }

    return NextResponse.json(updateData)
  } catch (error) {
    console.error('[smart-itinerary] PATCH failed', { tripId, error })
    return NextResponse.json(
      { error: 'Failed to update smart itinerary' },
      { status: 500 }
    )
  }
}
