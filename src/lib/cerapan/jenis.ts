import {
  SESI_PENGISIAN,
  type JenisCerapan,
} from "@/lib/scoring/standard4";
import type { CerapanRecord } from "@/lib/types/cerapan";

export type { JenisCerapan };

export const JENIS_KENDIRI = SESI_PENGISIAN[0];
export const JENIS_PENCERAPAN_1 = SESI_PENGISIAN[1];
export const JENIS_PENCERAPAN_2 = SESI_PENGISIAN[2];
export const JENIS_KETUA_PANITIA = SESI_PENGISIAN[3];

export const JENIS_PENCERAPAN_ADMIN = [
  JENIS_PENCERAPAN_1,
  JENIS_PENCERAPAN_2,
] as const;

export const JENIS_PENCERAPAN_KP = [JENIS_KETUA_PANITIA] as const;

export function isKendiri(jenis: string): boolean {
  return jenis === JENIS_KENDIRI;
}

export function isPencerapanAdmin(jenis: string): boolean {
  return jenis === JENIS_PENCERAPAN_1 || jenis === JENIS_PENCERAPAN_2;
}

export function isKetuaPanitiaCerapan(jenis: string): boolean {
  return jenis === JENIS_KETUA_PANITIA;
}

export function jenisCerapanLabel(jenis: string, panitiaKp?: string): string {
  switch (jenis) {
    case JENIS_KENDIRI:
      return "Kendiri";
    case JENIS_PENCERAPAN_1:
      return "Pencerapan 1";
    case JENIS_PENCERAPAN_2:
      return "Pencerapan 2";
    case JENIS_KETUA_PANITIA:
      return panitiaKp ? `KP (${panitiaKp})` : "Ketua Panitia";
    default:
      return jenis;
  }
}

const GELARAN_PREFIX =
  /^(?:TN|EN|CIK|PUAN|DATO|DATUK|DR|PROF|IR|HJ|HAJI|HAJAH)\s+/i;

/** Buang gelaran & suffix jawatan (cth. " — GBK") untuk padanan nama. */
export function normalizeNamaGuru(nama: string): string {
  let n = nama.trim();
  const dashIdx = n.indexOf(" — ");
  if (dashIdx > 0) n = n.slice(0, dashIdx);
  n = n.toUpperCase().replace(/\s+/g, " ");
  while (GELARAN_PREFIX.test(n)) {
    n = n.replace(GELARAN_PREFIX, "").trim();
  }
  return n;
}

