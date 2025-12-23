import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, authErrorResponse } from '@/lib/auth/require-auth';
import { createClient } from '@/lib/supabase/server';
import { isValidExpoPushToken } from '@/lib/push/validate';

interface PushTokenBody {
  token: string;
  platform?: 'ios' | 'android';
}

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const authResult = await requireAuth();
    const supabase = await createClient();

    // Parse and validate request body
    const body: PushTokenBody = await request.json();
    const { token, platform } = body;

    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      return NextResponse.json(
        { error: 'Token is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Validate token format
    if (!isValidExpoPushToken(token.trim())) {
      return NextResponse.json(
        { error: 'Invalid push token format' },
        { status: 400 }
      );
    }

    // Validate platform if provided
    if (platform && platform !== 'ios' && platform !== 'android') {
      return NextResponse.json(
        { error: 'Platform must be "ios" or "android"' },
        { status: 400 }
      );
    }

    // Check if token already exists
    const { data: existingToken, error: lookupError } = await supabase
      .from('user_push_tokens')
      .select('id, user_id')
      .eq('token', token.trim())
      .maybeSingle();

    if (lookupError && lookupError.code !== 'PGRST116') {
      console.error('[push-token] Error looking up existing token:', lookupError);
      return NextResponse.json(
        { error: 'Failed to check existing token' },
        { status: 500 }
      );
    }

    // Upsert logic: if token exists, update user_id and last_seen_at
    // Otherwise, insert new row
    if (existingToken) {
      // Token exists - update user_id and last_seen_at (handles device switching)
      const updateData: {
        user_id: string;
        last_seen_at: string;
        platform?: 'ios' | 'android';
      } = {
        user_id: authResult.profileId,
        last_seen_at: new Date().toISOString(),
        ...(platform && { platform }),
      };
      const { error: updateError } = await (supabase
        .from('user_push_tokens') as any)
        .update(updateData)
        .eq('token', token.trim());

      if (updateError) {
        console.error('[push-token] Error updating token:', updateError);
        return NextResponse.json(
          { error: 'Failed to update push token' },
          { status: 500 }
        );
      }
    } else {
      // Token doesn't exist - insert new row
      const { error: insertError } = await (supabase
        .from('user_push_tokens') as any)
        .insert({
          user_id: authResult.profileId,
          token: token.trim(),
          platform: platform || null,
        });

      if (insertError) {
        console.error('[push-token] Error inserting token:', insertError);
        return NextResponse.json(
          { error: 'Failed to register push token' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof NextResponse) {
      return error;
    }
    console.error('[push-token] Error in POST /api/user/push-token:', error);
    return authErrorResponse(error);
  }
}

