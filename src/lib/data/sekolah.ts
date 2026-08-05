import type { SesiGuru } from "@/lib/data/senarai-smkjs";

export const KOD_SEKOLAH = "JBA1010";
export const NAMA_SEKOLAH = "SK MOHD KHIR JOHARI";

export const NAMA_KELAS = [
  "Al-Razi",
  "Al-Farabi",
  "Al-Jazari",
  "Ibn-Khaldun",
  "Ibn-Batutah",
  "Ibn-Sina",
] as const;

export const NAMA_KELAS_PRA = [
  "PRA AMAN",
  "PRA DAMAI",
  "PRA HARMONI",
  "PRA MAKMUR",
  "PRA SEJAHTERA",
  "PRA SENTOSA",
] as const;

/** Nilai Tahun untuk Program Pendidikan Khas / PRA Sekolah (bukan 1-6). */
export const TAHUN_PRA = "PRA" as const;

export const TAHUN_SESI_PAGI = [4, 5, 6] as const;
export const TAHUN_SESI_PETANG = [1, 2, 3] as const;

export function getTahunBySesi(sesi: SesiGuru): readonly number[] {
  return sesi === "PAGI" ? TAHUN_SESI_PAGI : TAHUN_SESI_PETANG;
}

export function formatKelas(tahun: number | string, namaKelas: string): string {
  if (String(tahun) === TAHUN_PRA) {
    return `PRA Sekolah · ${namaKelas}`;
  }
  return `Tahun ${tahun} · ${namaKelas}`;
}

export function parseKelas(
  kelas: string
): { tahun: number; namaKelas: string; isPRA: boolean } | null {
  const pra = kelas.match(/^PRA Sekolah\s*·\s*(.+)$/i);
  if (pra) {
    return { tahun: NaN, namaKelas: pra[1].trim(), isPRA: true };
  }
  const match = kelas.match(/^Tahun\s+(\d)\s*·\s*(.+)$/);
  if (!match) return null;
  return { tahun: Number(match[1]), namaKelas: match[2].trim(), isPRA: false };
}