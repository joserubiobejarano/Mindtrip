import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSmartItinerary, upsertSmartItinerary } from '@/lib/supabase/smart-itineraries'
import type { AiItinerary } from '@/app/api/ai-itinerary/route'

/**
 * GET /api/trips/[tripId]/smart-itinerary
 * Returns the cached smart itinerary for a trip, or null if not found
 */
export async function GET(
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

    // Get cached itinerary
    const { data: itinerary, error } = await getSmartItinerary(tripId)

    if (error) {
      console.error('Error fetching smart itinerary:', error)
      return NextResponse.json(
        { error: 'Failed to fetch itinerary' },
        { status: 500 }
      )
    }

    return NextResponse.json({ itinerary })
  } catch (error) {
    console.error('Error in GET /api/trips/[tripId]/smart-itinerary:', error)
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
