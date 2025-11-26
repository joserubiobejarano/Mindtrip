import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSmartItinerary } from '@/lib/supabase/smart-itineraries'
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

