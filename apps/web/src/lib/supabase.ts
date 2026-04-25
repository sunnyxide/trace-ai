import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { loadConfig } from './config';

let admin: SupabaseClient | null = null;
let anon: SupabaseClient | null = null;

/**
 * Server-side admin client (service role; bypasses RLS).
 * Use ONLY in server route handlers and server-side jobs.
 */
export function supabaseAdmin(): SupabaseClient {
  if (admin) return admin;
  const cfg = loadConfig();
  admin = createClient(cfg.NEXT_PUBLIC_SUPABASE_URL, cfg.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return admin;
}

/**
 * Anon client for client-side reads of public-policied rows
 * (e.g. anchored merkle_batches metadata).
 */
export function supabaseAnon(): SupabaseClient {
  if (anon) return anon;
  const cfg = loadConfig();
  anon = createClient(cfg.NEXT_PUBLIC_SUPABASE_URL, cfg.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  return anon;
}
