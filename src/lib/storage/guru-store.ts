import { isCloudEnabled } from "@/lib/supabase/cloud";
import { listCerapan } from "@/lib/storage";
import {
  type SesiGuru,
  getDefaultGuruLabels,
} from "@/lib/data/senarai-smkjs";

const KEY = "senarai_guru";

export interface GuruOption {
  nama: string;
  label: string;
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

  try {
    const records = await listCerapan();
    for (const r of records) {
      if (kod && r.kodSekolah.toUpperCase() !== kod) continue;
      const nama = r.namaGuru.trim();
      if (nama && !byNama.has(nama)) byNama.set(nama, { nama, label: nama });
    }
  } catch {
    /* abaikan */
  }

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