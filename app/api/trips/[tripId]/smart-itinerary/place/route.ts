import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProfileId } from '@/lib/auth/getProfileId';
import { SmartItinerary } from '@/types/itinerary';
import { isPastDay } from '@/lib/utils/date-helpers';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  let profileId: string | undefined;
  let tripId: string | undefined;
  
  try {
    const resolvedParams = await params;
    tripId = resolvedParams.tripId;
    const body = await request.json();
    const { dayId, placeId, visited, remove } = body;

    if (!tripId || !dayId || !placeId) {
      return NextResponse.json({ error: 'Missing identifiers' }, { status: 400 });
    }

    const supabase = await createClient();

    // Get profile ID for authorization
    try {
      const authResult = await getProfileId(supabase);
      profileId = authResult.profileId;
    } catch (authError: any) {
      console.error('[Smart Itinerary Place API]', {
        path: '/api/trips/[tripId]/smart-itinerary/place',
        method: 'PATCH',
        error: authError?.message || 'Failed to get profile',
        tripId,
      });
      return NextResponse.json(
        { error: authError?.message || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify trip exists and user has access (owner or member)
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('id, owner_id')
      .eq('id', tripId)
      .single();

    if (tripError || !trip) {
      console.error('[Smart Itinerary Place API]', {
        path: '/api/trips/[tripId]/smart-itinerary/place',
        method: 'PATCH',
        tripId,
        profileId,
        error: tripError?.message || 'Trip not found',
        errorCode: tripError?.code,
        context: 'trip_lookup',
      });
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    type TripQueryResult = {
      id: string;
      owner_id: string;
    };

    const tripTyped = trip as TripQueryResult;

    // Check if user is owner or member
    const { data: member } = await supabase
      .from('trip_members')
      .select('id')
      .eq('trip_id', tripId)
      .eq('user_id', profileId)
      .single();

    if (tripTyped.owner_id !== profileId && !member) {
      console.error('[Smart Itinerary Place API]', {
        path: '/api/trips/[tripId]/smart-itinerary/place',
        method: 'PATCH',
        tripId,
        profileId,
        error: 'Forbidden: User does not have access to this trip',
        context: 'authorization_check',
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // 1. Fetch current itinerary
    const { data: row, error: fetchError } = await supabase
      .from('smart_itineraries')
      .select('content')
      .eq('trip_id', tripId)
      .single();

    if (fetchError || !row) {
      console.error('[Smart Itinerary Place API]', {
        path: '/api/trips/[tripId]/smart-itinerary/place',
        method: 'PATCH',
        tripId,
        profileId,
        error: fetchError?.message || 'Itinerary not found',
        errorCode: fetchError?.code,
        context: 'fetch_itinerary',
      });
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
      console.error('[Smart Itinerary Place API]', {
        path: '/api/trips/[tripId]/smart-itinerary/place',
        method: 'PATCH',
        tripId,
        profileId,
        error: saveError.message || 'Failed to save itinerary',
        errorCode: saveError.code,
        context: 'save_itinerary',
      });
      throw saveError;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Smart Itinerary Place API]', {
      path: '/api/trips/[tripId]/smart-itinerary/place',
      method: 'PATCH',
      tripId: tripId || 'unknown',
      profileId: profileId || 'unknown',
      error: error?.message || 'Internal server error',
      errorCode: error?.code,
    });
    return NextResponse.json(
      { error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
