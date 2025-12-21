import { NextRequest, NextResponse } from 'next/server';
import { cachePlaceImageWithDetails, type CachePlaceImageParams } from '@/lib/images/cache-place-image';
import { getProfileId } from '@/lib/auth/getProfileId';
import { createClient } from '@/lib/supabase/server';

const isDev = process.env.NODE_ENV === 'development';

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

    // Cache the image with detailed result
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

    const result = await cachePlaceImageWithDetails(params);

    // Log full details server-side (both dev and prod)
    console.log('[cache-place-image API] Result:', {
      providerUsed: result.providerUsed,
      uploadOk: result.uploadOk,
      hasPublicUrl: !!result.publicUrl,
      error: result.error,
      title: title.substring(0, 50),
    });

    // Return different response format for dev vs prod
    if (isDev) {
      // Dev: return full details
      return NextResponse.json({
        providerUsed: result.providerUsed,
        uploadOk: result.uploadOk,
        publicUrl: result.publicUrl,
        error: result.error,
        image_url: result.publicUrl, // Also include for backward compatibility
      });
    } else {
      // Prod: return minimal response
      return NextResponse.json({
        publicUrl: result.publicUrl,
        providerUsed: result.providerUsed,
        image_url: result.publicUrl, // Also include for backward compatibility
      });
    }
  } catch (error: any) {
    console.error('[cache-place-image API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
