import { JENIS_ORDER } from "@/lib/cerapan/jenis";
import { SUB_STANDARDS } from "@/lib/scoring/standard4";
import type { CerapanRecord } from "@/lib/types/cerapan";

export const ASPEK_LEMAH_THRESHOLD = 70;

export interface AspekCellStat {
  purataPct: number;
  count: number;
  guruLemah: { nama: string; pct: number }[];
}

export interface AspekRowStat {
  code: string;
  title: string;
  aspect: string;
  byJenis: Record<string, AspekCellStat>;
}

export interface AspekAnalytics {
  rows: AspekRowStat[];
  perhatian: {
    code: string;
    title: string;
    jenis: string;
    purataPct: number;
    guruLemah: { nama: string; pct: number }[];
  }[];
}

const EMPTY_CELL: AspekCellStat = { purataPct: 0, count: 0, guruLemah: [] };

function initCellMap(): Record<string, Record<string, { sum: number; count: number; guru: { nama: string; pct: number }[] }>> {
  const map: Record<string, Record<string, { sum: number; count: number; guru: { nama: string; pct: number }[] }>> = {};
  for (const jenis of JENIS_ORDER) {
    map[jenis] = {};
    for (const sub of SUB_STANDARDS) {
      map[jenis][sub.code] = { sum: 0, count: 0, guru: [] };
    }
  }
  return map;
}

export function computeAspekAnalytics(records: CerapanRecord[]): AspekAnalytics {
  const acc = initCellMap();

  for (const record of records) {
    const jenis = record.sesiPengisian;
    if (!acc[jenis]) continue;

    for (const sub of record.result.subStandards) {
      const bucket = acc[jenis][sub.code];
      if (!bucket) continue;
      bucket.sum += sub.percentage;
      bucket.count += 1;
      if (sub.percentage < ASPEK_LEMAH_THRESHOLD) {
        bucket.guru.push({ nama: record.namaGuru, pct: sub.percentage });
      }
    }
  }

  const rows: AspekRowStat[] = SUB_STANDARDS.map((sub) => {
    const byJenis: Record<string, AspekCellStat> = {};
    for (const jenis of JENIS_ORDER) {
      const bucket = acc[jenis][sub.code];
      if (!bucket || bucket.count === 0) {
        byJenis[jenis] = EMPTY_CELL;
        continue;
      }
      const purataPct = Math.round((bucket.sum / bucket.count) * 10) / 10;
      byJenis[jenis] = {
        purataPct,
        count: bucket.count,
        guruLemah: bucket.guru.sort((a, b) => a.pct - b.pct),
      };
    }
    return {
      code: sub.code,
      title: sub.title,
      aspect: sub.aspect,
      byJenis,
    };
  });

  const perhatian: AspekAnalytics["perhatian"] = [];
  for (const row of rows) {
    for (const jenis of JENIS_ORDER) {
      const cell = row.byJenis[jenis];
      if (cell.count === 0) continue;
      perhatian.push({
        code: row.code,
        title: row.title,
        jenis,
        purataPct: cell.purataPct,
        guruLemah: cell.guruLemah,
      });
    }
  }

  perhatian.sort((a, b) => a.purataPct - b.purataPct);

  return { rows, perhatian: perhatian.slice(0, 6) };
}

export function aspekPctColor(pct: number, hasData: boolean): string {
  if (!hasData) return "bg-stone-2/50 text-muted";
  if (pct < 55) return "bg-red-100 text-red-900";
  if (pct < ASPEK_LEMAH_THRESHOLD) return "bg-amber-100 text-amber-900";
  if (pct < 85) return "bg-sky-50 text-sky-900";
  return "bg-emerald-50 text-emerald-900";
}

/** Tahap warna ikut % aspek / jumlah skor */
export type MarkahTahap = "kosong" | "ptps" | "amaran" | "baik" | "cemerlang";

export function markahTahap(nilai: number, hasData = true): MarkahTahap {
  if (!hasData) return "kosong";
  if (nilai < 55) return "ptps";
  if (nilai < ASPEK_LEMAH_THRESHOLD) return "amaran";
  if (nilai < 85) return "baik";
  return "cemerlang";
}

export function excelHorizontalCellClass(
  pct: number,
  hasData: boolean
): string {
  const base = "excel-h-td-num";
  switch (markahTahap(pct, hasData)) {
    case "kosong":
      return `${base} excel-h--kosong`;
    case "ptps":
      return `${base} excel-h--ptps`;
    case "amaran":
      return `${base} excel-h--amaran`;
    case "baik":
      return `${base} excel-h--baik`;
    case "cemerlang":
      return `${base} excel-h--cemerlang`;
  }
}

export function excelTarafCellClass(taraf: string): string {
  switch (taraf) {
    case "CEMERLANG":
      return "excel-h-td-taraf excel-h-taraf--cemerlang";
    case "BAIK":
      return "excel-h-td-taraf excel-h-taraf--baik";
    case "SEDERHANA":
      return "excel-h-td-taraf excel-h-taraf--amaran";
    case "PERLU TINDAKAN SEGERA":
      return "excel-h-td-taraf excel-h-taraf--ptps";
    default:
      return "excel-h-td-taraf";
  }
}

export function formatGuruLemahRingkas(
  guruLemah: { nama: string; pct: number }[],
  max = 2
): string {
  if (guruLemah.length === 0) return "";
  const shown = guruLemah
    .slice(0, max)
    .map((g) => `${shortNamaGuru(g.nama)} ${g.pct}%`)
    .join(", ");
  const extra = guruLemah.length > max ? ` +${guruLemah.length - max}` : "";
  return shown + extra;
}

function shortNamaGuru(nama: string): string {
  const parts = nama.trim().split(/\s+/);
  if (parts.length <= 2) return nama;
  return `${parts[0]} ${parts[parts.length - 1]}`;
}