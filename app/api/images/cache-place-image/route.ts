import { NextRequest, NextResponse } from 'next/server';
import { cachePlaceImage, type CachePlaceImageParams } from '@/lib/images/cache-place-image';
import { getProfileId } from '@/lib/auth/getProfileId';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verify user is authenticated
    const { profileId } = await getProfileId(supabase);
    if (!profileId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tripId, placeId, title, city, country, photoRef, lat, lng } = body;

    // Validate required fields
    if (!tripId || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: tripId and title are required' },
        { status: 400 }
      );
    }

    // Verify user has access to the trip
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('id, owner_id')
      .eq('id', tripId)
      .single();

    if (tripError || !trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Check if user is owner or member
    const { data: member } = await supabase
      .from('trip_members')
      .select('id')
      .eq('trip_id', tripId)
      .eq('user_id', profileId)
      .maybeSingle();

    const tripData = trip as { id: string; owner_id: string };
    if (tripData.owner_id !== profileId && !member) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Cache the image
    const params: CachePlaceImageParams = {
      tripId,
      placeId,
      title,
      city,
      country,
      photoRef,
      lat,
      lng,
    };

    const imageUrl = await cachePlaceImage(params);

    return NextResponse.json({ image_url: imageUrl });
  } catch (error: any) {
    console.error('[cache-place-image API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
