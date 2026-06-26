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