import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  SENARAI_PEMERHATI,
  formatStaffLabel,
} from "@/lib/data/senarai-smkjs";

export const runtime = "nodejs";

export async function GET() {
  const defaults = SENARAI_PEMERHATI.map((entry) => ({
    nama: entry.nama,
    label: formatStaffLabel(entry),
    jawatan: entry.jawatan ?? null,
  }));

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ pemerhati: defaults });
  }

  const { data, error } = await admin
    .from("cerapan")
    .select("nama_pemerhati")
    .not("nama_pemerhati", "is", null)
    .not("nama_pemerhati", "eq", "");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const fromDb = (data ?? [])
    .map((r: { nama_pemerhati: string | null }) => r.nama_pemerhati?.trim())
    .filter((n): n is string => !!n);

  const defaultNames = new Set(defaults.map((d) => d.nama));
  const extra = fromDb
    .filter((n) => !defaultNames.has(n))
    .map((nama) => ({ nama, label: nama, jawatan: null }));

  const pemerhati = [...defaults, ...extra].sort((a, b) =>
    a.label.localeCompare(b.label, "ms")
  );

  return NextResponse.json({ pemerhati });
}