/**
 * INDIA GREEN GRID — SUPABASE / POSTGRESQL CLIENT
 * 
 * Secure client initialization with graceful degradation.
 * If Supabase environment variables are not supplied, returns null and logs an advisory,
 * allowing the application to safely serve verified datasets directly from source providers.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getServerEnv } from './env';

let supabaseClient: SupabaseClient | null = null;
let clientInitialized = false;

export function getSupabaseServerClient(): SupabaseClient | null {
  if (clientInitialized) {
    return supabaseClient;
  }

  clientInitialized = true;
  const env = getServerEnv();

  if (!env.SUPABASE_URL || (!env.SUPABASE_SERVICE_ROLE_KEY && !env.SUPABASE_ANON_KEY)) {
    // Graceful degradation when running in environments without an active Supabase project
    return null;
  }

  try {
    const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
    supabaseClient = createClient(env.SUPABASE_URL, key!, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    return supabaseClient;
  } catch (err) {
    console.error('[SupabaseClient] Initialization failed:', err);
    return null;
  }
}
