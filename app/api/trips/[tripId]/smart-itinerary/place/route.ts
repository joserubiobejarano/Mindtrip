import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SmartItinerary } from '@/types/itinerary';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const resolvedParams = await params;
    const tripId = resolvedParams.tripId;
    const body = await request.json();
    const { dayId, placeId, visited, remove } = body;

    if (!tripId || !dayId || !placeId) {
      return NextResponse.json({ error: 'Missing identifiers' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // 1. Fetch current itinerary
    const { data: row, error: fetchError } = await supabase
      .from('smart_itineraries')
      .select('content')
      .eq('trip_id', tripId)
      .single();

    if (fetchError || !row) {
      return NextResponse.json({ error: 'Itinerary not found' }, { status: 404 });
    }

    const itinerary = row.content as unknown as SmartItinerary;
    let updated = false;

    // 2. Find and update place
    const day = itinerary.days.find(d => d.id === dayId);
    if (day) {
      if (remove) {
        const initialLen = day.places.length;
        day.places = day.places.filter(p => p.id !== placeId);
        if (day.places.length !== initialLen) updated = true;
      } else if (visited !== undefined) {
        const place = day.places.find(p => p.id === placeId);
        if (place) {
          place.visited = visited;
          updated = true;
        }
      }
    }

    if (!updated) {
      return NextResponse.json({ message: 'No changes made' });
    }

    // 3. Save back
    const { error: saveError } = await supabase
      .from('smart_itineraries')
      .update({
        content: itinerary as any,
        updated_at: new Date().toISOString()
      })
      .eq('trip_id', tripId);

    if (saveError) {
      throw saveError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[smart-itinerary-place] PATCH error', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

