import type { UserRole } from "./types";

export function canManageGuru(role: UserRole): boolean {
  return (
    role === "jpn_admin" ||
    role === "ppd_admin" ||
    role === "school_admin"
  );
}

export function canReadGuru(role: UserRole): boolean {
  return (
    role === "jpn_admin" ||
    role === "ppd_admin" ||
    role === "school_admin" ||
    role === "cerap_officer"
  );
}