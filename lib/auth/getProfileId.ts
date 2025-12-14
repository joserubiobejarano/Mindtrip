import { auth, currentUser } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface ProfileAuthResult {
  profileId: string;
  clerkUserId: string;
  email: string;
}

/**
 * Gets the profile UUID from Clerk user ID.
 * Uses Clerk currentUser() to get the Clerk user ID and email,
 * then fetches the profile row by clerk_user_id.
 * 
 * @param supabase - Supabase client instance (optional, will create if not provided)
 * @returns Object with profileId (UUID), clerkUserId, and email
 * @throws Error if user is not authenticated or profile is missing
 */
export async function getProfileId(
  supabase?: SupabaseClient
): Promise<ProfileAuthResult> {
  // Get Clerk user ID
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized: No user ID found');
  }

  // Get email from Clerk
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress || '';

  // Create Supabase client if not provided
  const client = supabase || await createClient();

  // Fetch profile by clerk_user_id
  const { data: profile, error } = await client
    .from('profiles')
    .select('id, clerk_user_id, email')
    .eq('clerk_user_id', userId)
    .single();

  if (error) {
    // PGRST116 is "not found" - profile doesn't exist
    if (error.code === 'PGRST116') {
      throw new Error(
        `Profile not found for Clerk user ID: ${userId}. Please ensure your profile exists.`
      );
    }
    throw new Error(`Failed to fetch profile: ${error.message}`);
  }

  if (!profile) {
    throw new Error(
      `Profile not found for Clerk user ID: ${userId}`
    );
  }

  type ProfileQueryResult = {
    id: string;
    clerk_user_id: string | null;
    email: string;
  };

  const profileTyped = profile as ProfileQueryResult;

  return {
    profileId: profileTyped.id,
    clerkUserId: userId,
    email: profileTyped.email || email,
  };
}
