import { requireAuth, authErrorResponse } from './require-auth';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export interface TripAccessResult {
  profileId: string;
  clerkUserId: string;
  email: string;
  tripId: string;
  isOwner: boolean;
  isMember: boolean;
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
 * Requires authenticated user AND verifies they have access to the trip
 * (either as owner or as a trip member).
 * 
 * @param tripId - The trip UUID to check access for
 * @param supabase - Optional Supabase client (will create if not provided)
 * @returns Trip access result with user and trip information
 * @throws Error if not authenticated or no access (can be converted to 401/403)
 */
export async function requireTripAccess(
  tripId: string,
  supabase?: Awaited<ReturnType<typeof createClient>>
): Promise<TripAccessResult> {
  // First ensure user is authenticated
  const authResult = await requireAuth(supabase);
  
  const client = supabase || await createClient();
  
  // Fetch trip
  const { data: tripData, error: tripError } = await client
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .single();
  
  if (tripError || !tripData) {
    throw new Error('Trip not found');
  }
  
  const trip = tripData as {
    id: string;
    owner_id: string;
    title: string;
    start_date: string;
    end_date: string;
    [key: string]: any;
  };
  
  // Check if user is owner
  const isOwner = trip.owner_id === authResult.profileId;
  
  // Check if user is a member (if not owner)
  let isMember = false;
  if (!isOwner) {
    const { data: member } = await client
      .from('trip_members')
      .select('id')
      .eq('trip_id', tripId)
      .eq('user_id', authResult.profileId)
      .maybeSingle();
    
    isMember = !!member;
  }
  
  if (!isOwner && !isMember) {
    throw new Error('Forbidden: You do not have access to this trip');
  }
  
  return {
    profileId: authResult.profileId,
    clerkUserId: authResult.clerkUserId,
    email: authResult.email,
    tripId,
    isOwner,
    isMember: isOwner || isMember,
    trip,
  };
}

/**
 * Helper to convert trip access errors to NextResponse
 */
export function tripAccessErrorResponse(error: unknown): NextResponse {
  if (error instanceof Error) {
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
    { error: 'Failed to verify trip access' },
    { status: 500 }
  );
}
