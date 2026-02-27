import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';
import { logWarn, logErrorCritical } from './logger';

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// In production, route Supabase traffic through our own domain to bypass
// ISP-level DNS blocks on *.supabase.co (ongoing incident in India).
// Vercel rewrites /sb/* → PROJECT.supabase.co/* server-side.
const supabaseUrl = (import.meta.env.PROD && rawSupabaseUrl && !rawSupabaseUrl.includes('placeholder'))
  ? `${window.location.origin}/sb`
  : rawSupabaseUrl;

if (!rawSupabaseUrl || !supabaseAnonKey) {
  logWarn('Supabase credentials not configured. Auth features will be disabled.');
}

const isPlaceholder = !rawSupabaseUrl || rawSupabaseUrl.includes('placeholder');
if (import.meta.env.PROD && isPlaceholder) {
  logErrorCritical('Supabase URL is missing or still a placeholder. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel Environment Variables and redeploy.');
}

/**
 * Custom lock that runs the function immediately without using Navigator Lock API.
 * Fixes NavigatorLockAcquireTimeoutError when multiple tabs or browser extensions
 * hold locks and block Supabase auth.
 */
const noOpLock = <R>(_name: string, _acquireTimeout: number, fn: () => Promise<R>): Promise<R> => {
  return fn();
};

export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      lock: noOpLock,
    },
  }
);

export const isSupabaseConfigured = (): boolean => {
  return Boolean(rawSupabaseUrl && supabaseAnonKey);
};

// Suppress unhandled promise rejections from Supabase's internal auto-refresh
// mechanism. These are transient network errors on flaky connections (mobile)
// that the library retries automatically — the console noise is harmless.
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const msg = String(event.reason?.message || event.reason || '');
    if (
      msg.includes('Failed to fetch') &&
      String(event.reason?.stack || '').includes('refreshAccessToken')
    ) {
      event.preventDefault();
    }
  });
}
