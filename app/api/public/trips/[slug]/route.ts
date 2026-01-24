import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/admin';

/**
 * Public endpoint to get trip data by share slug
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

    // Use service role for anonymous public access to shared trips
    const supabase = createSupabaseAdmin();

    // Get trip_id from share slug
    const { data: tripShare, error: shareError } = await supabase
      .from('trip_shares')
      .select('trip_id, expires_at')
      .eq('public_slug', slug)
      .single();

    if (shareError || !tripShare) {
      return NextResponse.json({ error: 'Trip not found or not shareable' }, { status: 404 });
    }

    type TripShareQueryResult = {
      trip_id: string;
      expires_at: string | null;
    };

    const tripShareTyped = tripShare as TripShareQueryResult;

    // Check if share has expired
    if (tripShareTyped.expires_at) {
      const expiresAt = new Date(tripShareTyped.expires_at);
      const now = new Date();
      if (now > expiresAt) {
        return NextResponse.json({ error: 'Share link has expired' }, { status: 404 });
      }
    }

    const tripId = tripShareTyped.trip_id;

    // Load trip data (only safe, public fields)
    const { data: tripData, error: tripError } = await supabase
      .from('trips')
      .select('id, title, start_date, end_date, destination_name, destination_city, destination_country, default_currency')
      .eq('id', tripId)
      .single();

    if (tripError || !tripData) {
      console.error('[public-trip GET] supabase error', tripError);
      // If no row yet → 404
      if (tripError?.code === 'PGRST116' || tripError?.details?.includes('Results contain 0 rows')) {
        return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'db-error' }, { status: 500 });
    }

    // Return safe trip data
    return NextResponse.json(tripData, { status: 200 });
  } catch (err) {
    console.error('[public-trip GET] unexpected error', err);
    return NextResponse.json({ error: 'server-error' }, { status: 500 });
  }
}
