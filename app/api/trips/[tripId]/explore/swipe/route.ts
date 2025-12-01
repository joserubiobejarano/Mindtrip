import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { getUserSubscriptionStatus, getUserDailySwipeLimit } from '@/lib/supabase/user-subscription';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!tripId) {
      return NextResponse.json({ error: 'Missing trip id' }, { status: 400 });
    }

    const body = await req.json();
    const { place_id, action, previous_action, source } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Missing action' },
        { status: 400 }
      );
    }

    if (action !== 'like' && action !== 'dislike' && action !== 'undo') {
      return NextResponse.json(
        { error: 'Invalid action. Must be "like", "dislike", or "undo"' },
        { status: 400 }
      );
    }

    // For undo, require place_id and previous_action
    if (action === 'undo') {
      if (!place_id || !previous_action) {
        return NextResponse.json(
          { error: 'Missing place_id or previous_action for undo' },
          { status: 400 }
        );
      }
      if (previous_action !== 'like' && previous_action !== 'dislike') {
        return NextResponse.json(
          { error: 'Invalid previous_action. Must be "like" or "dislike"' },
          { status: 400 }
        );
      }
    } else {
      // For like/dislike, require place_id
      if (!place_id) {
        return NextResponse.json(
          { error: 'Missing place_id' },
          { status: 400 }
        );
      }
    }

    // Source defaults to 'trip' for backward compatibility
    const swipeSource = source || 'trip';

    const supabase = await createClient();

    // Get or create explore session
    let { data: session, error: sessionError } = await supabase
      .from('explore_sessions')
      .select('*')
      .eq('trip_id', tripId)
      .eq('user_id', userId)
      .maybeSingle();

    if (sessionError && sessionError.code !== 'PGRST116') {
      console.error('Error fetching explore session:', sessionError);
      return NextResponse.json(
        { error: 'Failed to fetch session' },
        { status: 500 }
      );
    }

    // Get subscription status and daily limit
    const dailyLimit = await getUserDailySwipeLimit(userId);
    const { isPro } = await getUserSubscriptionStatus(userId);

    // Daily reset logic: Reset after 24 hours from first swipe of the day
    // This is fair and doesn't require timezone lookups
    const now = new Date();
    const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
    
    let swipeCount = 0;
    let shouldReset = false;
    
    if (session) {
      const lastSwipeAt = session.last_swipe_at
        ? new Date(session.last_swipe_at)
        : null;

      // Reset if no last swipe or if it's been more than 24 hours
      if (!lastSwipeAt) {
        swipeCount = 0;
        shouldReset = true;
      } else {
        const timeSinceLastSwipe = now.getTime() - lastSwipeAt.getTime();
        
        if (timeSinceLastSwipe >= TWENTY_FOUR_HOURS_MS) {
          // More than 24 hours since last swipe - reset
          swipeCount = 0;
          shouldReset = true;
        } else {
          // Within 24 hours - keep current count
          swipeCount = session.swipe_count || 0;
        }
      }
    } else {
      // No session - start fresh
      swipeCount = 0;
      shouldReset = true;
    }

    // Check limit before mutating
    if (!isPro && swipeCount >= dailyLimit) {
      return NextResponse.json({
        success: false,
        swipeCount,
        remainingSwipes: 0,
        limitReached: true,
      });
    }

    // Handle undo action
    if (action === 'undo') {
      if (!session) {
        return NextResponse.json({
          success: false,
          error: 'No session found',
          swipeCount,
          remainingSwipes: isPro ? null : Math.max(0, dailyLimit - swipeCount),
          limitReached: false,
        });
      }

      // Verify that the place_id exists in the corresponding array
      const currentLiked = [...(session.liked_place_ids || [])];
      const currentDiscarded = [...(session.discarded_place_ids || [])];
      
      let removedPlaceId: string | null = null;
      let found = false;

      if (previous_action === 'like') {
        const index = currentLiked.indexOf(place_id);
        if (index !== -1) {
          removedPlaceId = currentLiked.splice(index, 1)[0];
          found = true;
        }
      } else if (previous_action === 'dislike') {
        const index = currentDiscarded.indexOf(place_id);
        if (index !== -1) {
          removedPlaceId = currentDiscarded.splice(index, 1)[0];
          found = true;
        }
      }

      if (!found || !removedPlaceId) {
        return NextResponse.json({
          success: false,
          error: 'Place not found in session or cannot be undone',
          swipeCount,
          remainingSwipes: isPro ? null : Math.max(0, dailyLimit - swipeCount),
          limitReached: false,
        });
      }

      // Decrement swipe count (but don't go below 0) - Option B: undo gives swipe back
      const newSwipeCount = Math.max(0, swipeCount - 1);

      // Upsert session with undone swipe
      const { data: updatedSession, error: updateError } = await supabase
        .from('explore_sessions')
        .upsert(
          {
            trip_id: tripId,
            user_id: userId,
            liked_place_ids: currentLiked,
            discarded_place_ids: currentDiscarded,
            swipe_count: newSwipeCount,
            last_swipe_at: session.last_swipe_at, // Keep original timestamp
          },
          {
            onConflict: 'trip_id,user_id',
          }
        )
        .select()
        .single();

      if (updateError) {
        console.error('Error undoing swipe:', updateError);
        return NextResponse.json(
          { error: 'Failed to undo swipe' },
          { status: 500 }
        );
      }

      const remainingSwipes = isPro
        ? null
        : Math.max(0, dailyLimit - newSwipeCount);

      return NextResponse.json({
        success: true,
        swipeCount: newSwipeCount,
        remainingSwipes,
        limitReached: false,
        undonePlaceId: removedPlaceId,
      });
    }

    // Prepare arrays for update
    const currentLiked = session?.liked_place_ids || [];
    const currentDiscarded = session?.discarded_place_ids || [];

    // Check if place is already liked/discarded
    if (currentLiked.includes(place_id) || currentDiscarded.includes(place_id)) {
      return NextResponse.json({
        success: false,
        error: 'Place already swiped',
        swipeCount,
        remainingSwipes: isPro ? null : Math.max(0, dailyLimit - swipeCount),
        limitReached: false,
      });
    }

    // Update arrays based on action
    // Note: For now, we store all swipes in the same arrays regardless of source
    // In the future, we can separate trip vs day swipes if needed
    let updatedLiked = [...currentLiked];
    let updatedDiscarded = [...currentDiscarded];

    if (action === 'like') {
      updatedLiked.push(place_id);
    } else {
      updatedDiscarded.push(place_id);
    }

    // Increment swipe count
    const newSwipeCount = swipeCount + 1;

    // Upsert session
    const { data: updatedSession, error: updateError } = await supabase
      .from('explore_sessions')
      .upsert(
        {
          trip_id: tripId,
          user_id: userId,
          liked_place_ids: updatedLiked,
          discarded_place_ids: updatedDiscarded,
          swipe_count: newSwipeCount,
          last_swipe_at: now.toISOString(),
        },
        {
          onConflict: 'trip_id,user_id',
        }
      )
      .select()
      .single();

    if (updateError) {
      console.error('Error updating explore session:', updateError);
      return NextResponse.json(
        { error: 'Failed to update session' },
        { status: 500 }
      );
    }

    // Calculate remaining swipes
    const remainingSwipes = isPro
      ? null
      : Math.max(0, dailyLimit - newSwipeCount);

    return NextResponse.json({
      success: true,
      swipeCount: newSwipeCount,
      remainingSwipes,
      limitReached: !isPro && newSwipeCount >= dailyLimit,
    });
  } catch (err) {
    console.error('POST /explore/swipe error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

