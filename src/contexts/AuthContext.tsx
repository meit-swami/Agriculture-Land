import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: { full_name: string; phone: string; state: string; district: string } | null;
  role: string | null;
  sendOtp: (phone: string) => Promise<{ error: any }>;
  verifyOtp: (phone: string, otp: string, metadata?: Record<string, string>) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null, session: null, loading: true, profile: null, role: null,
  sendOtp: async () => ({ error: null }),
  verifyOtp: async () => ({ error: null }),
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
    try { localStorage.removeItem(authLockKey); } catch {}
  };

  const clearStaleAuthState = () => {
    try { localStorage.removeItem(authStorageKey); clearAuthLock(); } catch {}
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

    clearAuthLock();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const sendOtp = async (phone: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { phone },
      });
      if (error) return { error };
      if (data?.error) return { error: { message: data.error } };
      return { error: null };
    } catch (err: any) {
      return { error: { message: err.message || 'Failed to send OTP' } };
    }
  };

  const verifyOtp = async (phone: string, otp: string, metadata?: Record<string, string>) => {
    try {
      clearStaleAuthState();

      const { data, error } = await supabase.functions.invoke('verify-phone-otp', {
        body: { phone, otp, metadata },
      });

      if (error) return { error };
      if (data?.error) return { error: { message: data.error } };

      // Use the token_hash to verify OTP via Supabase auth
      if (data?.token_hash && data?.email) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: data.token_hash,
          type: 'magiclink',
        });
        if (verifyError) return { error: verifyError };
      }

      return { error: null };
    } catch (err: any) {
      return { error: { message: err.message || 'Failed to verify OTP' } };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, profile, role, sendOtp, verifyOtp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