/** Kunci longgar — abaikan BIN/BINTI/BT untuk padanan nama ringkas vs penuh. */
export function namaGuruMatchKey(nama: string): string {
  return normalizeNamaGuru(nama)
    .replace(/\b(BIN|BINTI|BT|BTE|B\.)\b/g, " ")
    .replace(/@/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function namaTokens(nama: string): string[] {
  return namaGuruMatchKey(nama).split(" ").filter(Boolean);
}

/** Sama orang walaupun nama pendek / berbeza format (cth. KHASNOR vs KHASNOR BINTI KAMDI). */
export function namesReferToSameGuru(a: string, b: string): boolean {
  const na = normalizeNamaGuru(a);
  const nb = normalizeNamaGuru(b);
  if (na === nb) return true;

  const ka = namaGuruMatchKey(a);
  const kb = namaGuruMatchKey(b);
  if (ka === kb) return true;

  const short = ka.length <= kb.length ? ka : kb;
  const long = ka.length > kb.length ? ka : kb;
  if (short.length >= 4 && (long === short || long.startsWith(`${short} `))) {
    return true;
  }

  const tokensA = namaTokens(a);
  const tokensB = namaTokens(b);
  if (tokensA.length === 0 || tokensB.length === 0) return false;

  if (tokensA[0] === tokensB[0]) {
    const lastA = tokensA[tokensA.length - 1];
    const lastB = tokensB[tokensB.length - 1];
    if (lastA.length >= 4 && lastB.length >= 4 && lastA === lastB) {
      return true;
    }
  }

  return false;
}

export const JENIS_ORDER = [
  JENIS_KENDIRI,
  JENIS_PENCERAPAN_1,
  JENIS_PENCERAPAN_2,
  JENIS_KETUA_PANITIA,
] as const;

export interface GuruCerapanGroup {
  key: string;
  namaGuru: string;
  records: CerapanRecord[];
  byJenis: Partial<Record<string, CerapanRecord>>;
  /** Beberapa rekod KP (satu per panitia) */
  kpByPanitia: CerapanRecord[];
}

export function recordsForJenisInGroup(
  group: GuruCerapanGroup,
  jenisKey: string
): CerapanRecord[] {
  if (isKetuaPanitiaCerapan(jenisKey)) {
    if (group.kpByPanitia.length > 0) return group.kpByPanitia;
    const one = group.byJenis[jenisKey];
    return one ? [one] : [];
  }
  const one = group.byJenis[jenisKey];
  return one ? [one] : [];
}

export function groupCerapanByGuru(
  records: CerapanRecord[]
): GuruCerapanGroup[] {
  const map = new Map<string, GuruCerapanGroup>();

  for (const record of records) {
    const key = normalizeNamaGuru(record.namaGuru);
    const existing = map.get(key);
    if (existing) {
      existing.records.push(record);
      if (isKetuaPanitiaCerapan(record.sesiPengisian)) {
        existing.kpByPanitia.push(record);
      }
      if (!existing.byJenis[record.sesiPengisian]) {
        existing.byJenis[record.sesiPengisian] = record;
      } else if (!isKetuaPanitiaCerapan(record.sesiPengisian)) {
        existing.byJenis[record.sesiPengisian] = record;
      }
    } else {
      const kpByPanitia = isKetuaPanitiaCerapan(record.sesiPengisian)
        ? [record]
        : [];
      const byJenis: Partial<Record<string, CerapanRecord>> = {
        [record.sesiPengisian]: record,
      };
      map.set(key, {
        key,
        namaGuru: record.namaGuru,
        records: [record],
        byJenis,
        kpByPanitia,
      });
    }
  }

  for (const group of map.values()) {
    group.kpByPanitia.sort((a, b) =>
      (a.panitiaKp ?? "").localeCompare(b.panitiaKp ?? "", "ms")
    );
  }

  return [...map.values()].sort((a, b) =>
    a.namaGuru.localeCompare(b.namaGuru, "ms")
  );
}

export function jenisOrderForFilter(filter: string): readonly string[] {
  if (filter && JENIS_ORDER.includes(filter as (typeof JENIS_ORDER)[number])) {
    return [filter];
  }
  return JENIS_ORDER;
}

export interface SenaraiEmptyState {
  message: string;
  hint?: string;
  action?: { href: string; label: string };
}

export function getSenaraiEmptyState(
  filter: string,
  opts: { isPentadbir: boolean; isKetuaPanitia: boolean }
): SenaraiEmptyState {
  const { isPentadbir, isKetuaPanitia } = opts;
  switch (filter) {
    case JENIS_KENDIRI:
      return {
        message: "Tiada rekod pencerapan kendiri lagi.",
        action: {
          href: "/cerapan/kendiri",
          label: "Mula pencerapan kendiri →",
        },
      };
    case JENIS_PENCERAPAN_1:
      return {
        message: "Tiada rekod pencerapan pertama lagi.",
        hint:
          "Borang sama dengan Pencerapan 2 — pentadbir yang isi; guru hanya lihat markah.",
        action: isPentadbir
          ? {
              href: "/cerapan/baharu",
              label: "Isi pencerapan pentadbir →",
            }
          : undefined,
      };
    case JENIS_PENCERAPAN_2:
      return {
        message: "Tiada rekod pencerapan kedua lagi.",
        hint:
          "Borang sama dengan Pencerapan 1 — pentadbir yang isi; guru hanya lihat markah.",
        action: isPentadbir
          ? {
              href: "/cerapan/baharu",
              label: "Isi pencerapan pentadbir →",
            }
          : undefined,
      };
    case JENIS_KETUA_PANITIA:
      return {
        message: "Tiada rekod pencerapan ketua panitia lagi.",
        hint: "Ketua panitia mengisi pencerapan dalam panitia masing-masing.",
        action:
          isPentadbir || isKetuaPanitia
            ? {
                href: "/cerapan/baharu",
                label: "Isi pencerapan (jenis KP) →",
              }
            : undefined,
      };
    default:
      return {
        message: "Tiada rekod lagi.",
        hint:
          "Guru: isi Kendiri sahaja. Pencerapan 1 & 2 (borang sama) diisi pentadbir. KP: ketua panitia.",
        action: {
          href: "/cerapan/kendiri",
          label: "Mula pencerapan kendiri →",
        },
      };
  }
}

export function jenisCerapanBadgeClass(jenis: string): string {
  switch (jenis) {
    case JENIS_KENDIRI:
      return "border-sky-200 bg-sky-50 text-sky-800";
    case JENIS_PENCERAPAN_1:
      return "border-violet-200 bg-violet-50 text-violet-800";
    case JENIS_PENCERAPAN_2:
      return "border-amber-200 bg-amber-50 text-amber-900";
    case JENIS_KETUA_PANITIA:
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    default:
      return "border-stone bg-stone-2 text-ink-2";
  }
}