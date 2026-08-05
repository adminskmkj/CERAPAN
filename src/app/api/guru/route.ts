import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  type SesiGuru,
  formatStaffLabel,
  getDefaultGuruBySesi,
} from "@/lib/data/senarai-smkjs";

export const runtime = "nodejs";

function parseSesi(raw: string | null): SesiGuru | null {
  const s = raw?.trim().toUpperCase();
  return s === "PAGI" || s === "PETANG" ? s : null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const kodSekolah = searchParams.get("kodSekolah")?.trim().toUpperCase() || "";
  const sesi = parseSesi(searchParams.get("sesi"));

  const defaultEntries = sesi ? getDefaultGuruBySesi(sesi) : [];
  const defaultOptions = defaultEntries.map((entry) => ({
    nama: entry.nama,
    label: formatStaffLabel(entry),
    jawatan: entry.jawatan ?? null,
    sesi,
  }));

  const byNama = new Map(
    defaultOptions.map((entry) => [entry.nama, entry])
  );

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({
      gurus: [],
      namaGuru: [...byNama.values()].map((g) => g.label),
      options: [...byNama.values()],
    });
  }

  let fromDb: {
    id: string;
    kodSekolah: string;
    namaSekolah: string | null;
    namaGuru: string;
    mataPelajaran: string | null;
    createdAt: string;
  }[] = [];

  if (kodSekolah) {
    const { data, error } = await admin
      .from("gurus")
      .select("id, kod_sekolah, nama_sekolah, nama_guru, mata_pelajaran, created_at")
      .eq("kod_sekolah", kodSekolah)
      .order("nama_guru", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    fromDb = (data ?? []).map((row) => ({
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

    for (const row of cerapanRows ?? []) {
      const nama = row.nama_guru?.trim();
      if (nama && !byNama.has(nama)) {
        byNama.set(nama, {
          nama,
          label: nama,
          jawatan: null,
          sesi,
        });
      }
    }
  }

  for (const row of fromDb) {
    if (!byNama.has(row.namaGuru)) {
      const label = row.mataPelajaran
        ? `${row.namaGuru} — ${row.mataPelajaran}`
        : row.namaGuru;
      byNama.set(row.namaGuru, {
        nama: row.namaGuru,
        label,
        jawatan: row.mataPelajaran,
        sesi,
      });
    }
  }

  const options = [...byNama.values()].sort((a, b) =>
    a.label.localeCompare(b.label, "ms")
  );

  return NextResponse.json({
    gurus: fromDb,
    namaGuru: options.map((g) => g.label),
    options,
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

export async function DELETE(request: Request) {
  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Supabase tidak dikonfigurasi" },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const id = String(body.id ?? "").trim();

  if (!id) {
    return NextResponse.json({ error: "ID guru diperlukan" }, { status: 400 });
  }

  const { error } = await admin.from("gurus").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}