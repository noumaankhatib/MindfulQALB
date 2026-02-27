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

  const signInWithGoogle = (): Promise<{ error: AuthError | null }> => {
    const GOOGLE_CLIENT_ID = '57725851287-h21ml8nciji9uplg9uorqlmghaqo17c8.apps.googleusercontent.com';

    return new Promise((resolve) => {
      const google = (window as unknown as { google?: { accounts?: { id: {
        initialize: (config: Record<string, unknown>) => void;
        prompt: (cb?: (notification: { isNotDisplayed: () => boolean; getNotDisplayedReason: () => string }) => void) => void;
      } } } }).google;

      if (!google?.accounts?.id) {
        resolve({ error: { message: 'Google sign-in is loading, please try again in a moment.', name: 'AuthApiError', status: 0 } as AuthError });
        return;
      }

      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: { credential?: string }) => {
          if (!response.credential) {
            resolve({ error: { message: 'Google sign-in was cancelled.', name: 'AuthApiError', status: 0 } as AuthError });
            return;
          }
          try {
            const { error } = await supabase.auth.signInWithIdToken({
              provider: 'google',
              token: response.credential,
            });
            resolve({ error });
          } catch (err) {
            const msg = err instanceof Error ? err.message : 'Sign in failed';
            resolve({ error: { message: msg, name: 'AuthApiError', status: 0 } as AuthError });
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed()) {
          const reason = notification.getNotDisplayedReason();
          if (reason === 'opt_out_or_no_session') {
            // No Google session — fall back to popup
            openGooglePopup(GOOGLE_CLIENT_ID, resolve);
          } else {
            resolve({ error: { message: `Google sign-in unavailable (${reason}). Try email sign-in instead.`, name: 'AuthApiError', status: 0 } as AuthError });
          }
        }
      });
    });
  };

  const openGooglePopup = (clientId: string, resolve: (v: { error: AuthError | null }) => void) => {
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'token id_token',
      scope: 'openid email profile',
      nonce: Math.random().toString(36).slice(2),
    });
    const width = 500, height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const popup = window.open(
      `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
      'google-signin',
      `width=${width},height=${height},left=${left},top=${top},popup=true`
    );
    if (!popup) {
      resolve({ error: { message: 'Popup blocked. Please allow popups for this site.', name: 'AuthApiError', status: 0 } as AuthError });
      return;
    }
    const interval = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(interval);
          resolve({ error: { message: 'Google sign-in was cancelled.', name: 'AuthApiError', status: 0 } as AuthError });
          return;
        }
        const url = popup.location.href;
        if (url?.startsWith(window.location.origin)) {
          clearInterval(interval);
          popup.close();
          const hash = new URL(url).hash.slice(1);
          const hashParams = new URLSearchParams(hash);
          const idToken = hashParams.get('id_token');
          if (!idToken) {
            resolve({ error: { message: 'No token received from Google.', name: 'AuthApiError', status: 0 } as AuthError });
            return;
          }
          supabase.auth.signInWithIdToken({ provider: 'google', token: idToken })
            .then(({ error }) => resolve({ error }))
            .catch((err) => resolve({ error: { message: err instanceof Error ? err.message : 'Sign in failed', name: 'AuthApiError', status: 0 } as AuthError }));
        }
      } catch {
        // Cross-origin access expected while on Google's domain
      }
    }, 200);
    setTimeout(() => { clearInterval(interval); try { popup.close(); } catch {} }, 120000);
  };

  const withRetry = async (
    fn: () => Promise<{ error: AuthError | null }>,
    retries = 1,
  ): Promise<{ error: AuthError | null }> => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const { error } = await fn();
        if (
          error &&
          attempt < retries &&
          /unexpected end of json|failed to fetch|network|timeout/i.test(error.message)
        ) {
          await new Promise(r => setTimeout(r, 800 * (attempt + 1)));
          continue;
        }
        return { error };
      } catch (err) {
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 800 * (attempt + 1)));
          continue;
        }
        const msg = err instanceof Error ? err.message : 'Request failed';
        if (/unexpected end of json|failed to fetch/i.test(msg)) {
          return { error: { message: 'Connection unstable — please try again.', name: 'AuthApiError', status: 0 } as AuthError };
        }
        return { error: { message: msg, name: 'AuthApiError', status: 0 } as AuthError };
      }
    }
    return { error: { message: 'Connection unstable — please try again.', name: 'AuthApiError', status: 0 } as AuthError };
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
