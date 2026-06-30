import type { User } from "@supabase/supabase-js";
import { dbRoleToAppRole, type AppRole } from "@/lib/auth/roles";
import type { UserRole } from "@/lib/auth/types";
import { createClient } from "@/lib/supabase/server";

export interface AuthSession {
  user: User;
  appRole: AppRole;
  fullName: string | null;
  panitia: string | null;
}

export async function resolveAppRoleForUser(user: User): Promise<AppRole | null> {
  const fromEmail = dbRoleToAppRole(null, user.email);
  if (fromEmail) return fromEmail;

  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  return dbRoleToAppRole(data?.role as UserRole | undefined, user.email);
}

export async function getAuthSession(): Promise<AuthSession | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const appRole = await resolveAppRoleForUser(user);
  if (!appRole) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, panitia")
    .eq("id", user.id)
    .maybeSingle();

  return {
    user,
    appRole,
    fullName: profile?.full_name ?? null,
    panitia: profile?.panitia ?? null,
  };
}