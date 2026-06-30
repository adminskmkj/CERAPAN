/** Normalisasi label panitia / mata pelajaran untuk perbandingan */

const ALIASES: Record<string, string[]> = {
  "BAHASA MELAYU": ["BM", "BAHASA MALAYSIA", "MALAY"],
  PSV: ["PEND. SENI VISUAL", "PENDIDIKAN SENI VISUAL", "SENI VISUAL"],
  SAINS: ["SN", "SAINS TAMBAHAN"],
  MATEMATIK: ["MATE", "MATEMATIK TAMBAHAN", "MT"],
  "PENDIDIKAN ISLAM": ["PI", "PEND ISLAM"],
  "PENDIDIKAN MORAL": ["PM", "PEND MORAL"],
  "BAHASA INGGERIS": ["BI", "ENGLISH"],
  "BAHASA ARAB": ["ARAB", "BAHASA ARAB"],
  SEJARAH: ["SJ", "HISTORY"],
  GEOGRAFI: ["GEO"],
  PJPK: ["PJ", "PENDIDIKAN JASMANI", "PEND JASMANI", "PJK", "PENDIDIKAN JASMANI DAN KESIHATAN"],
  MUZIK: ["MUSIC", "PEND MUZIK", "PENDIDIKAN MUZIK"],
  RBT: ["REKA BENTUK TEKNOLOGI", "REKA BENTUK DAN TEKNOLOGI", "RBT"],
};

export function normalizePanitia(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, " ");
}

function canonicalPanitia(normalized: string): string {
  for (const [canonical, list] of Object.entries(ALIASES)) {
    const canon = normalizePanitia(canonical);
    if (normalized === canon) return canon;
    for (const alias of list) {
      if (normalized === normalizePanitia(alias)) return canon;
    }
  }
  return normalized;
}

/** Sama panitia / MP yang diajar dalam julat KP */
export function panitiaMatchesMataPelajaran(
  panitiaKp: string,
  mataPelajaran: string
): boolean {
  const p = canonicalPanitia(normalizePanitia(panitiaKp));
  const mp = canonicalPanitia(normalizePanitia(mataPelajaran));
  if (!p || !mp) return false;
  if (p === mp) return true;
  if (mp.includes(p) || p.includes(mp)) return true;
  return false;
}

export function formatPanitiaLabel(panitia: string): string {
  const n = normalizePanitia(panitia);
  return n.length <= 4 ? n : n.charAt(0) + n.slice(1).toLowerCase();
}

/** Nilai mata pelajaran PdP lalai bila KP isi cerapan (ikut panitia profil). */
export function mataPelajaranDariPanitiaKp(panitia: string | null): string {
  if (!panitia?.trim()) return "";
  const normalized = normalizePanitia(panitia);
  const ref = canonicalPanitia(normalized);
  if (ref === "PSV" || normalized === "SENI VISUAL") {
    return "SENI VISUAL";
  }
  return ref;
}