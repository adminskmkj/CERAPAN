import { NextResponse } from "next/server";
import {
  JENIS_PENCERAPAN_1,
  JENIS_PENCERAPAN_2,
  isKetuaPanitiaCerapan,
} from "@/lib/cerapan/jenis";
import {
  canCreateCerapan,
  canDeleteCerapan,
  canModifyCerapan,
} from "@/lib/auth/roles";
import type { CerapanRecord } from "@/lib/types/cerapan";
import { getAuthSession, type AuthSession } from "@/lib/auth/session";
import { panitiaMatchesMataPelajaran } from "@/lib/data/panitia";

type CerapanAuthResult =
  | { session: AuthSession; error?: undefined }
  | { session?: undefined; error: NextResponse };

export async function requireCerapanWriter(
  sesiPengisian: string,
  existing?: CerapanRecord | null,
  draft?: Pick<CerapanRecord, "namaGuru" | "mataPelajaran" | "panitiaKp">
): Promise<CerapanAuthResult> {
  const session = await getAuthSession();
  if (!session) {
    return {
      error: NextResponse.json(
        { error: "Log masuk diperlukan untuk pencerapan ini." },
        { status: 401 }
      ),
    };
  }

  const ctxBase = {
    userId: session.user.id,
    userPanitia: session.panitia,
  };

  const draftRecord = draft
    ? {
        sesiPengisian,
        mataPelajaran: draft.mataPelajaran,
        panitiaKp: draft.panitiaKp,
      }
    : undefined;

  if (existing) {
    const recordCtx = {
      sesiPengisian: existing.sesiPengisian,
      createdBy: existing.createdBy,
      panitiaKp: existing.panitiaKp,
      mataPelajaran: existing.mataPelajaran,
    };
    if (!canModifyCerapan(session.appRole, existing.sesiPengisian, {
      ...ctxBase,
      record: recordCtx,
      isUpdate: true,
    })) {
      return forbidden(session, existing.sesiPengisian, true);
    }
    if (
      sesiPengisian !== existing.sesiPengisian &&
      !canCreateCerapan(session.appRole, sesiPengisian, {
        ...ctxBase,
        record: draftRecord ?? recordCtx,
      })
    ) {
      return forbidden(session, sesiPengisian, false);
    }
  } else if (
    !canCreateCerapan(session.appRole, sesiPengisian, {
      ...ctxBase,
      record: draftRecord,
    })
  ) {
    return forbidden(session, sesiPengisian, false);
  }

  if (
    session.appRole === "ketua_panitia" &&
    isKetuaPanitiaCerapan(sesiPengisian)
  ) {
    const panitia = session.panitia?.trim();
    if (!panitia) {
      return {
        error: NextResponse.json(
          {
            error:
              "Profil ketua panitia tiada panitia. Pentadbir perlu set medan panitia pada profil anda.",
          },
          { status: 403 }
        ),
      };
    }
    const mp = draft?.mataPelajaran?.trim();
    if (mp && !panitiaMatchesMataPelajaran(panitia, mp)) {
      return {
        error: NextResponse.json(
          {
            error: `Mata pelajaran PdP mesti dalam panitia anda (${panitia}). KP lain tidak boleh ubah markah panitia lain.`,
          },
          { status: 403 }
        ),
      };
    }
  }

  return { session };
}

export async function requireCerapanDelete(
  record: CerapanRecord
): Promise<CerapanAuthResult> {
  const session = await getAuthSession();
  if (!session) {
    return {
      error: NextResponse.json({ error: "Tidak log masuk" }, { status: 401 }),
    };
  }
  if (
    !canDeleteCerapan(session.appRole, record.sesiPengisian, {
      userId: session.user.id,
      userPanitia: session.panitia,
      record: {
        sesiPengisian: record.sesiPengisian,
        createdBy: record.createdBy,
        panitiaKp: record.panitiaKp,
        mataPelajaran: record.mataPelajaran,
      },
    })
  ) {
    return {
      error: NextResponse.json(
        {
          error:
            "Anda tidak boleh padam atau ubah markah pencerapan ketua panitia lain. Hanya pentadbir atau KP yang mencipta rekod panitia sendiri.",
        },
        { status: 403 }
      ),
    };
  }
  return { session };
}

function forbidden(
  session: AuthSession,
  sesi: string,
  isUpdate: boolean
): CerapanAuthResult {
  const isPentadbirRecord =
    sesi === JENIS_PENCERAPAN_1 || sesi === JENIS_PENCERAPAN_2;
  let msg = "Akses ditolak untuk jenis pencerapan ini.";
  if (session.appRole === "ketua_panitia" && isPentadbirRecord) {
    msg =
      "Ketua Panitia tidak boleh mengubah markah pencerapan pentadbir (Pencerapan 1 & 2).";
  } else if (session.appRole === "ketua_panitia" && isUpdate) {
    msg =
      "Ketua Panitia hanya boleh mengubah markah rekod yang dibuat oleh KP itu sendiri. Rekod pentadbir atau KP panitia lain tidak boleh diubah.";
  } else if (session.appRole === "ketua_panitia") {
    msg =
      "Pencerapan ini bukan dalam panitia anda atau rekod sudah wujud untuk guru tersebut dalam panitia anda.";
  }

  return { error: NextResponse.json({ error: msg }, { status: 403 }) };
}