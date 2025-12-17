import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SmartItinerary } from '@/types/itinerary';

/**
 * Public endpoint to get smart itinerary by share slug
 * No authentication required - only works if trip has a valid share slug
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    if (!slug) {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
    }

    const supabase = await createClient();

    // Get trip_id from share slug
    const { data: tripShare, error: shareError } = await supabase
      .from('trip_shares')
      .select('trip_id')
      .eq('public_slug', slug)
      .single();

    if (shareError || !tripShare) {
      return NextResponse.json({ error: 'Trip not found or not shareable' }, { status: 404 });
    }

    type TripShareQueryResult = {
      trip_id: string;
    };

    const tripShareTyped = tripShare as TripShareQueryResult;
    const tripId = tripShareTyped.trip_id;

    // Load itinerary from database (no auth check needed - trip is shareable)
    const { data, error } = await supabase
      .from('smart_itineraries')
      .select('content')
      .eq('trip_id', tripId)
      .single();

    if (error) {
      console.error('[public-smart-itinerary GET] supabase error', error);
      // If no row yet → 404
      if (error.code === 'PGRST116' || error.details?.includes('Results contain 0 rows')) {
        return NextResponse.json({ error: 'not-found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'db-error' }, { status: 500 });
    }

    type ItineraryQueryResult = {
      content: any;
    };

    const dataTyped = data as ItineraryQueryResult | null;

    if (!dataTyped?.content) {
      return NextResponse.json({ error: 'not-found' }, { status: 404 });
    }

    // Return bare SmartItinerary directly
    return NextResponse.json(dataTyped.content, { status: 200 });
  } catch (err) {
    console.error('[public-smart-itinerary GET] unexpected error', err);
    return NextResponse.json({ error: 'server-error' }, { status: 500 });
  }
}
