import {
  effectiveSesiPengisian,
  namesReferToSameGuru,
} from "@/lib/cerapan/jenis";
import { isTestCerapanRecord } from "@/lib/cerapan/test-data";
import {
  getDefaultGuruBySesi,
} from "@/lib/data/senarai-smkjs";
import { parseKelas } from "@/lib/data/sekolah";
import {
  SUB_STANDARDS,
  round2,
  type Taraf,
} from "@/lib/scoring/standard4";
import type { CerapanRecord } from "@/lib/types/cerapan";

export const DOMAIN_ASPEK = ["4.1", "4.2", "4.3", "4.4", "4.5"] as const;
export type DomainAspek = (typeof DOMAIN_ASPEK)[number];

export interface PrintLaporanRow {
  namaGuru: string;
  kelas: string;
  mataPelajaran: string;
  namaPentadbir: string;
  domainPct: Record<DomainAspek, number | null>;
  status: Taraf | null;
  hasRecord: boolean;
}

const WEIGHT_BY_CODE = Object.fromEntries(
  SUB_STANDARDS.map((s) => [s.code, s.weight])
) as Record<string, number>;

function getAllGuruNames(): string[] {
  const pagi = getDefaultGuruBySesi("PAGI");
  const petang = getDefaultGuruBySesi("PETANG");
  const seen = new Set<string>();
  const names: string[] = [];

  for (const entry of [...pagi, ...petang]) {
    if (seen.has(entry.nama)) continue;
    seen.add(entry.nama);
    names.push(entry.nama);
  }

  return names.sort((a, b) => a.localeCompare(b, "ms"));
}

export function formatKelasRingkas(kelas: string): string {
  const parsed = parseKelas(kelas);
  if (parsed) {
    return `${parsed.tahun} ${parsed.namaKelas.toUpperCase()}`;
  }
  return kelas;
}

function domainPctFromRecord(
  record: CerapanRecord,
  domain: DomainAspek
): number | null {
  const subs = record.result.subStandards.filter((s) =>
    s.code.startsWith(`${domain}.`)
  );
  if (subs.length === 0) return null;

  let weighted = 0;
  let totalWeight = 0;
  for (const sub of subs) {
    const w = WEIGHT_BY_CODE[sub.code] ?? 1;
    weighted += sub.percentage * w;
    totalWeight += w;
  }
  return totalWeight > 0 ? round2(weighted / totalWeight) : null;
}

function emptyDomainPct(): Record<DomainAspek, number | null> {
  return {
    "4.1": null,
    "4.2": null,
    "4.3": null,
    "4.4": null,
    "4.5": null,
  };
}

function rowFromRecord(
  record: CerapanRecord,
  displayNama: string
): PrintLaporanRow {
  const domainPct = emptyDomainPct();
  for (const domain of DOMAIN_ASPEK) {
    domainPct[domain] = domainPctFromRecord(record, domain);
  }

  return {
    namaGuru: displayNama,
    kelas: formatKelasRingkas(record.kelas),
    mataPelajaran: record.mataPelajaran,
    namaPentadbir: record.namaPemerhati?.trim() || "—",
    domainPct,
    status: record.result.taraf,
    hasRecord: true,
  };
}

function emptyRow(nama: string): PrintLaporanRow {
  return {
    namaGuru: nama,
    kelas: "—",
    mataPelajaran: "—",
    namaPentadbir: "—",
    domainPct: emptyDomainPct(),
    status: null,
    hasRecord: false,
  };
}

export function buildPrintLaporanRows(
  records: CerapanRecord[],
  jenis: string
): PrintLaporanRow[] {
  const filtered = records.filter(
    (r) =>
      effectiveSesiPengisian(r.sesiPengisian) === jenis &&
      !isTestCerapanRecord(r)
  );
  const usedIds = new Set<string>();
  const rows: PrintLaporanRow[] = [];

  for (const nama of getAllGuruNames()) {
    const matches = filtered
      .filter(
        (r) => !usedIds.has(r.id) && namesReferToSameGuru(r.namaGuru, nama)
      )
      .sort((a, b) => a.namaGuru.localeCompare(b.namaGuru, "ms"));

    if (matches.length === 0) {
      rows.push(emptyRow(nama));
      continue;
    }

    for (const record of matches) {
      usedIds.add(record.id);
      rows.push(rowFromRecord(record, nama));
    }
  }

  const orphans = filtered
    .filter((r) => !usedIds.has(r.id))
    .sort((a, b) => a.namaGuru.localeCompare(b.namaGuru, "ms"));

  for (const record of orphans) {
    rows.push(rowFromRecord(record, record.namaGuru));
  }

  return rows;
}

export function fmtPct(n: number | null): string {
  return n === null ? "—" : `${n.toFixed(2)}%`;
}