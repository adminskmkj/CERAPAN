import type { CerapanRecord } from "@/lib/types/cerapan";
import {
  isKendiri,
  isKetuaPanitiaCerapan,
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
  if (isKendiri(sesiPengisian)) return true;
  if (isPencerapanAdmin(sesiPengisian)) return role === "pentadbir";
  if (isKetuaPanitiaCerapan(sesiPengisian)) {
    if (role === "pentadbir") return true;
    if (role !== "ketua_panitia") return false;
    const panitia = ctx?.userPanitia?.trim();
    if (!panitia) return false;
    if (ctx?.record?.mataPelajaran) {
      return panitiaMatchesMataPelajaran(panitia, ctx.record.mataPelajaran);
    }
    return true;
  }
  return false;
}

/** KP boleh ubah markah rekod KP sendiri sahaja; tidak boleh ubah P1/P2 atau rekod KP lain */
export function canModifyCerapan(
  role: AppRole | null,
  sesiPengisian: string,
  ctx?: CerapanPermissionContext
): boolean {
  if (isPencerapanAdmin(sesiPengisian)) {
    return role === "pentadbir";
  }
  if (isKetuaPanitiaCerapan(sesiPengisian)) {
    if (role === "pentadbir") return true;
    if (role !== "ketua_panitia") return false;
    const userId = ctx?.userId;
    const panitia = ctx?.userPanitia?.trim();
    const record = ctx?.record;
    if (!panitia || !record) return false;

    if (record.createdBy && userId) {
      if (record.createdBy !== userId) return false;
    } else if (record.panitiaKp) {
      if (!panitiaMatchesMataPelajaran(panitia, record.panitiaKp)) {
        return false;
      }
    } else {
      return false;
    }

    if (record.mataPelajaran) {
      return panitiaMatchesMataPelajaran(panitia, record.mataPelajaran);
    }
    return true;
  }
  if (isKendiri(sesiPengisian)) return true;
  return canCreateCerapan(role, sesiPengisian, ctx);
}

export function canDeleteCerapan(
  role: AppRole | null,
  sesiPengisian: string,
  ctx?: CerapanPermissionContext
): boolean {
  if (role === "pentadbir") return true;
  if (role !== "ketua_panitia" || !isKetuaPanitiaCerapan(sesiPengisian)) {
    return false;
  }
  return canModifyCerapan(role, sesiPengisian, { ...ctx, isUpdate: true });
}