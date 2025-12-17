import { requireAuth, authErrorResponse } from './require-auth';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export interface TripOwnerResult {
  profileId: string;
  clerkUserId: string;
  email: string;
  tripId: string;
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
 * Requires authenticated user AND verifies they are the owner of the trip.
 * More restrictive than requireTripAccess - only owners can perform certain operations.
 * 
 * @param tripId - The trip UUID to check ownership for
 * @param supabase - Optional Supabase client (will create if not provided)
 * @returns Trip owner result with user and trip information
 * @throws Error if not authenticated or not owner (can be converted to 401/403)
 */
export async function requireTripOwner(
  tripId: string,
  supabase?: Awaited<ReturnType<typeof createClient>>
): Promise<TripOwnerResult> {
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
  
  // Verify ownership
  if (trip.owner_id !== authResult.profileId) {
    throw new Error('Forbidden: You must be the trip owner to perform this action');
  }
  
  return {
    profileId: authResult.profileId,
    clerkUserId: authResult.clerkUserId,
    email: authResult.email,
    tripId,
    trip,
  };
}

/**
 * Helper to convert trip owner errors to NextResponse
 */
export function tripOwnerErrorResponse(error: unknown): NextResponse {
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
    { error: 'Failed to verify trip ownership' },
    { status: 500 }
  );
}
