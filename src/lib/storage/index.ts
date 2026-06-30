import { isCloudEnabled } from "@/lib/supabase/cloud";
import type { CerapanRecord } from "@/lib/types/cerapan";
import type { InputValue } from "@/lib/scoring/standard4";
import * as local from "./cerapan-store";
import * as remote from "./cerapan-supabase";

export type SaveCerapanInput = Omit<
  CerapanRecord,
  "id" | "createdAt" | "updatedAt" | "result"
> & { id?: string };

export async function useCloudStorage(): Promise<boolean> {
  return isCloudEnabled();
}

export async function listCerapan(): Promise<CerapanRecord[]> {
  if (await isCloudEnabled()) {
    const res = await fetch("/api/cerapan");
    if (res.ok) return res.json();
  }
  return local.listCerapan();
}

export async function getCerapan(id: string): Promise<CerapanRecord | null> {
  if (await isCloudEnabled()) {
    const res = await fetch(`/api/cerapan/${id}`);
    if (res.ok) return res.json();
    if (res.status === 404) return null;
  }
  return local.getCerapan(id);
}

export async function saveCerapan(data: SaveCerapanInput): Promise<CerapanRecord> {
  if (await isCloudEnabled()) {
    const res = await fetch("/api/cerapan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Gagal menyimpan");
    return json;
  }
  return local.saveCerapan(data);
}

export async function deleteCerapan(id: string): Promise<void> {
  if (await isCloudEnabled()) {
    const res = await fetch(`/api/cerapan/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error ?? "Gagal memadam");
    }
    return;
  }
  local.deleteCerapan(id);
}

export async function searchCerapan(query: {
  namaGuru?: string;
  kodSekolah?: string;
  taraf?: string;
  sesiPengisian?: string;
}): Promise<CerapanRecord[]> {
  const all = await listCerapan();
  return remote.searchCerapanRecords(all, query);
}

export function ensureScores(
  scores: Record<string, InputValue | undefined>
): Record<string, InputValue> {
  return Object.fromEntries(
    Object.entries(scores).map(([k, v]) => [k, (v ?? 1) as InputValue])
  ) as Record<string, InputValue>;
}