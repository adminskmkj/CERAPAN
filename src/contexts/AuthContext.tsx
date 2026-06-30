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
import {
  canCreateCerapan,
  canDeleteCerapan,
  canModifyCerapan,
  dbRoleToAppRole,
  type AppRole,
} from "@/lib/auth/roles";
import type { UserRole } from "@/lib/auth/types";

import type { CerapanRecord } from "@/lib/types/cerapan";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

import { userMustChangePassword } from "@/lib/auth/password-policy";

interface AuthContextValue {
  user: User | null;
  appRole: AppRole | null;
  fullName: string | null;
  panitia: string | null;
  mustChangePassword: boolean;
  loading: boolean;
  isCloudMode: boolean;
  isAdmin: boolean;
  isPentadbir: boolean;
  isKetuaPanitia: boolean;
  canWriteCerapan: (
    sesiPengisian: string,
    opts?: {
      mataPelajaran?: string;
      existingId?: string;
      record?: Pick<
        CerapanRecord,
        "sesiPengisian" | "createdBy" | "panitiaKp" | "mataPelajaran"
      >;
    }
  ) => boolean;
  canModifyCerapanRecord: (
    record: Pick<
      CerapanRecord,
      "sesiPengisian" | "createdBy" | "panitiaKp" | "mataPelajaran"
    >
  ) => boolean;
  canDeleteCerapanRecord: (
    record: Pick<
      CerapanRecord,
      "sesiPengisian" | "createdBy" | "panitiaKp" | "mataPelajaran"
    >
  ) => boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error?: string; mustChangePassword?: boolean }>;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function resolveMeForUser(
  user: User,
  supabase: NonNullable<ReturnType<typeof createClient>>
): Promise<{
  appRole: AppRole | null;
  fullName: string | null;
  panitia: string | null;
}> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role, full_name, panitia")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("profiles:", error.message);
  }

  const appRole = dbRoleToAppRole(
    profile?.role as UserRole | undefined,
    user.email
  );

  return {
    appRole,
    fullName: profile?.full_name ?? null,
    panitia: profile?.panitia ?? null,
  };
}

async function fetchMe(user: User): Promise<{
  appRole: AppRole | null;
  fullName: string | null;
  panitia: string | null;
}> {
  const res = await fetch("/api/me", { cache: "no-store", credentials: "include" });
  if (!res.ok) return { appRole: null, fullName: null, panitia: null };
  const json = (await res.json()) as {
    appRole?: AppRole | null;
    fullName?: string | null;
    panitia?: string | null;
  };
  if (json.appRole) {
    return {
      appRole: json.appRole ?? null,
      fullName: json.fullName ?? null,
      panitia: json.panitia ?? null,
    };
  }

  const supabase = createClient();
  if (supabase) return resolveMeForUser(user, supabase);
  return { appRole: null, fullName: null, panitia: null };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [appRole, setAppRole] = useState<AppRole | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [panitia, setPanitia] = useState<string | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  const refreshRole = useCallback(async () => {
    const supabase = createClient();
    if (!supabase) return;
    const {
      data: { user: u },
    } = await supabase.auth.getUser();
    setUser(u ?? null);
    if (!u) {
      setAppRole(null);
      setFullName(null);
      setPanitia(null);
      return;
    }
    const me = await fetchMe(u);
    setAppRole(me.appRole);
    setFullName(me.fullName);
    setPanitia(me.panitia);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        const me = await fetchMe(u);
        setAppRole(me.appRole);
        setFullName(me.fullName);
        setPanitia(me.panitia);
      } else {
        setAppRole(null);
        setFullName(null);
        setPanitia(null);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        const me = await fetchMe(u);
        setAppRole(me.appRole);
        setFullName(me.fullName);
        setPanitia(me.panitia);
      } else {
        setAppRole(null);
        setFullName(null);
        setPanitia(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const supabase = createClient();
    if (!supabase) return { error: "Supabase tidak dikonfigurasi" };

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { error: error.message };
    if (!data.user) return { error: "Log masuk gagal" };

    const mustChangePassword = userMustChangePassword(data.user);

    let me = await resolveMeForUser(data.user, supabase);
    if (!me.appRole) {
      me = await fetchMe(data.user);
    }
    if (!me.appRole) {
      await supabase.auth.signOut();
      return {
        error:
          "Profil pentadbir/KP tidak dijumpai. Pastikan baris dalam jadual profiles (role ketua_panitia). Jika baru setup DB, refresh halaman dan cuba lagi.",
      };
    }

    setUser(data.user);
    setAppRole(me.appRole);
    setFullName(me.fullName);
    setPanitia(me.panitia);
    return { mustChangePassword };
  }, []);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setAppRole(null);
    setFullName(null);
    setPanitia(null);
  }, []);

  const value = useMemo(() => {
    const isPentadbir = appRole === "pentadbir";
    const isKetuaPanitia = appRole === "ketua_panitia";
    const userId = user?.id;
    return {
      user,
      appRole,
      fullName,
      panitia,
      loading,
      isCloudMode: isSupabaseConfigured,
      isAdmin: isPentadbir,
      isPentadbir,
      isKetuaPanitia,
      mustChangePassword: userMustChangePassword(user),
      canWriteCerapan: (
        sesi: string,
        opts?: {
          mataPelajaran?: string;
          existingId?: string;
          record?: Pick<
            CerapanRecord,
            "sesiPengisian" | "createdBy" | "panitiaKp" | "mataPelajaran"
          >;
        }
      ) => {
        if (opts?.existingId || opts?.record) {
          const rec = opts.record ?? {
            sesiPengisian: sesi,
            mataPelajaran: opts.mataPelajaran ?? "",
          };
          return canModifyCerapan(appRole, sesi, {
            userId,
            userPanitia: panitia,
            record: rec,
            isUpdate: true,
          });
        }
        return canCreateCerapan(appRole, sesi, {
          userId,
          userPanitia: panitia,
          record: opts?.mataPelajaran
            ? { sesiPengisian: sesi, mataPelajaran: opts.mataPelajaran }
            : undefined,
        });
      },
      canModifyCerapanRecord: (
        record: Pick<
          CerapanRecord,
          "sesiPengisian" | "createdBy" | "panitiaKp" | "mataPelajaran"
        >
      ) =>
        canModifyCerapan(appRole, record.sesiPengisian, {
          userId,
          userPanitia: panitia,
          record,
          isUpdate: true,
        }),
      canDeleteCerapanRecord: (
        record: Pick<
          CerapanRecord,
          "sesiPengisian" | "createdBy" | "panitiaKp" | "mataPelajaran"
        >
      ) =>
        canDeleteCerapan(appRole, record.sesiPengisian, {
          userId,
          userPanitia: panitia,
          record,
        }),
      signIn,
      signOut,
      refreshRole,
    };
  }, [user, appRole, fullName, panitia, loading, signIn, signOut, refreshRole]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth mesti dalam AuthProvider");
  return ctx;
}