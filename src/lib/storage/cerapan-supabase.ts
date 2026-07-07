import type { SupabaseClient } from "@supabase/supabase-js";
import { formatSupabaseError } from "@/lib/supabase/errors";
import {
  calculateCerapan,
  inputToScore,
  type InputValue,
} from "@/lib/scoring/standard4";
import {
  JENIS_ORDER,
  effectiveSesiPengisian,
  isKendiri,
  isPencerapanAdmin,
  normalizeCerapanRecord,
  normalizeNamaGuru,
} from "@/lib/cerapan/jenis";
import type { CerapanRecord } from "@/lib/types/cerapan";

interface DbCerapan {
  id: string;
  school_id: string | null;
  created_by: string | null;
  kod_sekolah: string;
  nama_sekolah: string;
  nama_guru: string;
  mata_pelajaran: string;
  kelas: string;
  sesi_pengisian: string;
  tarikh: string;
  kalendar_akademik: string;
  nama_pemerhati: string | null;
  panitia_kp: string | null;
  dapatan_pencerap: Record<string, string> | null;
  langkah_penambahbaikan: Record<string, string> | null;
  ulasan_pencerapan: string | null;
  tarikh_tindak_lanjut: string | null;
  jumlah_skor: number;
  taraf: string;
  created_at: string;
  updated_at: string;
}

interface DbScore {
  item_id: string;
  input_value: number;
  score_value: number;
}

