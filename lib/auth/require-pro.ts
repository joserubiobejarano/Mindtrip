import { requireAuth, authErrorResponse } from './require-auth';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export interface ProUser {
  profileId: string;
  clerkUserId: string;
  email: string;
  isPro: boolean;
}

/**
 * Requires an authenticated user with Pro subscription (account-level Pro).
 * Throws if user is not authenticated or not Pro.
 * 
 * @param supabase - Optional Supabase client (will create if not provided)
 * @returns Pro user information
 * @throws Error if not authenticated or not Pro (can be converted to 401/403)
 */
export async function requirePro(
  supabase?: Awaited<ReturnType<typeof createClient>>
): Promise<ProUser> {
  // First ensure user is authenticated
  const authResult = await requireAuth(supabase);
  
  const client = supabase || await createClient();
  
  // Check Pro status from profile
  const { data: profile, error } = await client
    .from('profiles')
    .select('is_pro')
    .eq('id', authResult.profileId)
    .single();
  
  if (error || !profile) {
    throw new Error('Failed to verify Pro status');
  }
  
  const isPro = !!profile.is_pro;
  
  if (!isPro) {
    throw new Error('Pro subscription required');
  }
  
  return {
    profileId: authResult.profileId,
    clerkUserId: authResult.clerkUserId,
    email: authResult.email,
    isPro: true,
  };
}

/**
 * Helper to convert Pro errors to NextResponse
 */
export function proErrorResponse(error: unknown): NextResponse {
  if (error instanceof Error) {
    if (error.message === 'Pro subscription required') {
      return NextResponse.json(
        { 
          error: 'Pro subscription required',
          plan_required: 'pro'
        },
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
    { error: 'Failed to verify Pro status' },
    { status: 500 }
  );
}
