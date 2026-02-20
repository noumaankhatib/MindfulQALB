/**
 * Server-side Supabase client for API routes (Vercel serverless).
 * Uses service role key to bypass RLS for trusted server operations.
 * Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel env.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let serverClient: SupabaseClient | null = null;

function isValidKey(v: string | undefined): boolean {
  if (typeof v !== 'string' || v.length < 20) return false;
  if (/^undefined$|^your-|^<\w+>$/i.test(v)) return false;
  return true;
}

function isValidUrl(v: string | undefined): boolean {
  return typeof v === 'string' && v.length > 10 && v.startsWith('https://');
}

export function getSupabaseServer(): SupabaseClient | null {
  const url = (process.env.SUPABASE_URL || '').trim();
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!isValidUrl(url) || !isValidKey(serviceRoleKey)) return null;
  if (!serverClient) {
    serverClient = createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return serverClient;
}

export function isSupabaseConfigured(): boolean {
  const url = (process.env.SUPABASE_URL || '').trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  return isValidUrl(url) && isValidKey(key);
}