function toRecord(row: DbCerapan, scores: Record<string, InputValue>): CerapanRecord {
  const result = calculateCerapan(scores);
  return normalizeCerapanRecord({
    id: row.id,
    kodSekolah: row.kod_sekolah,
    namaSekolah: row.nama_sekolah,
    namaGuru: row.nama_guru,
    mataPelajaran: row.mata_pelajaran,
    kelas: row.kelas,
    sesiPengisian: row.sesi_pengisian,
    tarikh: row.tarikh,
    kalendarAkademik: row.kalendar_akademik,
    namaPemerhati: row.nama_pemerhati ?? undefined,
    panitiaKp: row.panitia_kp ?? undefined,
    createdBy: row.created_by ?? undefined,
    dapatanPencerap: row.dapatan_pencerap ?? undefined,
    langkahPenambahbaikan: row.langkah_penambahbaikan ?? undefined,
    ulasanPencerapan: row.ulasan_pencerapan ?? undefined,
    tarikhTindakLanjut: row.tarikh_tindak_lanjut ?? undefined,
    scores,
    result,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

async function fetchScores(
  supabase: SupabaseClient,
  cerapanId: string
): Promise<Record<string, InputValue>> {
  const { data } = await supabase
    .from("cerapan_scores")
    .select("item_id, input_value")
    .eq("cerapan_id", cerapanId);

  const scores: Record<string, InputValue> = {};
  for (const row of data ?? []) {
    scores[row.item_id] = row.input_value as InputValue;
  }
  return scores;
}

/** `created_by` mesti rujuk `profiles.id` — elak FK gagal jika user Auth tiada profil. */
export async function resolveCreatedBy(
  supabase: SupabaseClient,
  userId: string | null | undefined
): Promise<string | null> {
  if (!userId) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

function throwIfError(error: unknown): never {
  throw new Error(formatSupabaseError(error));
}

export async function listCerapanSupabase(
  supabase: SupabaseClient
): Promise<CerapanRecord[]> {
  const { data, error } = await supabase
    .from("cerapan")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throwIfError(error);
  if (!data?.length) return [];

  const records: CerapanRecord[] = [];
  for (const row of data as DbCerapan[]) {
    const scores = await fetchScores(supabase, row.id);
    records.push(toRecord(row, scores));
  }
  return records;
}

export async function getCerapanSupabase(
  supabase: SupabaseClient,
  id: string
): Promise<CerapanRecord | null> {
  const { data, error } = await supabase
    .from("cerapan")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throwIfError(error);
  if (!data) return null;

  const scores = await fetchScores(supabase, id);
  return toRecord(data as DbCerapan, scores);
}

export async function saveCerapanSupabase(
  supabase: SupabaseClient,
  userId: string | null,
  data: Omit<CerapanRecord, "id" | "createdAt" | "updatedAt" | "result"> & {
    id?: string;
  },
  schoolId?: string | null
): Promise<CerapanRecord> {
  const result = calculateCerapan(data.scores);
  const now = new Date().toISOString();
  const createdBy = await resolveCreatedBy(supabase, userId);

  const payload = {
    school_id: schoolId ?? null,
    created_by: createdBy,
    kod_sekolah: data.kodSekolah,
    nama_sekolah: data.namaSekolah,
    nama_guru: data.namaGuru,
    mata_pelajaran: data.mataPelajaran,
    kelas: data.kelas,
    sesi_pengisian: effectiveSesiPengisian(data.sesiPengisian),
    tarikh: data.tarikh,
    kalendar_akademik: data.kalendarAkademik,
    nama_pemerhati: data.namaPemerhati ?? null,
    panitia_kp: data.panitiaKp ?? null,
    dapatan_pencerap: data.dapatanPencerap ?? {},
    langkah_penambahbaikan: data.langkahPenambahbaikan ?? {},
    ulasan_pencerapan: data.ulasanPencerapan?.trim() || null,
    tarikh_tindak_lanjut: data.tarikhTindakLanjut || null,
    jumlah_skor: result.jumlahSkor,
    taraf: result.taraf,
    updated_at: now,
  };

  let cerapanId = data.id;

  if (cerapanId) {
    const { error } = await supabase
      .from("cerapan")
      .update(payload)
      .eq("id", cerapanId);
    if (error) throwIfError(error);
    const { error: delErr } = await supabase
      .from("cerapan_scores")
      .delete()
      .eq("cerapan_id", cerapanId);
    if (delErr) throwIfError(delErr);
  } else {
    const { data: inserted, error } = await supabase
      .from("cerapan")
      .insert(payload)
      .select()
      .single();
    if (error) throwIfError(error);
    cerapanId = inserted.id;
  }

  const scoreRows = Object.entries(data.scores).map(([itemId, input]) => ({
    cerapan_id: cerapanId,
    item_id: itemId,
    input_value: input,
    score_value: inputToScore(input),
  }));

  if (scoreRows.length) {
    const { error } = await supabase.from("cerapan_scores").insert(scoreRows);
    if (error) throwIfError(error);
  }

  const saved = await getCerapanSupabase(supabase, cerapanId!);
  if (!saved) throw new Error("Gagal memuatkan rekod selepas simpan");
  return saved;
}

export async function deleteCerapanSupabase(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase.from("cerapan").delete().eq("id", id);
  if (error) throwIfError(error);
}

export function findDuplicateCerapan(
  records: CerapanRecord[],
  namaGuru: string,
  sesiPengisian: string,
  excludeId?: string,
  namaPemerhati?: string | null
): CerapanRecord | null {
  const key = normalizeNamaGuru(namaGuru);
  const effectiveSesi = effectiveSesiPengisian(sesiPengisian);
  const pencerapKey = normalizeNamaGuru(namaPemerhati ?? "");

  return (
    records.find((r) => {
      if (r.id === excludeId) return false;
      if (normalizeNamaGuru(r.namaGuru) !== key) return false;
      if (effectiveSesiPengisian(r.sesiPengisian) !== effectiveSesi) {
        return false;
      }
      if (isKendiri(effectiveSesi)) return true;
      if (isPencerapanAdmin(effectiveSesi)) {
        return normalizeNamaGuru(r.namaPemerhati ?? "") === pencerapKey;
      }
      return true;
    }) ?? null
  );
}

export function searchCerapanRecords(
  records: CerapanRecord[],
  query: {
    namaGuru?: string;
    kodSekolah?: string;
    taraf?: string;
    sesiPengisian?: string;
  }
): CerapanRecord[] {
  const q = {
    namaGuru: query.namaGuru?.toLowerCase() ?? "",
    kodSekolah: query.kodSekolah?.toLowerCase() ?? "",
    taraf: query.taraf ?? "",
    sesiPengisian: query.sesiPengisian ?? "",
  };

  return records.filter((r) => {
    if (q.namaGuru && !r.namaGuru.toLowerCase().includes(q.namaGuru)) return false;
    if (q.kodSekolah && !r.kodSekolah.toLowerCase().includes(q.kodSekolah)) return false;
    if (q.taraf && r.result.taraf !== q.taraf) return false;
    if (
      q.sesiPengisian &&
      effectiveSesiPengisian(r.sesiPengisian) !== q.sesiPengisian
    ) {
      return false;
    }
    return true;
  });
}

export interface DashboardStats {
  total: number;
  byTaraf: Record<string, number>;
  bySekolah: { nama: string; kod: string; count: number }[];
  purataSkor: number;
}

export function computeStats(records: CerapanRecord[]): DashboardStats {
  const byTaraf: Record<string, number> = {
    CEMERLANG: 0,
    BAIK: 0,
    SEDERHANA: 0,
    "PERLU TINDAKAN SEGERA": 0,
  };
  const schoolMap = new Map<string, { nama: string; kod: string; count: number }>();
  let sumSkor = 0;

  for (const r of records) {
    byTaraf[r.result.taraf] = (byTaraf[r.result.taraf] ?? 0) + 1;
    sumSkor += r.result.jumlahSkor;
    const key = r.kodSekolah;
    const existing = schoolMap.get(key);
    if (existing) existing.count += 1;
    else schoolMap.set(key, { nama: r.namaSekolah, kod: r.kodSekolah, count: 1 });
  }

  return {
    total: records.length,
    byTaraf,
    bySekolah: [...schoolMap.values()].sort((a, b) => b.count - a.count),
    purataSkor: records.length ? Math.round((sumSkor / records.length) * 100) / 100 : 0,
  };
}

export type DashboardStatsByJenis = Record<string, DashboardStats>;

export function computeStatsByJenis(records: CerapanRecord[]): DashboardStatsByJenis {
  const result: DashboardStatsByJenis = {};
  for (const jenis of JENIS_ORDER) {
    const bucket = records.filter(
      (r) => effectiveSesiPengisian(r.sesiPengisian) === jenis
    );
    if (bucket.length > 0) result[jenis] = computeStats(bucket);
  }
  return result;
}