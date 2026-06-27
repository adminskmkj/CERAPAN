import { isCloudEnabled } from "@/lib/supabase/cloud";

const KEY = "senarai_pemerhati";

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

export async function getSenaraiPemerhati(): Promise<string[]> {
  const cloud: string[] = [];
  if (await isCloudEnabled()) {
    try {
      const res = await fetch("/api/pemerhati");
      if (res.ok) {
        const json = await res.json();
        cloud.push(...(json.pemerhati ?? []));
      }
    } catch {
      /* fallback local */
    }
  }

  return [...new Set([...cloud, ...read()])].sort((a, b) =>
    a.localeCompare(b, "ms")
  );
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