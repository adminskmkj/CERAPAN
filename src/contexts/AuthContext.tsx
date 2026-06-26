"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { UserProfile, UserRole } from "@/lib/auth/types";
import { isAdminRole } from "@/lib/auth/types";

interface CloudConfig {
  url: string;
  anonKey: string;
}

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isCloudMode: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchProfile(): Promise<UserProfile | null> {
  try {
    const res = await fetch("/api/me");
    if (!res.ok) return null;
    const json = await res.json();
    return json.profile ?? null;
  } catch {
    return null;
  }
}

async function fetchCloudConfig(): Promise<CloudConfig | null> {
  try {
    const res = await fetch("/api/config");
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.cloudMode || !json.url || !json.anonKey) return null;
    return { url: json.url, anonKey: json.anonKey };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCloudMode, setIsCloudMode] = useState(false);
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }
    const p = await fetchProfile();
    setProfile(p);
  }, [user]);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | undefined;

    async function init() {
      const config = await fetchCloudConfig();
      if (!config) {
        setIsCloudMode(false);
        setLoading(false);
        return;
      }

      setIsCloudMode(true);
      const client = createBrowserClient(config.url, config.anonKey);
      setSupabase(client);

      const {
        data: { session },
      } = await client.auth.getSession();
      setUser(session?.user ?? null);

      const { data } = client.auth.onAuthStateChange(async (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          const p = await fetchProfile();
          setProfile(p);
        } else {
          setProfile(null);
        }
      });
      subscription = data.subscription;
      setLoading(false);
    }

    init();

    return () => subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) refreshProfile();
  }, [user, refreshProfile]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!supabase) return { error: "Supabase tidak dikonfigurasi" };

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { error: error.message };
      return {};
    },
    [supabase]
  );

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, [supabase]);

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      isCloudMode,
      isAdmin: profile ? isAdminRole(profile.role) : false,
      signIn,
      signOut,
      refreshProfile,
    }),
    [user, profile, loading, isCloudMode, signIn, signOut, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth mesti dalam AuthProvider");
  return ctx;
}