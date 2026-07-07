import type { CerapanResult, InputValue } from "@/lib/scoring/standard4";

export interface CerapanMeta {
  id: string;
  kodSekolah: string;
  namaSekolah: string;
  namaGuru: string;
  mataPelajaran: string;
  kelas: string;
  sesiPengisian: string;
  tarikh: string;
  kalendarAkademik: string;
  namaPemerhati?: string;
  /** Panitia KP (cth. BAHASA MELAYU) — bila rekod dicipta oleh ketua panitia */
  panitiaKp?: string;
  createdBy?: string;
  /** Dapatan pencerap mengikut kod sub-standard (cth. 4.1.1) */
  dapatanPencerap?: Record<string, string>;
  /** Langkah penambahbaikan mengikut kod sub-standard (diisi guru yang dicerap) */
  langkahPenambahbaikan?: Record<string, string>;
  /** Ulasan umum pencerapan */
  ulasanPencerapan?: string;
  /** Cadangan tarikh pemantauan tindak lanjut */
  tarikhTindakLanjut?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CerapanRecord extends CerapanMeta {
  scores: Record<string, InputValue>;
  result: CerapanResult;
}

export type CerapanFormData = Omit<
  CerapanRecord,
  "id" | "result" | "createdAt" | "updatedAt"
>;