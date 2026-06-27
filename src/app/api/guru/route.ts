import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Supabase tidak dikonfigurasi" },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const kodSekolah = searchParams.get("kodSekolah")?.trim().toUpperCase() || "";

  if (!kodSekolah) {
    return NextResponse.json({ error: "kodSekolah diperlukan" }, { status: 400 });
  }

  const { data, error } = await admin
    .from("gurus")
    .select("id, kod_sekolah, nama_sekolah, nama_guru, mata_pelajaran, created_at")
    .eq("kod_sekolah", kodSekolah)
    .order("nama_guru", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const fromDb = (data ?? []).map((row) => ({
    id: row.id,
    kodSekolah: row.kod_sekolah,
    namaSekolah: row.nama_sekolah,
    namaGuru: row.nama_guru,
    mataPelajaran: row.mata_pelajaran,
    createdAt: row.created_at,
  }));

  const { data: cerapanRows } = await admin
    .from("cerapan")
    .select("nama_guru")
    .eq("kod_sekolah", kodSekolah);

  const fromCerapan = [
    ...new Set((cerapanRows ?? []).map((r) => r.nama_guru.trim()).filter(Boolean)),
  ];

  const mergedNames = [...new Set([...fromDb.map((g) => g.namaGuru), ...fromCerapan])].sort(
    (a, b) => a.localeCompare(b, "ms")
  );

  return NextResponse.json({
    gurus: fromDb,
    namaGuru: mergedNames,
  });
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
  const kodSekolah = String(body.kodSekolah ?? "").trim().toUpperCase();
  const namaGuru = String(body.namaGuru ?? "").trim();
  const namaSekolah = String(body.namaSekolah ?? "").trim() || null;
  const mataPelajaran = String(body.mataPelajaran ?? "").trim() || null;

  if (!kodSekolah || !namaGuru) {
    return NextResponse.json(
      { error: "Kod sekolah dan nama guru diperlukan" },
      { status: 400 }
    );
  }

  let schoolId: string | null = null;
  const { data: school } = await admin
    .from("schools")
    .select("id")
    .eq("kod_sekolah", kodSekolah)
    .maybeSingle();
  schoolId = school?.id ?? null;

  const { data, error } = await admin
    .from("gurus")
    .upsert(
      {
        school_id: schoolId,
        kod_sekolah: kodSekolah,
        nama_sekolah: namaSekolah,
        nama_guru: namaGuru,
        mata_pelajaran: mataPelajaran,
        created_by: null,
      },
      { onConflict: "kod_sekolah,nama_guru" }
    )
    .select("id, kod_sekolah, nama_guru, mata_pelajaran, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    id: data.id,
    kodSekolah: data.kod_sekolah,
    namaGuru: data.nama_guru,
    mataPelajaran: data.mata_pelajaran,
    createdAt: data.created_at,
  });
}