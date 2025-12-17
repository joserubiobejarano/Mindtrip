import { requireTripOwner } from './require-trip-owner';
import { createClient } from '@/lib/supabase/server';
import { getTripProStatus } from '@/lib/supabase/pro-status';
import { NextResponse } from 'next/server';

export interface TripProUser {
  profileId: string;
  clerkUserId: string;
  email: string;
  tripId: string;
  isAccountPro: boolean;
  isTripPro: boolean;
  isProForThisTrip: boolean;
  trip: {
    id: string;
    owner_id: string;
    title: string;
    start_date: string;
    end_date: string;
    [key: string]: any;
  };
}

/**
 * Requires authenticated user, trip ownership, AND Pro status (account-level OR trip-level).
 * This is for operations that require Pro AND trip ownership (e.g., multi-city segments).
 * 
 * @param tripId - The trip UUID
 * @param supabase - Optional Supabase client (will create if not provided)
 * @returns Trip Pro user information
 * @throws Error if not authenticated, not owner, or not Pro (can be converted to 401/403)
 */
export async function requireTripPro(
  tripId: string,
  supabase?: Awaited<ReturnType<typeof createClient>>
): Promise<TripProUser> {
  // First ensure user is authenticated and owns the trip
  const ownerResult = await requireTripOwner(tripId, supabase);
  
  const client = supabase || await createClient();
  
  // Check Pro status (account Pro OR trip Pro)
  const proStatus = await getTripProStatus(
    client,
    ownerResult.clerkUserId,
    tripId
  );
  
  if (!proStatus.isProForThisTrip) {
    throw new Error('Pro subscription or trip unlock required');
  }
  
  return {
    profileId: ownerResult.profileId,
    clerkUserId: ownerResult.clerkUserId,
    email: ownerResult.email,
    tripId,
    isAccountPro: proStatus.isAccountPro,
    isTripPro: proStatus.isTripPro,
    isProForThisTrip: true,
    trip: ownerResult.trip,
  };
}

/**
 * Helper to convert trip Pro errors to NextResponse
 */
export function tripProErrorResponse(error: unknown): NextResponse {
  if (error instanceof Error) {
    if (error.message === 'Pro subscription or trip unlock required') {
      return NextResponse.json(
        {
          error: 'Pro subscription or trip unlock required',
          plan_required: 'pro_or_trip_unlock',
        },
        { status: 403 }
      );
    }
    if (error.message === 'Trip not found') {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }
    if (error.message.includes('Forbidden')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
  }
  
  return NextResponse.json(
    { error: 'Failed to verify trip Pro status' },
    { status: 500 }
  );
}
