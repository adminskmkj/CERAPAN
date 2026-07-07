import {
  LEGACY_SESI_KETUA_PANITIA,
  SESI_PENGISIAN,
  type JenisCerapan,
} from "@/lib/scoring/standard4";
import type { CerapanRecord } from "@/lib/types/cerapan";

export type { JenisCerapan };

export const JENIS_KENDIRI = SESI_PENGISIAN[0];
export const JENIS_PENCERAPAN_1 = SESI_PENGISIAN[1];
export const JENIS_PENCERAPAN_2 = SESI_PENGISIAN[2];

/** @deprecated Rekod lama — dinormalkan ke Pencerapan 1 bila dibaca */
export const LEGACY_JENIS_KETUA_PANITIA = LEGACY_SESI_KETUA_PANITIA;

export const JENIS_PENCERAPAN_ADMIN = [
  JENIS_PENCERAPAN_1,
  JENIS_PENCERAPAN_2,
] as const;

export function isKendiri(jenis: string): boolean {
  return jenis === JENIS_KENDIRI;
}

export function isPencerapanAdmin(jenis: string): boolean {
  return (
    jenis === JENIS_PENCERAPAN_1 ||
    jenis === JENIS_PENCERAPAN_2 ||
    jenis === LEGACY_JENIS_KETUA_PANITIA
  );
}

export function isLegacyKetuaPanitiaCerapan(jenis: string): boolean {
  return jenis === LEGACY_JENIS_KETUA_PANITIA;
}

/** @deprecated Guna isLegacyKetuaPanitiaCerapan */
export const isKetuaPanitiaCerapan = isLegacyKetuaPanitiaCerapan;

/** P1/P2 untuk paparan & statistik — rekod KP lama → P1 */
export function effectiveSesiPengisian(sesi: string): string {
  if (sesi === LEGACY_JENIS_KETUA_PANITIA) return JENIS_PENCERAPAN_1;
  return sesi;
}

export function normalizeCerapanRecord(record: CerapanRecord): CerapanRecord {
  const sesi = effectiveSesiPengisian(record.sesiPengisian);
  if (sesi === record.sesiPengisian) return record;
  return { ...record, sesiPengisian: sesi };
}

export function formatPencerapKp(nama: string, panitia: string): string {
  const n = nama.trim();
  const p = panitia.trim();
  if (!n) return "";
  return p ? `${n} — Ketua Panitia ${p}` : n;
}

export function jenisCerapanLabel(jenis: string): string {
  switch (effectiveSesiPengisian(jenis)) {
    case JENIS_KENDIRI:
      return "Kendiri";
    case JENIS_PENCERAPAN_1:
      return "Pencerapan 1";
    case JENIS_PENCERAPAN_2:
      return "Pencerapan 2";
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
] as const;

export interface GuruCerapanGroup {
  key: string;
  namaGuru: string;
  records: CerapanRecord[];
}

export function recordsForJenisInGroup(
  group: GuruCerapanGroup,
  jenisKey: string
): CerapanRecord[] {
  return group.records
    .filter((r) => effectiveSesiPengisian(r.sesiPengisian) === jenisKey)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
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
    } else {
      map.set(key, {
        key,
        namaGuru: record.namaGuru,
        records: [record],
      });
    }
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
  const isStaff = isPentadbir || isKetuaPanitia;
  switch (effectiveSesiPengisian(filter)) {
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
          "Pentadbir atau ketua panitia boleh isi — guru yang sama boleh ada lebih daripada satu rekod jika pencerap berbeza (cth. GB & KP).",
        action: isStaff
          ? {
              href: "/cerapan/baharu",
              label: "Isi pencerapan →",
            }
          : undefined,
      };
    case JENIS_PENCERAPAN_2:
      return {
        message: "Tiada rekod pencerapan kedua lagi.",
        hint:
          "Pentadbir atau ketua panitia boleh isi — guru yang sama boleh ada lebih daripada satu rekod jika pencerap berbeza.",
        action: isStaff
          ? {
              href: "/cerapan/baharu",
              label: "Isi pencerapan →",
            }
          : undefined,
      };
    default:
      return {
        message: "Tiada rekod lagi.",
        hint:
          "Guru: isi Kendiri sahaja. Pencerapan 1 & 2 diisi pentadbir atau ketua panitia (ikut pusingan).",
        action: {
          href: "/cerapan/kendiri",
          label: "Mula pencerapan kendiri →",
        },
      };
  }
}

export function jenisCerapanBadgeClass(jenis: string): string {
  switch (effectiveSesiPengisian(jenis)) {
    case JENIS_KENDIRI:
      return "border-sky-200 bg-sky-50 text-sky-800";
    case JENIS_PENCERAPAN_1:
      return "border-violet-200 bg-violet-50 text-violet-800";
    case JENIS_PENCERAPAN_2:
      return "border-amber-200 bg-amber-50 text-amber-900";
    default:
      return "border-stone bg-stone-2 text-ink-2";
  }
}