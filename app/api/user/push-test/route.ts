import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, authErrorResponse } from '@/lib/auth/require-auth';
import { createClient } from '@/lib/supabase/server';
import { sendExpoPush } from '@/lib/push/expo';

interface PushTestBody {
  language?: 'en' | 'es';
}

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const authResult = await requireAuth();
    const supabase = await createClient();

    // Parse request body
    const body: PushTestBody = await request.json();
    const { language = 'en' } = body;

    // Get all push tokens for the current user
    const { data: pushTokens, error: tokensError } = await supabase
      .from('user_push_tokens')
      .select('token')
      .eq('user_id', authResult.profileId);

    if (tokensError) {
      console.error('[push-test] Error fetching push tokens:', tokensError);
      return NextResponse.json(
        { error: 'Failed to fetch push tokens' },
        { status: 500 }
      );
    }

    if (!pushTokens || pushTokens.length === 0) {
      return NextResponse.json(
        { error: 'No push tokens found for this user' },
        { status: 404 }
      );
    }

    // Get user's trips to find a tripId for deep link
    let tripId: string | null = null;

    try {
      // Fetch trips where user is owner
      const { data: ownedTrips } = await supabase
        .from('trips')
        .select('id')
        .eq('owner_id', authResult.profileId)
        .order('start_date', { ascending: true })
        .limit(1);

      // If no owned trips, check member trips
      if (!ownedTrips || ownedTrips.length === 0) {
        const { data: memberTrips } = await supabase
          .from('trip_members')
          .select('trip_id')
          .eq('user_id', authResult.profileId)
          .limit(1);

        if (memberTrips && memberTrips.length > 0) {
          tripId = memberTrips[0].trip_id;
        }
      } else {
        tripId = ownedTrips[0].id;
      }
    } catch (tripError) {
      console.error('[push-test] Error fetching trips:', tripError);
      // Continue without tripId - will use fallback deep link
    }

    // Build deep link
    const deepLink = tripId
      ? `kruno://link?tripId=${tripId}&screen=expenses`
      : 'kruno://link';

    // Build notification message based on language
    const title = language === 'es' ? 'Notificación de prueba' : 'Test push';
    const body = language === 'es'
      ? 'Si puedes leer esto, las notificaciones funcionan.'
      : 'If you can read this, push works.';

    // Send push notification to all user's devices
    type PushToken = { token: string };
    const tokens = (pushTokens as PushToken[]).map(pt => pt.token);
    const pushResult = await sendExpoPush(tokens, {
      title,
      body,
      data: { deepLink },
      sound: 'default',
      priority: 'default',
    });

    // Clean up invalid tokens if any were reported
    if (pushResult.invalidTokens && pushResult.invalidTokens.length > 0) {
      try {
        const { error: deleteError } = await supabase
          .from('user_push_tokens')
          .delete()
          .in('token', pushResult.invalidTokens);

        if (deleteError) {
          console.error('[push-test] Error cleaning up invalid push tokens:', deleteError);
        } else {
          console.log(`[push-test] Cleaned up ${pushResult.invalidTokens.length} invalid push token(s)`);
        }
      } catch (cleanupError: any) {
        // Log but don't fail - cleanup errors shouldn't break the test
        console.error('[push-test] Error during token cleanup:', cleanupError);
      }
    }

    if (!pushResult.success) {
      console.error('[push-test] Error sending push notification:', pushResult.errors);
      return NextResponse.json(
        { error: 'Failed to send push notification', errors: pushResult.errors },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof NextResponse) {
      return error;
    }
    console.error('[push-test] Error in POST /api/user/push-test:', error);
    return authErrorResponse(error);
  }
}

