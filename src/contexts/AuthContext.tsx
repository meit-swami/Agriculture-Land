import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: { full_name: string; phone: string; state: string; district: string } | null;
  role: string | null;
  signUp: (email: string, password: string, metadata: Record<string, string>) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null, session: null, loading: true, profile: null, role: null,
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<AuthContextType['profile']>(null);
  const [role, setRole] = useState<string | null>(null);

  const authStorageKey = `sb-${import.meta.env.VITE_SUPABASE_PROJECT_ID}-auth-token`;
  const authLockKey = `lock:${authStorageKey}`;

  const clearAuthLock = () => {
    try {
      localStorage.removeItem(authLockKey);
    } catch {
      // ignore localStorage access errors
    }
  };

  const clearStaleAuthState = () => {
    try {
      localStorage.removeItem(authStorageKey);
      clearAuthLock();
    } catch {
      // ignore localStorage access errors
    }
  };

  const fetchProfile = async (userId: string) => {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileData) {
      setProfile({
        full_name: profileData.full_name,
        phone: profileData.phone,
        state: profileData.state,
        district: profileData.district,
      });
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    if (roleData) setRole(roleData.role);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => fetchProfile(session.user.id), 0);
      } else {
        setProfile(null);
        setRole(null);
      }
      setLoading(false);
    });

    // Clear any orphaned lock key from previous crashed/unmounted sessions
    clearAuthLock();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, metadata: Record<string, string>) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: window.location.origin,
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    // Reset stale auth artifacts before trying to sign in
    clearStaleAuthState();

    // Best effort local sign-out (prevents stale in-memory session state)
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch {
      // Ignore signOut errors
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error && String(error.message).toLowerCase().includes('failed to fetch')) {
      // Ensure next attempt starts from a clean state
      clearStaleAuthState();
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, profile, role, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
