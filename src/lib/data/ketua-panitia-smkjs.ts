/**
 * Ketua Panitia SMKJS — panitia, nama, & e-mel cadangan untuk Supabase Auth.
 */

import { KP_CERAPAN_EMAIL_DOMAIN } from "@/lib/auth/constants";

export type KetuaPanitiaSmkjsEntry = {
  panitia: string;
  nama: string;
  /** Nama subjek dalam e-mel: {emailSlug}.skmkj@edu.my */
  emailSlug: string;
};

export const SENARAI_KETUA_PANITIA_SMKJS: KetuaPanitiaSmkjsEntry[] = [
  {
    panitia: "BAHASA MELAYU",
    nama: "NURUL SHAFINA BINTI HAMEDI",
    emailSlug: "bm",
  },
  {
    panitia: "BAHASA INGGERIS",
    nama: "CHRISTOPHER LIM TSE ZHERN",
    emailSlug: "bi",
  },
  { panitia: "MATEMATIK", nama: "SARINAH BINTI SHAWAL", emailSlug: "mate" },
  { panitia: "SAINS", nama: "LUTFI BIN ISNIN", emailSlug: "sains" },
  {
    panitia: "PENDIDIKAN ISLAM",
    nama: "ABDUL RAHMAN BIN MOHAMED",
    emailSlug: "pi",
  },
  { panitia: "BAHASA ARAB", nama: "ABDULLAH BIN MASTOR", emailSlug: "arab" },
  { panitia: "PJPK", nama: "ZAINAB BINTI ALI", emailSlug: "pjpk" },
  {
    panitia: "MUZIK",
    nama: "MUHAMMAD AMIR ASYRAF BIN ROSLI",
    emailSlug: "muzik",
  },
  {
    panitia: "SEJARAH",
    nama: "MOHD RIDHWAN BIN HAJI OTHMAN",
    emailSlug: "sj",
  },
  { panitia: "RBT", nama: "MOHAMAD HAIZAR BIN SUROR", emailSlug: "rbt" },
  {
    panitia: "SENI VISUAL",
    nama: "MUHAMMAD AKIF NASRIN BIN MOHAMAD NASIR",
    emailSlug: "psv",
  },
];

/** Satu e-mel per subjek: `bm.skmkj@edu.my`, `bi.skmkj@edu.my`, … */
export function suggestedKpEmail(
  subjekSlug: string,
  domain: string = KP_CERAPAN_EMAIL_DOMAIN
): string {
  const local = subjekSlug.trim().toLowerCase().replace(/[^a-z0-9.-]/g, "");
  const host = domain.trim().toLowerCase();
  if (!local || !host) return `${subjekSlug}@example.com`;
  return `${local}@${host}`;
}

export function emailCadanganKp(entry: KetuaPanitiaSmkjsEntry): string {
  return suggestedKpEmail(entry.emailSlug);
}

export function normalizeNamaKp(nama: string): string {
  return nama.trim().toUpperCase().replace(/\s+/g, " ");
}

export function findKpByPanitia(panitia: string): KetuaPanitiaSmkjsEntry | undefined {
  const key = panitia.trim().toUpperCase();
  return SENARAI_KETUA_PANITIA_SMKJS.find(
    (e) => e.panitia.toUpperCase() === key
  );
}

export function findPanitiaByNamaKp(nama: string): string | undefined {
  const n = normalizeNamaKp(nama);
  return SENARAI_KETUA_PANITIA_SMKJS.find(
    (e) => normalizeNamaKp(e.nama) === n
  )?.panitia;
}