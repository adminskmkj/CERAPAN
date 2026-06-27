import { isCloudEnabled } from "@/lib/supabase/cloud";
import { listCerapan } from "@/lib/storage";

const KEY = "senarai_guru";

function readMap(): Record<string, string[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, string[]>) : {};
  } catch {
    return {};
  }
}

function writeMap(map: Record<string, string[]>) {
  localStorage.setItem(KEY, JSON.stringify(map));
}

export interface GuruRow {
  id: string;
  kodSekolah: string;
  namaSekolah: string | null;
  namaGuru: string;
  mataPelajaran: string | null;
  createdAt: string;
}

export async function getSenaraiGuru(kodSekolah: string): Promise<string[]> {
  const kod = kodSekolah.trim().toUpperCase();
  if (!kod) return [];

  if (await isCloudEnabled()) {
    try {
      const res = await fetch(`/api/guru?kodSekolah=${encodeURIComponent(kod)}`);
      if (res.ok) {
        const json = await res.json();
        return json.namaGuru ?? [];
      }
    } catch {
      /* fallback local */
    }
  }

  const fromStore = readMap()[kod] ?? [];
  const records = await listCerapan();
  const fromHistory = records
    .filter((r) => r.kodSekolah.toUpperCase() === kod)
    .map((r) => r.namaGuru.trim())
    .filter(Boolean);

  return [...new Set([...fromStore, ...fromHistory])].sort((a, b) =>
    a.localeCompare(b, "ms")
  );
}

export async function listGuruRows(kodSekolah?: string): Promise<GuruRow[]> {
  if (!(await isCloudEnabled())) return [];

  const qs = kodSekolah
    ? `?kodSekolah=${encodeURIComponent(kodSekolah.trim().toUpperCase())}`
    : "";
  const res = await fetch(`/api/guru${qs}`);
  if (!res.ok) return [];
  const json = await res.json();
  return json.gurus ?? [];
}

export async function tambahGuru(
  kodSekolah: string,
  namaGuru: string,
  options?: { namaSekolah?: string; mataPelajaran?: string }
): Promise<void> {
  const kod = kodSekolah.trim().toUpperCase();
  const nama = namaGuru.trim();
  if (!kod || !nama) return;

  if (await isCloudEnabled()) {
    await fetch("/api/guru", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kodSekolah: kod,
        namaGuru: nama,
        namaSekolah: options?.namaSekolah,
        mataPelajaran: options?.mataPelajaran,
      }),
    });
    return;
  }

  const map = readMap();
  const list = map[kod] ?? [];
  if (!list.includes(nama)) {
    map[kod] = [...list, nama].sort((a, b) => a.localeCompare(b, "ms"));
    writeMap(map);
  }
}

export async function padamGuru(id: string): Promise<{ error?: string }> {
  const res = await fetch(`/api/guru/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const json = await res.json();
    return { error: json.error ?? "Gagal memadam" };
  }
  return {};
}