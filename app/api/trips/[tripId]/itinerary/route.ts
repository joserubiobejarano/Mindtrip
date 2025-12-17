import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProfileId } from '@/lib/auth/getProfileId';

export const dynamic = "force-dynamic";

// Legacy compatibility route - forwards to smart-itinerary logic
// This handles GET /api/trips/:tripId/itinerary?mode=load
export async function GET(req: NextRequest, { params }: { params: Promise<{ tripId: string }> }) {
  console.log('[legacy-itinerary-hit]');
  let profileId: string | undefined;
  let tripId: string | undefined;
  let mode: string | undefined;

  try {
    tripId = (await params).tripId;
    const url = new URL(req.url);
    mode = url.searchParams.get('mode') ?? 'load';
    
    console.log('[legacy-itinerary]', { tripId, mode });
    
    // Only handle mode=load
    if (mode !== 'load') {
      console.error('[legacy-itinerary] unsupported mode', { tripId, mode });
      return NextResponse.json({ error: 'unsupported-mode' }, { status: 400 });
    }

    const supabase = await createClient();

    // Get profile ID for authorization
    try {
      const authResult = await getProfileId(supabase);
      profileId = authResult.profileId;
    } catch (authError: any) {
      console.error('[legacy-itinerary]', {
        tripId,
        mode,
        error: authError?.message || 'Failed to get profile',
      });
      return NextResponse.json(
        { error: authError?.message || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user has access to trip
    const { data: tripData, error: tripError } = await supabase
      .from("trips")
      .select("id, owner_id")
      .eq("id", tripId)
      .single();

    if (tripError || !tripData) {
      console.error('[legacy-itinerary]', {
        tripId,
        mode,
        profileId,
        error: tripError?.message || 'Trip not found',
        errorCode: tripError?.code,
        context: 'trip_lookup',
      });
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    type TripQueryResult = {
      id: string
      owner_id: string
    }

    const trip = tripData as TripQueryResult;

    // Check if user is owner or member
    const { data: member } = await supabase
      .from("trip_members")
      .select("id")
      .eq("trip_id", tripId)
      .eq("user_id", profileId)
      .single();

    if (trip.owner_id !== profileId && !member) {
      console.error('[legacy-itinerary]', {
        tripId,
        mode,
        profileId,
        error: 'Forbidden: User does not have access to this trip',
        check_failed: trip.owner_id !== profileId ? 'not_owner' : 'not_member',
        trip_owner_id: trip.owner_id,
        is_member: !!member,
        context: 'authorization_check',
      });
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Load itinerary from database
    const { data, error } = await supabase
      .from('smart_itineraries')
      .select('content')
      .eq('trip_id', tripId)
      .single();

    if (error) {
      console.error('[legacy-itinerary] supabase error', { tripId, mode, error });
      // If no row yet → 404, frontend will decide to generate
      if (error.code === 'PGRST116' || error.details?.includes('Results contain 0 rows')) {
        return NextResponse.json({ error: 'not-found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'db-error' }, { status: 500 });
    }

    type ItineraryQueryResult = {
      content: any
    }

    const dataTyped = data as ItineraryQueryResult | null;

    if (!dataTyped?.content) {
      return NextResponse.json({ error: 'not-found' }, { status: 404 });
    }

    console.log('[legacy-itinerary] loaded from DB', { tripId, mode });

    // Return obvious JSON structure to verify endpoint is working
    return NextResponse.json(
      { ok: true, route: "legacy-itinerary", tripId, mode },
      { status: 200 }
    );
  } catch (err) {
    console.error('[legacy-itinerary] unexpected error', { tripId, mode, error: err });
    return NextResponse.json({ error: 'server-error' }, { status: 500 });
  }
}
