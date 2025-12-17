import { getProfileId, type ProfileAuthResult } from './getProfileId';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Requires an authenticated user and returns their profile information.
 * Throws a standardized error that can be caught and returned as a 401 response.
 * 
 * @param supabase - Optional Supabase client (will create if not provided)
 * @returns Profile auth result with profileId, clerkUserId, and email
 * @throws Error with message that can be returned as 401 Unauthorized
 */
export async function requireAuth(
  supabase?: ReturnType<typeof createClient> extends Promise<infer T> ? T : never
): Promise<ProfileAuthResult> {
  try {
    const client = supabase || await createClient();
    return await getProfileId(client);
  } catch (error: any) {
    // Re-throw with standardized message
    throw new Error(error.message || 'Unauthorized');
  }
}

/**
 * Helper to convert auth errors to NextResponse
 */
export function authErrorResponse(error: unknown): NextResponse {
  const message = error instanceof Error ? error.message : 'Unauthorized';
  return NextResponse.json(
    { error: message },
    { status: 401 }
  );
}
