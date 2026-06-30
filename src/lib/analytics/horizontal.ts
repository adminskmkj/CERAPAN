import { JENIS_ORDER, jenisCerapanLabel } from "@/lib/cerapan/jenis";
import {
  SUB_STANDARDS,
  getTaraf,
  round2,
} from "@/lib/scoring/standard4";
import type { CerapanRecord } from "@/lib/types/cerapan";

export interface AspekNilai {
  skor: number;
  pct: number;
}

export interface JenisTotalRow {
  jenis: string;
  label: string;
  cells: Record<string, AspekNilai>;
  jumlahSkor: number;
  taraf: string;
  bilRekod: number;
}

function purataJenis(
  jenis: string,
  records: CerapanRecord[]
): JenisTotalRow | null {
  if (records.length === 0) return null;

  const cells: Record<string, AspekNilai> = {};
  for (const sub of SUB_STANDARDS) {
    let sumSkor = 0;
    let sumPct = 0;
    let n = 0;
    for (const record of records) {
      const hit = record.result.subStandards.find((s) => s.code === sub.code);
      if (!hit) continue;
      sumSkor += hit.weightedScore;
      sumPct += hit.percentage;
      n += 1;
    }
    if (n > 0) {
      cells[sub.code] = {
        skor: round2(sumSkor / n),
        pct: round2(sumPct / n),
      };
    }
  }

  const jumlahSkor = round2(
    records.reduce((s, r) => s + r.result.jumlahSkor, 0) / records.length
  );

  return {
    jenis,
    label: jenisCerapanLabel(jenis).toUpperCase(),
    cells,
    jumlahSkor,
    taraf: getTaraf(jumlahSkor),
    bilRekod: records.length,
  };
}

/** Purata total ikut jenis — tanpa nama guru */
export function buildJenisTotalRows(
  records: CerapanRecord[]
): JenisTotalRow[] {
  const rows: JenisTotalRow[] = [];
  for (const jenis of JENIS_ORDER) {
    const filtered = records.filter((r) => r.sesiPengisian === jenis);
    const row = purataJenis(jenis, filtered);
    if (row) rows.push(row);
  }
  return rows;
}

export function fmt2(n: number): string {
  return n.toFixed(2);
}

/** Aspek baris 1: 4.1.1 – 4.3.1 | baris 2: 4.4.1 – 4.6.1 + jumlah & taraf */
export const ASPEK_BARIS_1 = SUB_STANDARDS.slice(0, 4);
export const ASPEK_BARIS_2 = SUB_STANDARDS.slice(4);