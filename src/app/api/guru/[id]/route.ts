import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/lib/auth/types";
import { canManageGuru } from "@/lib/auth/permissions";

export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  const { data: profile } = await admin
    .from("profiles")
    .select("role, school_id")
    .eq("id", user.id)
    .single();

  if (!profile || !canManageGuru(profile.role as UserRole)) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  const { data: guru } = await admin
    .from("gurus")
    .select("id, kod_sekolah, school_id")
    .eq("id", id)
    .maybeSingle();

  if (!guru) {
    return NextResponse.json({ error: "Guru tidak dijumpai" }, { status: 404 });
  }

  if (profile.role === "school_admin" && profile.school_id) {
    if (guru.school_id && guru.school_id !== profile.school_id) {
      const { data: school } = await admin
        .from("schools")
        .select("kod_sekolah")
        .eq("id", profile.school_id)
        .maybeSingle();

      if (school?.kod_sekolah?.toUpperCase() !== guru.kod_sekolah.toUpperCase()) {
        return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
      }
    }
  }

  const { error } = await admin.from("gurus").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}