import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/lib/auth/types";
import { canManageGuru, canReadGuru } from "@/lib/auth/permissions";

export const runtime = "nodejs";

async function getCallerProfile() {
  const supabase = await createClient();
  const admin = createAdminClient();
  if (!supabase || !admin) return { error: "Supabase tidak dikonfigurasi", status: 503 };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tidak log masuk", status: 401 };

  const { data: profile } = await admin
    .from("profiles")
    .select("id, role, school_id")
    .eq("id", user.id)
    .single();

  if (!profile) return { error: "Profil tidak dijumpai", status: 404 };

  return { admin, user, profile };
}

export async function GET(request: Request) {
  const ctx = await getCallerProfile();
  if ("error" in ctx) {
    return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  }

  const role = ctx.profile.role as UserRole;
  if (!canReadGuru(role)) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  let kodSekolah = searchParams.get("kodSekolah")?.trim().toUpperCase() || "";

  if (!kodSekolah && role === "school_admin" && ctx.profile.school_id) {
    const { data: school } = await ctx.admin
      .from("schools")
      .select("kod_sekolah")
      .eq("id", ctx.profile.school_id)
      .maybeSingle();
    kodSekolah = school?.kod_sekolah?.toUpperCase() ?? "";
  }

  if (!kodSekolah && role !== "jpn_admin" && role !== "ppd_admin") {
    return NextResponse.json({ error: "kodSekolah diperlukan" }, { status: 400 });
  }

  if (kodSekolah && role === "school_admin" && ctx.profile.school_id) {
    const { data: school } = await ctx.admin
      .from("schools")
      .select("kod_sekolah")
      .eq("id", ctx.profile.school_id)
      .maybeSingle();

    if (school?.kod_sekolah && school.kod_sekolah.toUpperCase() !== kodSekolah) {
      return NextResponse.json({ error: "Akses ditolak untuk sekolah ini" }, { status: 403 });
    }
  }

  let query = ctx.admin
    .from("gurus")
    .select("id, kod_sekolah, nama_sekolah, nama_guru, mata_pelajaran, created_at")
    .order("kod_sekolah", { ascending: true })
    .order("nama_guru", { ascending: true });

  if (kodSekolah) {
    query = query.eq("kod_sekolah", kodSekolah);
  }

  const { data, error } = await query;

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

  let mergedNames = fromDb.map((g) => g.namaGuru);

  if (kodSekolah) {
    const { data: cerapanRows } = await ctx.admin
      .from("cerapan")
      .select("nama_guru")
      .eq("kod_sekolah", kodSekolah);

    const fromCerapan = [
      ...new Set((cerapanRows ?? []).map((r) => r.nama_guru.trim()).filter(Boolean)),
    ];

    mergedNames = [...new Set([...mergedNames, ...fromCerapan])].sort((a, b) =>
      a.localeCompare(b, "ms")
    );
  }

  return NextResponse.json({
    gurus: fromDb,
    namaGuru: mergedNames,
  });
}

export async function POST(request: Request) {
  const ctx = await getCallerProfile();
  if ("error" in ctx) {
    return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  }

  const role = ctx.profile.role as UserRole;
  if (!canManageGuru(role) && role !== "cerap_officer") {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
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

  if (role === "school_admin" && ctx.profile.school_id) {
    const { data: school } = await ctx.admin
      .from("schools")
      .select("kod_sekolah")
      .eq("id", ctx.profile.school_id)
      .maybeSingle();

    if (school?.kod_sekolah && school.kod_sekolah.toUpperCase() !== kodSekolah) {
      return NextResponse.json({ error: "Akses ditolak untuk sekolah ini" }, { status: 403 });
    }
  }

  let schoolId: string | null = ctx.profile.school_id ?? null;
  if (!schoolId) {
    const { data: school } = await ctx.admin
      .from("schools")
      .select("id")
      .eq("kod_sekolah", kodSekolah)
      .maybeSingle();
    schoolId = school?.id ?? null;
  }

  const { data, error } = await ctx.admin
    .from("gurus")
    .upsert(
      {
        school_id: schoolId,
        kod_sekolah: kodSekolah,
        nama_sekolah: namaSekolah,
        nama_guru: namaGuru,
        mata_pelajaran: mataPelajaran,
        created_by: ctx.user.id,
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