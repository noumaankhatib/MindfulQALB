import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';
import { logWarn, logErrorCritical } from './logger';

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Optional: in production, use direct Supabase URL to bypass proxy (fixes auth when api.mindfulqalb.com has CORS/network issues).
const directUrl = (import.meta.env.VITE_SUPABASE_DIRECT_URL || '').trim().replace(/\/$/, '');
const isDirectSupabaseUrl = (u: string) => /\.supabase\.co$/.test(u.replace(/^https?:\/\//, '').split('/')[0]);
const useDirectInProd = import.meta.env.PROD && directUrl && isDirectSupabaseUrl(directUrl);

// When using custom domain (e.g. https://api.mindfulqalb.com), use it directly unless useDirectInProd.
// When using *.supabase.co, route through /sb proxy to bypass ISP blocks (e.g. India).
// Set VITE_SUPABASE_USE_DIRECT=true in .env to bypass the proxy locally.
const useDirect = import.meta.env.VITE_SUPABASE_USE_DIRECT === 'true';
const isCustomDomain = rawSupabaseUrl?.includes('api.mindfulqalb.com');
const useDirectUrl = useDirectInProd
  ? true
  : (isCustomDomain || (import.meta.env.DEV && useDirect));
const baseUrl = useDirectInProd
  ? directUrl
  : (rawSupabaseUrl && !rawSupabaseUrl.includes('placeholder') ? rawSupabaseUrl.replace(/\/$/, '') : '');
const supabaseUrl = baseUrl
  ? (useDirectUrl ? baseUrl : `${typeof window !== 'undefined' ? window.location.origin : ''}/sb`)
  : rawSupabaseUrl;

if (import.meta.env.DEV && typeof window !== 'undefined') {
  console.log('[Auth]', useDirectUrl ? (isCustomDomain ? 'Using custom domain (api.mindfulqalb.com)' : 'Using direct Supabase URL (VITE_SUPABASE_USE_DIRECT=true)') : 'Using /sb proxy. If you see ETIMEDOUT or 502, add VITE_SUPABASE_USE_DIRECT=true to .env and restart.');
}

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
  supabaseUrl || 'https://placeholder.invalid',
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
// When the stored refresh token is invalid (expired/revoked), clear session so the user can sign in again.
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const msg = String(event.reason?.message || event.reason || '');
    if (
      msg.includes('Failed to fetch') &&
      String(event.reason?.stack || '').includes('refreshAccessToken')
    ) {
      event.preventDefault();
    }
    if (/Refresh Token Not Found|Invalid Refresh Token/i.test(msg)) {
      event.preventDefault();
      supabase.auth.signOut().catch(() => {});
    }
  });
}
