import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';
import { logWarn, logErrorCritical } from './logger';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  logWarn('Supabase credentials not configured. Auth features will be disabled.');
}

if (supabaseUrl && !supabaseUrl.includes('placeholder') && typeof document !== 'undefined') {
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = supabaseUrl;
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
}
const isPlaceholder = !supabaseUrl || supabaseUrl.includes('placeholder');
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
  return Boolean(supabaseUrl && supabaseAnonKey);
};
