export type UserRole =
  | "jpn_admin"
  | "ppd_admin"
  | "school_admin"
  | "cerap_officer";

export interface UserProfile {
  id: string;
  fullName: string;
  role: UserRole;
  orgId: string | null;
  schoolId: string | null;
  email?: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  jpn_admin: "Pentadbir JPN",
  ppd_admin: "Pentadbir Utama",
  school_admin: "Pentadbir Sekolah",
  cerap_officer: "Pegawai Cerapan",
};

export function isAdminRole(role: UserRole): boolean {
  return role === "jpn_admin" || role === "ppd_admin";
}