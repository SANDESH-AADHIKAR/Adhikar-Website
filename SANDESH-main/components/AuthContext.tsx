'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: string | null; message?: string }>;
  signInWithOtp: (email: string) => Promise<{ error: string | null }>;
  signInDemo: (email?: string, name?: string) => void;
  signOut: () => Promise<void>;
  authModalOpen: boolean;
  authModalMode: 'signin' | 'signup';
  openAuthModal: (mode?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER_STORAGE_KEY = 'adhikar_demo_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      // 1. Check local demo user first if available
      try {
        const storedDemo = localStorage.getItem(DEMO_USER_STORAGE_KEY);
        if (storedDemo) {
          const parsed = JSON.parse(storedDemo);
          if (parsed && parsed.email) {
            setUser(parsed);
            setLoading(false);
            return;
          }
        }
      } catch {
        // ignore
      }

      // 2. Check Supabase session
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase.auth.getSession();
          if (!error && data?.session && mounted) {
            setSession(data.session);
            setUser(data.session.user);
          }
        } catch (err) {
          console.warn('Supabase auth session fetch notice:', err);
        }

        // Listen for live auth state changes
        try {
          const { data: authListener } = supabase.auth.onAuthStateChange(
            (_event, currentSession) => {
              if (mounted) {
                setSession(currentSession);
                setUser(currentSession?.user ?? null);
                if (currentSession?.user) {
                  localStorage.removeItem(DEMO_USER_STORAGE_KEY);
                }
              }
            }
          );

          return () => {
            authListener?.subscription?.unsubscribe();
          };
        } catch {
          // ignore
        }
      }

      if (mounted) setLoading(false);
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const openAuthModal = useCallback((mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  const signIn = useCallback(
    async (email: string, password: string): Promise<{ error: string | null }> => {
      if (!isSupabaseConfigured || !supabase) {
        return { error: 'Supabase is not configured in this environment.' };
      }
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          return { error: error.message };
        }
        setUser(data.user);
        setSession(data.session);
        localStorage.removeItem(DEMO_USER_STORAGE_KEY);
        setAuthModalOpen(false);
        return { error: null };
      } catch (err: any) {
        return { error: err?.message || 'Failed to sign in' };
      }
    },
    []
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      fullName?: string
    ): Promise<{ error: string | null; message?: string }> => {
      if (!isSupabaseConfigured || !supabase) {
        return { error: 'Supabase is not configured in this environment.' };
      }
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName || email.split('@')[0],
            },
          },
        });
        if (error) {
          return { error: error.message };
        }
        if (data.session) {
          setUser(data.user);
          setSession(data.session);
          setAuthModalOpen(false);
          return { error: null, message: 'Account created and signed in successfully!' };
        }
        return {
          error: null,
          message: 'Account created! Please check your email inbox to confirm your account.',
        };
      } catch (err: any) {
        return { error: err?.message || 'Failed to sign up' };
      }
    },
    []
  );

  const signInWithOtp = useCallback(
    async (email: string): Promise<{ error: string | null }> => {
      if (!isSupabaseConfigured || !supabase) {
        return { error: 'Supabase is not configured in this environment.' };
      }
      try {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
          },
        });
        if (error) {
          return { error: error.message };
        }
        return { error: null };
      } catch (err: any) {
        return { error: err?.message || 'Failed to send magic link' };
      }
    },
    []
  );

  const signInDemo = useCallback((email: string = 'citizen@adhikar.nic.in', name: string = 'Citizen User') => {
    const demoUser = {
      id: 'demo-citizen-id',
      email,
      app_metadata: {},
      user_metadata: { full_name: name },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as unknown as User;

    setUser(demoUser);
    try {
      localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(demoUser));
    } catch {
      // ignore
    }
    setAuthModalOpen(false);
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Sign out notice:', err);
    }
    try {
      localStorage.removeItem(DEMO_USER_STORAGE_KEY);
    } catch {
      // ignore
    }
    setUser(null);
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isConfigured: isSupabaseConfigured,
        signIn,
        signUp,
        signInWithOtp,
        signInDemo,
        signOut,
        authModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
