import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Auth features will be disabled.');
}
// Production build must have real Supabase URL (set VITE_SUPABASE_URL on Vercel). Otherwise Google login redirects to placeholder.supabase.co and fails.
const isPlaceholder = !supabaseUrl || supabaseUrl.includes('placeholder');
if (import.meta.env.PROD && isPlaceholder) {
  console.error('Supabase URL is missing or still a placeholder. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel Environment Variables and redeploy.');
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
  return Boolean(supabaseUrl && supabaseAnonKey);
};
