import { isCloudEnabled } from "@/lib/supabase/cloud";
import {
  type SesiGuru,
  getDefaultGuruLabels,
  getDefaultGuruBySesi,
  formatStaffLabel,
} from "@/lib/data/senarai-smkjs";

const KEY = "senarai_guru";

export interface GuruOption {
  nama: string;
  label: string;
}

/**
 * Senarai guru statik (senarai rasmi sekolah) — boleh dipanggil serta-merta
 * tanpa network supaya dropdown "Nama Guru" tidak kosong semasa API lambat.
 */
export function getSenaraiGuruDefaultSync(sesi: SesiGuru): GuruOption[] {
  return getDefaultGuruBySesi(sesi).map((entry) => ({
    nama: entry.nama,
    label: formatStaffLabel(entry),
  }));
}

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

export async function getSenaraiGuruOptions(
  kodSekolah: string,
  sesi: SesiGuru
): Promise<GuruOption[]> {
  const kod = kodSekolah.trim().toUpperCase();
  const byNama = new Map<string, GuruOption>();

  for (const label of getDefaultGuruLabels(sesi)) {
    const nama = label.split(" — ")[0];
    byNama.set(nama, { nama, label });
  }

  if (kod && (await isCloudEnabled())) {
    try {
      const qs = new URLSearchParams({
        kodSekolah: kod,
        sesi,
      });
      const res = await fetch(`/api/guru?${qs}`);
      if (res.ok) {
        const json = await res.json();
        for (const item of json.options ?? []) {
          if (item?.nama) {
            byNama.set(item.nama, {
              nama: item.nama,
              label: item.label ?? item.nama,
            });
          }
        }
        for (const label of json.namaGuru ?? []) {
          if (typeof label === "string") {
            const nama = label.split(" — ")[0];
            if (!byNama.has(nama)) byNama.set(nama, { nama, label });
          }
        }
      }
    } catch {
      /* gabung dengan sumber tempatan di bawah */
    }
  }

  const fromStore = kod ? (readMap()[kod] ?? []) : [];
  for (const nama of fromStore) {
    if (!byNama.has(nama)) byNama.set(nama, { nama, label: nama });
  }

  // NOTA: jangan panggil listCerapan() di sini — ia lambat (query penuh) dan
  // menyebabkan dropdown "Nama Guru" kosong sehingga selesai. /api/guru sudah
  // gabungkan nama guru dari jadual cerapan di sebelah server.

  return [...byNama.values()].sort((a, b) =>
    a.label.localeCompare(b.label, "ms")
  );
}

export async function getSenaraiGuru(
  kodSekolah: string,
  sesi: SesiGuru = "PAGI"
): Promise<string[]> {
  const options = await getSenaraiGuruOptions(kodSekolah, sesi);
  return options.map((o) => o.label);
}

export async function padamGuru(id: string): Promise<void> {
  if (!id?.trim()) return;

  if (await isCloudEnabled()) {
    await fetch(`/api/guru`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    return;
  }

  const map = readMap();
  for (const kod of Object.keys(map)) {
    map[kod] = map[kod].filter((n) => n !== id);
  }
  writeMap(map);
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