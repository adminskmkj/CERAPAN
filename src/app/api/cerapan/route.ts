import { NextResponse } from "next/server";
import { isKendiri, isPencerapanAdmin } from "@/lib/cerapan/jenis";
import { KOD_SEKOLAH, NAMA_SEKOLAH } from "@/lib/data/sekolah";
import { requireCerapanWriter } from "@/lib/auth/require-cerapan";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatSupabaseError } from "@/lib/supabase/errors";
import {
  findDuplicateCerapan,
  getCerapanSupabase,
  listCerapanSupabase,
  saveCerapanSupabase,
} from "@/lib/storage/cerapan-supabase";
import type { InputValue } from "@/lib/scoring/standard4";

export const runtime = "nodejs";

export async function GET() {
  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Supabase tidak dikonfigurasi" },
      { status: 503 }
    );
  }

  try {
    const records = await listCerapanSupabase(admin);
    return NextResponse.json(records);
  } catch (e) {
    return NextResponse.json({ error: formatSupabaseError(e) }, { status: 400 });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const sesiPengisian = String(body.sesiPengisian ?? "");

  let userId: string | null = null;
  let panitiaKp: string | null = body.panitiaKp
    ? String(body.panitiaKp).trim()
    : null;

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Supabase tidak dikonfigurasi" },
      { status: 503 }
    );
  }

  const existingId = body.id ? String(body.id) : undefined;
  let existing = null;
  if (existingId) {
    existing = await getCerapanSupabase(admin, existingId);
    if (!existing) {
      return NextResponse.json({ error: "Rekod tidak dijumpai" }, { status: 404 });
    }
  }

  const draft = {
    namaGuru: String(body.namaGuru ?? ""),
    mataPelajaran: String(body.mataPelajaran ?? ""),
    panitiaKp: panitiaKp ?? undefined,
  };

  if (existing || !isKendiri(sesiPengisian)) {
    const auth = await requireCerapanWriter(sesiPengisian, existing, draft);
    if (auth.error) return auth.error;
    if (!isKendiri(sesiPengisian)) {
      userId = auth.session.user.id;
      if (
        auth.session.appRole === "ketua_panitia" &&
        isPencerapanAdmin(sesiPengisian)
      ) {
        panitiaKp = auth.session.panitia?.trim() ?? panitiaKp;
      }
    }
  }

  const namaPemerhati = body.namaPemerhati
    ? String(body.namaPemerhati).trim()
    : null;

  const existingList = await listCerapanSupabase(admin);
  const duplicate = findDuplicateCerapan(
    existingList,
    body.namaGuru,
    sesiPengisian,
    body.id,
    namaPemerhati
  );
  if (duplicate) {
    const pencerap = namaPemerhati ? ` (${namaPemerhati})` : "";
    const editHint = isKendiri(sesiPengisian)
      ? " Hubungi pentadbir jika perlu ubah rekod sedia ada."
      : "";
    return NextResponse.json(
      {
        error: `Rekod ${sesiPengisian} untuk ${body.namaGuru}${pencerap} sudah wujud.${editHint}`,
        duplicateId: duplicate.id,
      },
      { status: 409 }
    );
  }

  try {
    const record = await saveCerapanSupabase(
      admin,
      userId,
      {
        id: body.id,
        kodSekolah: KOD_SEKOLAH,
        namaSekolah: NAMA_SEKOLAH,
        namaGuru: body.namaGuru,
        mataPelajaran: body.mataPelajaran,
        kelas: body.kelas,
        sesiPengisian,
        tarikh: body.tarikh,
        kalendarAkademik: body.kalendarAkademik,
        namaPemerhati: body.namaPemerhati,
        panitiaKp: panitiaKp ?? undefined,
        dapatanPencerap: body.dapatanPencerap,
        langkahPenambahbaikan: body.langkahPenambahbaikan,
        ulasanPencerapan: body.ulasanPencerapan,
        tarikhTindakLanjut: body.tarikhTindakLanjut,
        scores: body.scores as Record<string, InputValue>,
      },
      null
    );
    return NextResponse.json(record);
  } catch (e) {
    console.error("[POST /api/cerapan]", e);
    return NextResponse.json({ error: formatSupabaseError(e) }, { status: 400 });
  }
}