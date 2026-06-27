import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
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
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Ralat" },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Supabase tidak dikonfigurasi" },
      { status: 503 }
    );
  }

  const body = await request.json();

  try {
    const record = await saveCerapanSupabase(
      admin,
      null,
      {
        id: body.id,
        kodSekolah: body.kodSekolah,
        namaSekolah: body.namaSekolah,
        namaGuru: body.namaGuru,
        mataPelajaran: body.mataPelajaran,
        kelas: body.kelas,
        sesiPengisian: body.sesiPengisian,
        tarikh: body.tarikh,
        kalendarAkademik: body.kalendarAkademik,
        namaPemerhati: body.namaPemerhati,
        scores: body.scores as Record<string, InputValue>,
      },
      null
    );
    return NextResponse.json(record);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Ralat simpan" },
      { status: 400 }
    );
  }
}
