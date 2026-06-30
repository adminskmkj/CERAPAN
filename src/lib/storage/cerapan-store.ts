import { KOD_SEKOLAH, NAMA_SEKOLAH } from "@/lib/data/sekolah";
import { findDuplicateCerapan } from "@/lib/storage/cerapan-supabase";
import type { CerapanRecord } from "@/lib/types/cerapan";
import { calculateCerapan } from "@/lib/scoring/standard4";
import type { InputValue } from "@/lib/scoring/standard4";

const STORAGE_KEY = "cerapan_records";

function readAll(): CerapanRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CerapanRecord[]) : [];
  } catch {
    return [];
  }
}

function writeAll(records: CerapanRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function listCerapan(): CerapanRecord[] {
  return readAll().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getCerapan(id: string): CerapanRecord | null {
  return readAll().find((r) => r.id === id) ?? null;
}

export function saveCerapan(
  data: Omit<CerapanRecord, "id" | "createdAt" | "updatedAt" | "result"> & {
    id?: string;
  }
): CerapanRecord {
  const now = new Date().toISOString();
  const result = calculateCerapan(data.scores);
  const records = readAll();
  const duplicate = findDuplicateCerapan(
    records,
    data.namaGuru,
    data.sesiPengisian,
    data.id,
    data.panitiaKp
  );
  if (duplicate) {
    throw new Error(
      `Rekod ${data.sesiPengisian} untuk ${data.namaGuru} sudah wujud.`
    );
  }
  const existing = data.id ? records.find((r) => r.id === data.id) : null;

  const record: CerapanRecord = {
    ...data,
    kodSekolah: KOD_SEKOLAH,
    namaSekolah: NAMA_SEKOLAH,
    id: existing?.id ?? crypto.randomUUID(),
    result,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  if (existing) {
    writeAll(records.map((r) => (r.id === record.id ? record : r)));
  } else {
    writeAll([record, ...records]);
  }

  return record;
}

export function deleteCerapan(id: string): void {
  writeAll(readAll().filter((r) => r.id !== id));
}

export function searchCerapan(query: {
  namaGuru?: string;
  kodSekolah?: string;
  taraf?: string;
}): CerapanRecord[] {
  const q = {
    namaGuru: query.namaGuru?.toLowerCase() ?? "",
    kodSekolah: query.kodSekolah?.toLowerCase() ?? "",
    taraf: query.taraf ?? "",
  };

  return listCerapan().filter((r) => {
    if (q.namaGuru && !r.namaGuru.toLowerCase().includes(q.namaGuru)) return false;
    if (q.kodSekolah && !r.kodSekolah.toLowerCase().includes(q.kodSekolah)) return false;
    if (q.taraf && r.result.taraf !== q.taraf) return false;
    return true;
  });
}

export function defaultScores(): Record<string, InputValue> {
  const scores: Record<string, InputValue> = {};
  return scores;
}