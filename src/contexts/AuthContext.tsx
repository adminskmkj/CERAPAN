"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import type { UserProfile } from "@/lib/auth/types";

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isCloudMode, setIsCloudMode] = useState(false);

  useEffect(() => {
    fetch("/api/config")
      .then((res) => (res.ok ? res.json() : { cloudMode: false }))
      .then((json) => setIsCloudMode(Boolean(json.cloudMode)))
      .catch(() => setIsCloudMode(false))
      .finally(() => setLoading(false));
  }, []);

  const refreshProfile = useCallback(async () => {}, []);

  const signIn = useCallback(async () => {
    return { error: "Log masuk tidak diperlukan. Pilih nama pemerhati dalam borang." };
  }, []);

  const signOut = useCallback(async () => {}, []);

  const value = useMemo(
    () => ({
      user: null,
      profile: null,
      loading,
      isCloudMode,
      isAdmin: false,
      signIn,
      signOut,
      refreshProfile,
    }),
    [loading, isCloudMode, signIn, signOut, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth mesti dalam AuthProvider");
  return ctx;
}