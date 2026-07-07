import type { CerapanRecord } from "@/lib/types/cerapan";
import {
  effectiveSesiPengisian,
  isKendiri,
  isPencerapanAdmin,
} from "@/lib/cerapan/jenis";
import { panitiaMatchesMataPelajaran } from "@/lib/data/panitia";
import { isAdminEmail } from "@/lib/auth/constants";
import type { UserRole } from "@/lib/auth/types";

export type AppRole = "pentadbir" | "ketua_panitia";

export interface CerapanPermissionContext {
  userId?: string | null;
  userPanitia?: string | null;
  record?: Pick<
    CerapanRecord,
    "sesiPengisian" | "createdBy" | "panitiaKp" | "mataPelajaran"
  > | null;
  isUpdate?: boolean;
}

export function dbRoleToAppRole(
  dbRole: UserRole | null | undefined,
  email?: string | null
): AppRole | null {
  if (isAdminEmail(email)) return "pentadbir";
  switch (dbRole) {
    case "school_admin":
    case "jpn_admin":
    case "ppd_admin":
      return "pentadbir";
    case "ketua_panitia":
      return "ketua_panitia";
    default:
      return null;
  }
}

export function canCreateCerapan(
  role: AppRole | null,
  sesiPengisian: string,
  ctx?: CerapanPermissionContext
): boolean {
  const sesi = effectiveSesiPengisian(sesiPengisian);
  if (isKendiri(sesi)) return true;
  if (isPencerapanAdmin(sesi)) {
    if (role === "pentadbir") return true;
    if (role === "ketua_panitia") {
      const panitia = ctx?.userPanitia?.trim();
      if (!panitia) return false;
      if (ctx?.record?.mataPelajaran) {
        return panitiaMatchesMataPelajaran(panitia, ctx.record.mataPelajaran);
      }
      return true;
    }
    return false;
  }
  return false;
}

/** KP boleh ubah rekod P1/P2 yang dicipta sendiri sahaja; pentadbir ubah semua */
export function canModifyCerapan(
  role: AppRole | null,
  sesiPengisian: string,
  ctx?: CerapanPermissionContext
): boolean {
  const sesi = effectiveSesiPengisian(sesiPengisian);
  if (isKendiri(sesi)) return true;
  if (isPencerapanAdmin(sesi)) {
    if (role === "pentadbir") return true;
    if (role === "ketua_panitia") {
      const userId = ctx?.userId;
      const panitia = ctx?.userPanitia?.trim();
      const record = ctx?.record;
      if (!userId || !panitia || !record) return false;

      if (record.createdBy && record.createdBy !== userId) return false;

      if (
        record.panitiaKp &&
        !panitiaMatchesMataPelajaran(panitia, record.panitiaKp)
      ) {
        return false;
      }

      if (
        record.mataPelajaran &&
        !panitiaMatchesMataPelajaran(panitia, record.mataPelajaran)
      ) {
        return false;
      }

      return true;
    }
    return false;
  }
  return canCreateCerapan(role, sesi, ctx);
}

export function canDeleteCerapan(
  role: AppRole | null,
  sesiPengisian: string,
  ctx?: CerapanPermissionContext
): boolean {
  return canModifyCerapan(role, sesiPengisian, { ...ctx, isUpdate: true });
}