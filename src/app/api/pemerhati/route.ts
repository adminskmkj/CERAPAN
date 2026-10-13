import { NextResponse } from "next/server";
import {
  SENARAI_PEMERHATI,
  formatStaffLabel,
} from "@/lib/data/senarai-smkjs";

export const runtime = "nodejs";

export async function GET() {
  const pemerhati = SENARAI_PEMERHATI.map((entry) => ({
    nama: entry.nama,
    label: formatStaffLabel(entry),
    jawatan: entry.jawatan ?? null,
  }));

  return NextResponse.json({ pemerhati });
}