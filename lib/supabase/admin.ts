import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

/**
 * Creates a Supabase admin client using the service role key.
 * This client bypasses RLS and has full access to storage operations.
 * 
 * IMPORTANT: This must only be used on the server. Never expose the service role key to the client.
 * 
 * @returns Supabase client with service role permissions
 * @throws Error if required environment variables are missing
 */
export function createSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is required but not set');
  }

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required but not set. Image uploads will fail without it.');
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

