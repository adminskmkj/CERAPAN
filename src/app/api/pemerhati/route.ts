import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET() {
  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Supabase tidak dikonfigurasi" },
      { status: 503 }
    );
  }

  const { data, error } = await admin
    .from("cerapan")
    .select("nama_pemerhati")
    .not("nama_pemerhati", "is", null)
    .not("nama_pemerhati", "eq", "");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const names = [
    ...new Set(
      (data ?? [])
        .map((r: { nama_pemerhati: string | null }) => r.nama_pemerhati?.trim())
        .filter((n): n is string => !!n)
    ),
  ].sort((a, b) => a.localeCompare(b, "ms"));

  return NextResponse.json({ pemerhati: names });
}