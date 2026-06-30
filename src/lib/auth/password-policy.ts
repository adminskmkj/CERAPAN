import type { User } from "@supabase/supabase-js";
import { KP_PASSWORD_MIN_LENGTH, KP_TEMP_PASSWORD } from "@/lib/auth/constants";

export function userMustChangePassword(user: User | null | undefined): boolean {
  if (!user) return false;
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  return meta?.must_change_password === true;
}

export function validateNewPassword(password: string): string | null {
  const p = password.trim();
  if (p.length < KP_PASSWORD_MIN_LENGTH) {
    return `Kata laluan baru minimum ${KP_PASSWORD_MIN_LENGTH} aksara.`;
  }
  if (p === KP_TEMP_PASSWORD) {
    return "Kata laluan sementara tidak dibenarkan. Sila pilih kata laluan baharu.";
  }
  return null;
}