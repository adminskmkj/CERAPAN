export type UserRole =
  | "jpn_admin"
  | "ppd_admin"
  | "school_admin"
  | "ketua_panitia"
  | "cerap_officer";

export interface UserProfile {
  id: string;
  fullName: string;
  role: UserRole;
  orgId: string | null;
  schoolId: string | null;
  /** Panitia yang diselia (KP sahaja) */
  panitia?: string | null;
  email?: string;
}