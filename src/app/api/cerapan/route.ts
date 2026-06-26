import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  listCerapanSupabase,
  saveCerapanSupabase,
} from "@/lib/storage/cerapan-supabase";
import type { InputValue } from "@/lib/scoring/standard4";

export async function GET() {
  const supabase = await createClient();
  const admin = createAdminClient();
  if (!supabase || !admin) {
    return NextResponse.json({ error: "Supabase tidak dikonfigurasi" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Tidak log masuk" }, { status: 401 });
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
  const supabase = await createClient();
  const admin = createAdminClient();
  if (!supabase || !admin) {
    return NextResponse.json({ error: "Supabase tidak dikonfigurasi" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Tidak log masuk" }, { status: 401 });
  }

  const body = await request.json();
  const { data: profile } = await admin
    .from("profiles")
    .select("school_id")
    .eq("id", user.id)
    .maybeSingle();

  try {
    const record = await saveCerapanSupabase(
      admin,
      user.id,
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
      profile?.school_id ?? null
    );
    return NextResponse.json(record);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Ralat simpan" },
      { status: 400 }
    );
  }
}