import { NextRequest } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ProfileAuthResult } from './getProfileId';

/**
 * Authenticates a request using either Bearer token (mobile) or cookie/session (web).
 * 
 * @param request - Next.js request object
 * @param supabase - Supabase client instance (optional, will create if not provided)
 * @returns Object with profileId (UUID), clerkUserId, email, and authMethod
 * @throws Error if user is not authenticated or profile is missing
 */
export async function getProfileIdFromRequest(
  request: NextRequest,
  supabase?: SupabaseClient
): Promise<ProfileAuthResult & { authMethod: 'bearer' | 'cookie' }> {
  const authHeader = request.headers.get('authorization');
  let clerkUserId: string | null = null;
  let authMethod: 'bearer' | 'cookie' = 'cookie';
  let email = '';

  // Check for Bearer token (mobile)
  if (authHeader?.startsWith('Bearer ')) {
    authMethod = 'bearer';
    const token = authHeader.substring(7); // Remove "Bearer " prefix

    try {
      // Verify the token with Clerk
      const session = await clerkClient.verifyToken(token);
      clerkUserId = session.sub; // sub is the user ID in JWT

      console.log('[Auth] Bearer token verified', {
        userId: clerkUserId,
        authMethod: 'bearer',
      });

      if (!clerkUserId) {
        throw new Error('Invalid token: No user ID in token');
      }

      // Get user info from Clerk for Bearer token auth
      try {
        const user = await clerkClient.users.getUser(clerkUserId);
        email = user.primaryEmailAddress?.emailAddress || '';
      } catch (userError: any) {
        console.warn('[Auth] Could not fetch user email from Clerk', {
          clerkUserId,
          error: userError?.message,
        });
        // Continue without email - it will be fetched from profile if available
      }
    } catch (error: any) {
      console.error('[Auth] Bearer token verification failed', {
        error: error?.message || 'Token verification failed',
        authMethod: 'bearer',
      });
      throw new Error(`Unauthorized: Invalid or expired token. ${error?.message || ''}`);
    }
  } else {
    // Fall back to cookie/session auth (web)
    authMethod = 'cookie';
    try {
      const authResult = await auth();
      clerkUserId = authResult.userId;

      console.log('[Auth] Cookie/session auth', {
        userId: clerkUserId,
        authMethod: 'cookie',
      });

      if (!clerkUserId) {
        throw new Error('Unauthorized: No user ID found in session');
      }

      // Get email from Clerk for cookie auth
      const { currentUser } = await import('@clerk/nextjs/server');
      const user = await currentUser();
      email = user?.primaryEmailAddress?.emailAddress || '';
    } catch (error: any) {
      console.error('[Auth] Cookie/session auth failed', {
        error: error?.message || 'Session auth failed',
        authMethod: 'cookie',
      });
      throw new Error(`Unauthorized: ${error?.message || 'No valid session found'}`);
    }
  }

  if (!clerkUserId) {
    console.error('[Auth] No userId resolved', {
      authMethod,
    });
    throw new Error('Unauthorized: Could not resolve user ID');
  }

  // Create Supabase client if not provided
  const client = supabase || await createClient();

  // Fetch profile by clerk_user_id
  const { data: profile, error } = await client
    .from('profiles')
    .select('id, clerk_user_id, email')
    .eq('clerk_user_id', clerkUserId)
    .single();

  if (error) {
    // PGRST116 is "not found" - profile doesn't exist
    if (error.code === 'PGRST116') {
      console.error('[Auth] Profile not found', {
        clerkUserId,
        authMethod,
        error: 'Profile not found in database',
      });
      throw new Error(
        `Profile not found for Clerk user ID: ${clerkUserId}. Please ensure your profile exists.`
      );
    }
    console.error('[Auth] Database error fetching profile', {
      clerkUserId,
      authMethod,
      error: error.message,
    });
    throw new Error(`Failed to fetch profile: ${error.message}`);
  }

  if (!profile) {
    console.error('[Auth] Profile query returned null', {
      clerkUserId,
      authMethod,
    });
    throw new Error(
      `Profile not found for Clerk user ID: ${clerkUserId}`
    );
  }

  type ProfileQueryResult = {
    id: string;
    clerk_user_id: string | null;
    email: string;
  };

  const profileTyped = profile as ProfileQueryResult;

  console.log('[Auth] Authentication successful', {
    profileId: profileTyped.id,
    clerkUserId,
    authMethod,
    email: profileTyped.email || email,
  });

  return {
    profileId: profileTyped.id,
    clerkUserId,
    email: profileTyped.email || email,
    authMethod,
  };
}

