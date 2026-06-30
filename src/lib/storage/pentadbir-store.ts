import { isCloudEnabled } from "@/lib/supabase/cloud";
import {
  getDefaultPemerhatiLabels,
  SENARAI_PEMERHATI,
} from "@/lib/data/senarai-smkjs";

const KEY = "senarai_pemerhati";

export interface PemerhatiOption {
  nama: string;
  label: string;
}

function defaultPemerhatiOptions(): PemerhatiOption[] {
  return SENARAI_PEMERHATI.map((entry) => ({
    nama: entry.nama,
    label: entry.jawatan ? `${entry.nama} — ${entry.jawatan}` : entry.nama,
  }));
}

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function write(list: string[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export async function getSenaraiPemerhatiOptions(): Promise<PemerhatiOption[]> {
  const defaults = defaultPemerhatiOptions();
  const byNama = new Map(defaults.map((d) => [d.nama, d]));

  if (await isCloudEnabled()) {
    try {
      const res = await fetch("/api/pemerhati");
      if (res.ok) {
        const json = await res.json();
        for (const item of json.pemerhati ?? []) {
          if (typeof item === "string") {
            if (!byNama.has(item)) byNama.set(item, { nama: item, label: item });
          } else if (item?.nama) {
            byNama.set(item.nama, {
              nama: item.nama,
              label: item.label ?? item.nama,
            });
          }
        }
      }
    } catch {
      /* fallback local */
    }
  }

  for (const nama of read()) {
    if (!byNama.has(nama)) byNama.set(nama, { nama, label: nama });
  }

  return [...byNama.values()].sort((a, b) =>
    a.label.localeCompare(b.label, "ms")
  );
}

export async function getSenaraiPemerhati(): Promise<string[]> {
  const options = await getSenaraiPemerhatiOptions();
  return options.map((o) => o.label);
}

/** Label paparan untuk dropdown (kekal serasi dengan kod lama) */
export function getSenaraiPemerhatiDefault(): string[] {
  return getDefaultPemerhatiLabels();
}

/** @deprecated Guna getSenaraiPemerhati */
export const getSenaraiPentadbir = getSenaraiPemerhati;

export function tambahPemerhati(nama: string): void {
  const n = nama.trim();
  if (!n) return;
  const list = read();
  if (!list.includes(n)) {
    write([...list, n].sort((a, b) => a.localeCompare(b, "ms")));
  }
}

/** @deprecated Guna tambahPemerhati */
export const tambahPentadbir = tambahPemerhati;