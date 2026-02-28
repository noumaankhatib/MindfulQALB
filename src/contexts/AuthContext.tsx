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
  signInWithEmail: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>;
  signInWithMagicLink: (email: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
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
      async (_event, session) => {
        try {
          if (!mountedRef.current) return;
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            await fetchProfile(session.user.id);
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

  const fetchProfile = async (userId: string, retries = 3) => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (!mountedRef.current) return;
        if (error) {
          if (attempt < retries) {
            await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempt)));
            continue;
          }
          logError('Error fetching profile after retries:', error);
        } else {
          setProfile(data);
        }
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
    // Get the OAuth URL but don't navigate yet — we need to replace the
    // proxy URL (/sb) with the real Supabase URL because OAuth requires
    // direct browser redirects (Supabase → Google → Supabase callback).
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        skipBrowserRedirect: true,
      },
    });

    if (error) return { error };

    if (data?.url) {
      let oauthUrl = data.url;
      const realUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '');
      if (realUrl) {
        oauthUrl = oauthUrl.replace(`${window.location.origin}/sb`, realUrl);
      }
      window.location.href = oauthUrl;
    }

    return { error: null };
  };

  const withRetry = async (
    fn: () => Promise<{ error: AuthError | null }>,
    retries = 1,
  ): Promise<{ error: AuthError | null }> => {
    const isRetryableOrServerError = (msg: string) =>
      /unexpected end of json|failed to fetch|network|timeout|failed to execute|500|502|internal server error|bad gateway/i.test(msg);

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const { error } = await fn();
        if (error && attempt < retries && isRetryableOrServerError(error.message)) {
          await new Promise(r => setTimeout(r, 800 * (attempt + 1)));
          continue;
        }
        if (error && isRetryableOrServerError(error.message)) {
          logError('[Auth] Server error (user sees friendly message):', error.message);
          return { error: { message: 'Server error — please try again in a moment.', name: 'AuthApiError', status: 0 } as AuthError };
        }
        return { error };
      } catch (err) {
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 800 * (attempt + 1)));
          continue;
        }
        const msg = err instanceof Error ? err.message : 'Request failed';
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
    signInWithEmail,
    signUpWithEmail,
    signInWithMagicLink,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
