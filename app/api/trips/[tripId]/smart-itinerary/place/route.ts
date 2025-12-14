import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SmartItinerary } from '@/types/itinerary';
import { isPastDay } from '@/lib/utils/date-helpers';

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

    type ItineraryRowResult = {
      content: any
    }

    const rowTyped = row as ItineraryRowResult;
    const itinerary = rowTyped.content as unknown as SmartItinerary;
    let updated = false;

    // 2. Find and update place in slots
    const day = itinerary.days.find(d => d.id === dayId);
    if (!day) {
      return NextResponse.json({ error: 'Day not found' }, { status: 404 });
    }

    // Check past-day lock: Only block remove operations, allow marking visited
    if (remove && isPastDay(day.date)) {
      return NextResponse.json(
        {
          error: 'past_day_locked',
          message: 'You cannot modify days that are already in the past.',
        },
        { status: 400 }
      );
    }

    if (day.slots) {
      for (const slot of day.slots) {
        if (remove) {
           const initialLen = slot.places.length;
           slot.places = slot.places.filter(p => p.id !== placeId);
           if (slot.places.length !== initialLen) {
             updated = true;
             break; 
           }
        } else if (visited !== undefined) {
          const place = slot.places.find(p => p.id === placeId);
          if (place) {
            place.visited = visited;
            updated = true;
            break;
          }
        }
      }
    }

    if (!updated) {
      return NextResponse.json({ message: 'No changes made' });
    }

    // 3. Save back
    const { error: saveError } = await (supabase
      .from('smart_itineraries') as any)
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
