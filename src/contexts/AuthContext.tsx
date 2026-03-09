import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { logError } from '../lib/logger';
import type { Profile } from '../types/database';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signInWithGoogleIdToken: (idToken: string) => Promise<{ error: AuthError | null }>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>;
  signInWithMagicLink: (email: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  refetchProfile: () => void;
}

const NETWORK_ERROR_MESSAGE = 'Network issue detected. Please check your internet connection.';

function isNetworkError(msg: string): boolean {
  return /failed to fetch|networkerror|network request failed/i.test(msg);
}

function isRetryableOrServerError(msg: string): boolean {
  return /unexpected end of json|failed to fetch|network|timeout|failed to execute|500|502|internal server error|bad gateway/i.test(msg);
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const isConfigured = isSupabaseConfigured();
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    const initSession = async (attempt = 0) => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mountedRef.current) return;
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        if (!mountedRef.current) return;
        if (attempt < 2) {
          setTimeout(() => initSession(attempt + 1), 1000 * (attempt + 1));
        } else {
          logError('Failed to get session after retries:', err);
          setLoading(false);
        }
      }
    };
    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (!mountedRef.current) return;
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            // Brief delay when returning from OAuth redirect so session is ready for profile fetch.
            if (event === 'INITIAL_SESSION' && typeof window !== 'undefined' && window.location.hash) {
              await new Promise(r => setTimeout(r, 600));
            }
            if (mountedRef.current && session?.user) await fetchProfile(session.user.id);
          } else {
            setProfile(null);
          }
        } catch (err) {
          logError('Auth state change error:', err);
        } finally {
          if (mountedRef.current) setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [isConfigured]);

  // Refetch profile when we have user but profile is null (e.g. after slow OAuth redirect or flaky first fetch).
  useEffect(() => {
    if (!user || profile !== null || !isConfigured) return;
    const t = setTimeout(
      () => {
        if (mountedRef.current && user) fetchProfile(user.id, 5);
      },
      2500,
    );
    return () => clearTimeout(t);
  }, [user?.id, profile, isConfigured]);

  const refetchProfile = () => {
    if (user) fetchProfile(user.id, 5);
  };

  const fetchProfile = async (userId: string, retries = 3) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;

    // Try backend API first (same-origin, bypasses RLS — more reliable than Supabase client on some deploys).
    if (accessToken && typeof window !== 'undefined') {
      try {
        const base = (typeof import.meta.env.VITE_BACKEND_URL === 'string' && import.meta.env.VITE_BACKEND_URL) || '/api';
        const res = await fetch(`${base.replace(/\/$/, '')}/health?action=profile`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.ok) {
          const data = (await res.json()) as Profile;
          if (mountedRef.current) {
            setProfile(data);
            setLoading(false);
          }
          return;
        }
      } catch (err) {
        logError('Profile API fetch failed:', err);
      }
    }

    // Fallback: Supabase client fetch.
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, full_name, phone, avatar_url, role, created_at, updated_at')
          .eq('id', userId)
          .single();

        if (!mountedRef.current) return;
        if (!error) {
          setProfile(data);
          if (mountedRef.current) setLoading(false);
          return;
        }
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempt)));
          continue;
        }
        logError('Error fetching profile after retries:', error);
        break;
      } catch (err) {
        if (!mountedRef.current) return;
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempt)));
          continue;
        }
        logError('Error fetching profile:', err);
        break;
      }
    }
    if (mountedRef.current) setLoading(false);
  };

  const signInWithGoogle = async (): Promise<{ error: AuthError | null }> => {
    const redirectTo = `${window.location.origin}/`;
    const doSignIn = async (): Promise<{ error: AuthError | null; isNetwork?: boolean }> => {
      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo,
            skipBrowserRedirect: true,
          },
        });

        if (error) return { error };

        if (data?.url) {
          let oauthUrl = data.url;
          // Route OAuth through our proxy so Jio/ISP-blocked regions can complete Google sign-in.
          // Supabase returns https://xxx.supabase.co/... - replace with api.mindfulqalb.com or origin/sb.
          const proxyUrl = import.meta.env.VITE_SUPABASE_URL?.includes('api.mindfulqalb.com')
            ? 'https://api.mindfulqalb.com'
            : `${window.location.origin}/sb`;
          oauthUrl = oauthUrl.replace(/https:\/\/[^.]+\.supabase\.co/, proxyUrl);
          window.location.href = oauthUrl;
        }
        return { error: null };
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Request failed';
        const isNetwork = isNetworkError(msg);
        return {
          error: { message: isNetwork ? NETWORK_ERROR_MESSAGE : msg, name: 'AuthApiError', status: 0 } as AuthError,
          isNetwork,
        };
      }
    };

    let result = await doSignIn();
    if (result.error && result.isNetwork) {
      await new Promise(r => setTimeout(r, 2000));
      result = await doSignIn();
    }
    return { error: result.error };
  };

  /** Sign in with Google via ID token (bypasses supabase.co redirect — works on Jio/blocked networks). */
  const signInWithGoogleIdToken = async (idToken: string): Promise<{ error: AuthError | null }> => {
    return withRetry(() =>
      supabase.auth.signInWithIdToken({ provider: 'google', token: idToken }),
    );
  };

  const withRetry = async (
    fn: () => Promise<{ error: AuthError | null }>,
    retries = 1,
  ): Promise<{ error: AuthError | null }> => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const { error } = await fn();
        if (error && attempt < retries && isRetryableOrServerError(error.message)) {
          const delayMs = isNetworkError(error.message) ? 2000 : 800 * (attempt + 1);
          await new Promise(r => setTimeout(r, delayMs));
          continue;
        }
        if (error && isNetworkError(error.message)) {
          logError('[Auth] Network error (user sees friendly message):', error.message);
          return { error: { message: NETWORK_ERROR_MESSAGE, name: 'AuthApiError', status: 0 } as AuthError };
        }
        if (error && isRetryableOrServerError(error.message)) {
          logError('[Auth] Server error (user sees friendly message):', error.message);
          return { error: { message: 'Server error — please try again in a moment.', name: 'AuthApiError', status: 0 } as AuthError };
        }
        return { error };
      } catch (err) {
        if (attempt < retries) {
          const msg = err instanceof Error ? err.message : 'Request failed';
          const delayMs = isNetworkError(msg) ? 2000 : 800 * (attempt + 1);
          await new Promise(r => setTimeout(r, delayMs));
          continue;
        }
        const msg = err instanceof Error ? err.message : 'Request failed';
        if (isNetworkError(msg)) {
          logError('[Auth] Network error (user sees friendly message):', err);
          return { error: { message: NETWORK_ERROR_MESSAGE, name: 'AuthApiError', status: 0 } as AuthError };
        }
        if (isRetryableOrServerError(msg)) {
          logError('[Auth] Server error (user sees friendly message):', err);
          return { error: { message: 'Server error — please try again in a moment.', name: 'AuthApiError', status: 0 } as AuthError };
        }
        return { error: { message: msg, name: 'AuthApiError', status: 0 } as AuthError };
      }
    }
    logError('[Auth] Server error after retries');
    return { error: { message: 'Server error — please try again in a moment.', name: 'AuthApiError', status: 0 } as AuthError };
  };

  const signInWithEmail = async (email: string, password: string) => {
    return withRetry(() => supabase.auth.signInWithPassword({ email, password }));
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    return withRetry(() =>
      supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } }),
    );
  };

  const signInWithMagicLink = async (email: string) => {
    return withRetry(() =>
      supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/` } }),
    );
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      return { error: new Error('Not authenticated') };
    }

    try {
      const payload = { ...updates, updated_at: new Date().toISOString() };
      const { error } = await supabase.from('profiles').update(payload as never).eq('id', user.id);

      if (error) {
        return { error: new Error(error.message) };
      }

      await fetchProfile(user.id);
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    isConfigured,
    signInWithGoogle,
    signInWithGoogleIdToken,
    signInWithEmail,
    signUpWithEmail,
    signInWithMagicLink,
    signOut,
    updateProfile,
    refetchProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
