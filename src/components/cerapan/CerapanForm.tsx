"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { StepIndicator } from "./StepIndicator";
import { ScoringMatrix } from "./ScoringMatrix";
import {
  JENIS_KENDIRI,
  JENIS_KETUA_PANITIA,
  JENIS_PENCERAPAN_1,
  JENIS_PENCERAPAN_ADMIN,
} from "@/lib/cerapan/jenis";
import { useAuth } from "@/contexts/AuthContext";
import { panitiaMatchesMataPelajaran, mataPelajaranDariPanitiaKp } from "@/lib/data/panitia";
import { findKpByPanitia } from "@/lib/data/ketua-panitia-smkjs";
import {
  KALENDAR_AKADEMIK,
  SUB_STANDARDS,
  calculateCerapan,
  getTarafColor,
  type InputValue,
} from "@/lib/scoring/standard4";
import { ensureScores, saveCerapan } from "@/lib/storage";
import {
  getSenaraiGuruOptions,
  tambahGuru,
  type GuruOption,
} from "@/lib/storage/guru-store";
import {
  getSenaraiPemerhatiOptions,
  tambahPentadbir,
  type PemerhatiOption,
} from "@/lib/storage/pentadbir-store";
import {
  NAMA_KELAS,
  formatKelas,
  getTahunBySesi,
  KOD_SEKOLAH,
  NAMA_SEKOLAH,
  parseKelas,
} from "@/lib/data/sekolah";
import {
  SESI_GURU_OPTIONS,
  type SesiGuru,
} from "@/lib/data/senarai-smkjs";
import { cn, formatTarikh } from "@/lib/utils";
import type { CerapanRecord } from "@/lib/types/cerapan";

interface FormState {
  kodSekolah: string;
  namaSekolah: string;
  namaGuru: string;
  sesiGuru: SesiGuru;
  mataPelajaran: string;
  kelas: string;
  tahunKelas: string;
  namaKelas: string;
  sesiPengisian: string;
  tarikh: string;
  kalendarAkademik: string;
  namaPemerhati: string;
  dapatanPencerap: Record<string, string>;
  langkahPenambahbaikan: Record<string, string>;
  ulasanPencerapan: string;
  tarikhTindakLanjut: string;
  scores: Record<string, InputValue | undefined>;
}

function namaPencerapKetuaPanitia(
  fullName: string | null,
  panitia: string | null
): string {
  if (fullName?.trim()) return fullName.trim();
  if (panitia?.trim()) {
    const ref = findKpByPanitia(panitia);
    if (ref?.nama) return ref.nama;
  }
  return "";
}

const emptyForm = (): FormState => ({
  kodSekolah: KOD_SEKOLAH,
  namaSekolah: NAMA_SEKOLAH,
  namaGuru: "",
  sesiGuru: "PAGI",
  mataPelajaran: "",
  kelas: "",
  tahunKelas: "",
  namaKelas: "",
  sesiPengisian: JENIS_KENDIRI,
  tarikh: new Date().toISOString().slice(0, 10),
  kalendarAkademik: KALENDAR_AKADEMIK[0],
  namaPemerhati: "",
  dapatanPencerap: {},
  langkahPenambahbaikan: {},
  ulasanPencerapan: "",
  tarikhTindakLanjut: "",
  scores: {},
});

export type CerapanFormMode = "kendiri" | "pencerapan" | "ketua-panitia";

interface Props {
  mode: CerapanFormMode;
  initial?: CerapanRecord;
}

export function CerapanForm({ mode, initial }: Props) {
  const router = useRouter();
  const { canWriteCerapan, canModifyCerapanRecord, panitia, fullName } =
    useAuth();
  const kpReadOnly =
    mode === "ketua-panitia" &&
    Boolean(initial?.id) &&
    initial?.sesiPengisian &&
    !canModifyCerapanRecord({
      sesiPengisian: initial.sesiPengisian,
      createdBy: initial.createdBy,
      panitiaKp: initial.panitiaKp,
      mataPelajaran: initial.mataPelajaran ?? "",
    });
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(() => {
    const base = {
      ...emptyForm(),
      sesiPengisian:
        mode === "kendiri"
          ? JENIS_KENDIRI
          : mode === "ketua-panitia"
            ? JENIS_KETUA_PANITIA
            : (initial?.sesiPengisian ?? JENIS_PENCERAPAN_1),
      ...initial,
    };
    if (initial?.kelas) {
      const parsed = parseKelas(initial.kelas);
      if (parsed) {
        base.tahunKelas = String(parsed.tahun);
        base.namaKelas = parsed.namaKelas;
      }
    }
    return base;
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [senaraiGuru, setSenaraiGuru] = useState<GuruOption[]>([]);
  const [guruMode, setGuruMode] = useState<"pilih" | "baharu">(
    initial?.namaGuru ? "pilih" : "pilih"
  );
  const [guruBaharu, setGuruBaharu] = useState("");
  const [senaraiPentadbir, setSenaraiPentadbir] = useState<PemerhatiOption[]>([]);
  const [pentadbirMode, setPentadbirMode] = useState<"pilih" | "baharu">(
    initial?.namaPemerhati ? "pilih" : "pilih"
  );
  const [pentadbirBaharu, setPentadbirBaharu] = useState("");

  const result = useMemo(() => calculateCerapan(form.scores), [form.scores]);

  useEffect(() => {
    getSenaraiPemerhatiOptions().then(setSenaraiPentadbir);
  }, []);

  useEffect(() => {
    if (mode !== "ketua-panitia") return;
    const mp = mataPelajaranDariPanitiaKp(panitia);
    const kpName = namaPencerapKetuaPanitia(fullName, panitia);
    const isEdit = Boolean(initial?.id);
    setForm((f) => ({
      ...f,
      ...(mp && !isEdit ? { mataPelajaran: mp } : {}),
      ...(kpName && !(isEdit && initial?.namaPemerhati)
        ? { namaPemerhati: kpName }
        : {}),
    }));
    if (kpName) setPentadbirMode("pilih");
  }, [mode, fullName, panitia, initial?.id, initial?.namaPemerhati]);

  useEffect(() => {
    getSenaraiGuruOptions(KOD_SEKOLAH, form.sesiGuru).then(setSenaraiGuru);
  }, [form.sesiGuru]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function getMataPelajaranAkhir() {
    if (mode === "ketua-panitia") {
      const locked = mataPelajaranDariPanitiaKp(panitia);
      if (locked) return locked;
    }
    return form.mataPelajaran.trim();
  }

  function getNamaGuruAkhir() {
    return guruMode === "baharu" ? guruBaharu.trim() : form.namaGuru.trim();
  }

  function getNamaPentadbirAkhir() {
    if (mode === "ketua-panitia") {
      const locked = namaPencerapKetuaPanitia(fullName, panitia);
      if (locked) return locked;
    }
    return pentadbirMode === "baharu"
      ? pentadbirBaharu.trim()
      : form.namaPemerhati.trim();
  }

  function validateStep1() {
    if (!getMataPelajaranAkhir()) {
      setError(
        mode === "ketua-panitia"
          ? "Profil KP tiada panitia — mata pelajaran tidak boleh ditetapkan."
          : "Sila lengkapkan mata pelajaran."
      );
      return false;
    }
    if (!form.tarikh.trim()) {
      setError("Sila lengkapkan semua maklumat wajib.");
      return false;
    }
    if (!form.tahunKelas || !form.namaKelas) {
      setError("Sila pilih tahun dan nama kelas.");
      return false;
    }
    if (!getNamaGuruAkhir()) {
      setError("Sila pilih atau masukkan nama guru.");
      return false;
    }
    if (mode !== "kendiri" && !getNamaPentadbirAkhir()) {
      setError("Sila pilih atau masukkan nama pencerap.");
      return false;
    }
    if (mode === "ketua-panitia") {
      if (!panitia?.trim()) {
        setError(
          "Profil ketua panitia tiada panitia. Hubungi pentadbir untuk set panitia pada profil anda."
        );
        return false;
      }
      if (
        !panitiaMatchesMataPelajaran(panitia, getMataPelajaranAkhir())
      ) {
        setError(
          `Mata pelajaran PdP mesti dalam panitia anda (${panitia}). Contoh: KP BM cerap subjek BM; KP PSV cerap subjek PSV — markah panitia lain tidak boleh diubah.`
        );
        return false;
      }
    }
    setError("");
    return true;
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      if (
        !canWriteCerapan(form.sesiPengisian, {
          mataPelajaran: getMataPelajaranAkhir(),
          existingId: initial?.id,
          record: initial
            ? {
                sesiPengisian: initial.sesiPengisian,
                createdBy: initial.createdBy,
                panitiaKp: initial.panitiaKp,
                mataPelajaran: initial.mataPelajaran,
              }
            : undefined,
        })
      ) {
        throw new Error(
          initial?.id && mode === "ketua-panitia"
            ? "Anda hanya boleh mengubah markah rekod KP yang anda sendiri buat."
            : "Anda tidak dibenarkan menyimpan jenis pencerapan ini."
        );
      }
      const namaGuru = getNamaGuruAkhir();
      const namaPentadbir =
        mode === "kendiri" ? namaGuru : getNamaPentadbirAkhir();
      tambahGuru(KOD_SEKOLAH, namaGuru);
      if (mode !== "kendiri") tambahPentadbir(namaPentadbir);

      const record = await saveCerapan({
        id: initial?.id,
        kodSekolah: KOD_SEKOLAH,
        namaSekolah: NAMA_SEKOLAH,
        namaGuru,
        mataPelajaran: getMataPelajaranAkhir(),
        kelas: formatKelas(Number(form.tahunKelas), form.namaKelas),
        sesiPengisian: form.sesiPengisian,
        tarikh: form.tarikh,
        kalendarAkademik: form.kalendarAkademik,
        namaPemerhati: namaPentadbir,
        panitiaKp:
          mode === "ketua-panitia" ? panitia?.trim() ?? undefined : undefined,
        dapatanPencerap: form.dapatanPencerap,
        langkahPenambahbaikan: form.langkahPenambahbaikan,
        ulasanPencerapan: form.ulasanPencerapan.trim() || undefined,
        tarikhTindakLanjut: form.tarikhTindakLanjut || undefined,
        scores: ensureScores(form.scores),
      });
      router.push(`/cerapan/${record.id}/laporan`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan rekod");
      setSaving(false);
    }
  }

  const inputCls =
    "mt-1 w-full rounded-xl border border-stone px-3 py-2.5";

  return (
    <div className="space-y-6">
      <StepIndicator current={step} />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {kpReadOnly && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Rekod ini bukan milik panitia anda atau dibuat oleh KP lain. Anda
          hanya boleh ubah markah pencerapan yang anda sendiri isikan.
        </div>
      )}

      {step === 1 && (
        <section className="rounded-2xl border border-stone bg-paper-card p-6 shadow-soft md:p-8">
          <p className="eyebrow">Langkah 1</p>
          <h2 className="mt-2 text-xl">Maklumat Pencerapan</h2>
          <p className="mt-1 text-sm text-muted">
            {mode === "kendiri"
              ? "Guru mengisi pencerapan kendiri — satu rekod kendiri setiap guru."
              : mode === "ketua-panitia"
                ? "Ketua panitia boleh cerap guru dalam panitia sendiri. KP boleh ubah markah rekod yang dibuat oleh KP itu sahaja — bukan rekod pentadbir atau KP panitia lain."
                : "Pentadbir mengisi pencerapan — satu rekod setiap pencerapan pertama & kedua."}
          </p>
          <div className="mt-4 rounded-xl border border-stone bg-stone-2/60 px-4 py-3 text-sm">
            <p className="font-semibold text-ink">{NAMA_SEKOLAH}</p>
            <p className="mt-0.5 font-mono text-xs text-muted">
              Kod Sekolah: {KOD_SEKOLAH}
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {mode === "ketua-panitia" && (
              <label className="block text-sm sm:col-span-2">
                <span className="font-medium text-ink-2">Panitia anda</span>
                <input
                  type="text"
                  readOnly
                  value={panitia ?? "— belum diset pada profil —"}
                  className={cn(inputCls, "bg-stone-2/80")}
                />
                <p className="mt-1 text-xs text-muted">
                  {panitia
                    ? (() => {
                        const ref = findKpByPanitia(panitia);
                        return ref
                          ? `KP rasmi: ${ref.nama}`
                          : "Pastikan profil Supabase `panitia` sepadan senarai sekolah.";
                      })()
                    : "Pentadbir perlu set medan panitia pada profil KP (lihat seed_ketua_panitia.sql)."}
                </p>
              </label>
            )}
            {mode === "ketua-panitia" ? (
              <label className="block text-sm sm:col-span-2">
                <span className="font-medium text-ink-2">
                  Mata Pelajaran PdP *
                </span>
                <input
                  type="text"
                  readOnly
                  value={
                    mataPelajaranDariPanitiaKp(panitia) ||
                    form.mataPelajaran ||
                    "— ikut panitia profil —"
                  }
                  className={cn(inputCls, "bg-stone-2/80")}
                />
                <p className="mt-1 text-xs text-muted">
                  Automatik ikut panitia KP yang log masuk — tidak perlu taip.
                </p>
              </label>
            ) : (
              <label className="block text-sm">
                <span className="font-medium text-ink-2">Mata Pelajaran *</span>
                <input
                  type="text"
                  value={form.mataPelajaran}
                  onChange={(e) => update("mataPelajaran", e.target.value)}
                  className={inputCls}
                />
              </label>
            )}

            <label className="block text-sm">
              <span className="font-medium text-ink-2">Tarikh Pencerapan *</span>
              <input
                type="date"
                value={form.tarikh}
                onChange={(e) => update("tarikh", e.target.value)}
                className={inputCls}
              />
            </label>

            <label className="block text-sm">
              <span className="font-medium text-ink-2">Sesi Guru *</span>
              <select
                value={form.sesiGuru}
                onChange={(e) => {
                  const sesi = e.target.value as SesiGuru;
                  setForm((f) => ({
                    ...f,
                    sesiGuru: sesi,
                    namaGuru: "",
                    tahunKelas: "",
                    namaKelas: "",
                  }));
                  setGuruMode("pilih");
                  setGuruBaharu("");
                }}
                className={inputCls}
              >
                {SESI_GURU_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              <span className="font-medium text-ink-2">Tahun *</span>
              <select
                value={form.tahunKelas}
                onChange={(e) => update("tahunKelas", e.target.value)}
                className={inputCls}
              >
                <option value="">— Pilih tahun —</option>
                {getTahunBySesi(form.sesiGuru).map((tahun) => (
                  <option key={tahun} value={String(tahun)}>
                    Tahun {tahun}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm sm:col-span-2">
              <span className="font-medium text-ink-2">Nama Kelas *</span>
              <select
                value={form.namaKelas}
                onChange={(e) => update("namaKelas", e.target.value)}
                className={inputCls}
              >
                <option value="">— Pilih kelas —</option>
                {NAMA_KELAS.map((nama) => (
                  <option key={nama} value={nama}>
                    {nama}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-muted">
                {form.sesiGuru === "PAGI"
                  ? "Sesi pagi: Tahun 4, 5 & 6"
                  : "Sesi petang: Tahun 1, 2 & 3"}
              </p>
            </label>

            <div className="block text-sm sm:col-span-2">
              <span className="font-medium text-ink-2">Nama Guru *</span>
              <div className="mt-1 space-y-2">
                <select
                  value={guruMode === "baharu" ? "__baharu__" : form.namaGuru}
                  onChange={(e) => {
                    if (e.target.value === "__baharu__") {
                      setGuruMode("baharu");
                      setGuruBaharu("");
                    } else {
                      setGuruMode("pilih");
                      update("namaGuru", e.target.value);
                    }
                  }}
                  className={inputCls}
                >
                  <option value="">— Pilih guru —</option>
                  {senaraiGuru.map((guru) => (
                    <option key={guru.nama} value={guru.nama}>
                      {guru.label}
                    </option>
                  ))}
                  <option value="__baharu__">+ Tambah guru baharu</option>
                </select>
                {guruMode === "baharu" && (
                  <input
                    type="text"
                    value={guruBaharu}
                    onChange={(e) => setGuruBaharu(e.target.value)}
                    placeholder="Masukkan nama guru baharu"
                    className={inputCls}
                  />
                )}
              </div>
            </div>

            {mode !== "kendiri" && mode === "ketua-panitia" && (
              <label className="block text-sm sm:col-span-2">
                <span className="font-medium text-ink-2">
                  Nama Pencerap (Ketua Panitia) *
                </span>
                <input
                  type="text"
                  readOnly
                  value={
                    namaPencerapKetuaPanitia(fullName, panitia) ||
                    form.namaPemerhati ||
                    "— muatkan profil KP —"
                  }
                  className={cn(inputCls, "bg-stone-2/80")}
                />
                <p className="mt-1 text-xs text-muted">
                  Diisi automatik daripada profil log masuk — bukan senarai
                  pentadbir.
                </p>
              </label>
            )}

            {mode !== "kendiri" && mode !== "ketua-panitia" && (
              <div className="block text-sm sm:col-span-2">
                <span className="font-medium text-ink-2">
                  Nama Pencerap *
                </span>
                <div className="mt-1 space-y-2">
                  <select
                    value={
                      pentadbirMode === "baharu"
                        ? "__baharu__"
                        : form.namaPemerhati
                    }
                    onChange={(e) => {
                      if (e.target.value === "__baharu__") {
                        setPentadbirMode("baharu");
                        setPentadbirBaharu("");
                      } else {
                        setPentadbirMode("pilih");
                        update("namaPemerhati", e.target.value);
                      }
                    }}
                    className={inputCls}
                  >
                    <option value="">— Pilih pencerap —</option>
                    {senaraiPentadbir.map((p) => (
                      <option key={p.nama} value={p.nama}>
                        {p.label}
                      </option>
                    ))}
                    <option value="__baharu__">+ Tambah pencerap baharu</option>
                  </select>
                  {pentadbirMode === "baharu" && (
                    <input
                      type="text"
                      value={pentadbirBaharu}
                      onChange={(e) => setPentadbirBaharu(e.target.value)}
                      placeholder="Masukkan nama pencerap"
                      className={inputCls}
                    />
                  )}
                </div>
              </div>
            )}

            <label className="block text-sm">
              <span className="font-medium text-ink-2">Jenis Pencerapan *</span>
              {mode === "kendiri" ? (
                <input
                  type="text"
                  readOnly
                  value={JENIS_KENDIRI}
                  className={cn(inputCls, "bg-stone-2 text-ink-2")}
                />
              ) : mode === "ketua-panitia" ? (
                <input
                  type="text"
                  readOnly
                  value={JENIS_KETUA_PANITIA}
                  className={cn(inputCls, "bg-stone-2 text-ink-2")}
                />
              ) : (
                <select
                  value={form.sesiPengisian}
                  onChange={(e) => update("sesiPengisian", e.target.value)}
                  className={inputCls}
                >
                  {JENIS_PENCERAPAN_ADMIN.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              )}
            </label>

            <label className="block text-sm">
              <span className="font-medium text-ink-2">
                Kalendar Akademik *
              </span>
              <select
                value={form.kalendarAkademik}
                onChange={(e) => update("kalendarAkademik", e.target.value)}
                className={inputCls}
              >
                {KALENDAR_AKADEMIK.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={() => validateStep1() && setStep(2)}
              className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:opacity-90"
            >
              Seterusnya: Penskoran →
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section>
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Tandakan skor dan tulis dapatan pencerapan untuk setiap aspek pada
            halaman yang sama (sama untuk pentadbir & ketua panitia — bezakan
            jenis laporan sahaja).
          </div>
          <ScoringMatrix
            scores={form.scores}
            onChange={(itemId, value) =>
              setForm((f) => ({
                ...f,
                scores: { ...f.scores, [itemId]: value },
              }))
            }
            dapatanPencerap={form.dapatanPencerap}
            onDapatanChange={(code, value) =>
              setForm((f) => ({
                ...f,
                dapatanPencerap: { ...f.dapatanPencerap, [code]: value },
              }))
            }
            langkahPenambahbaikan={form.langkahPenambahbaikan}
            onLangkahChange={(code, value) =>
              setForm((f) => ({
                ...f,
                langkahPenambahbaikan: {
                  ...f.langkahPenambahbaikan,
                  [code]: value,
                },
              }))
            }
          />

          <div className="mt-6 rounded-2xl border border-stone bg-paper-card p-6 shadow-soft">
            <h3 className="text-sm font-semibold text-ink">Ulasan Tambahan</h3>
            <p className="mt-1 text-xs text-muted">
              Untuk borang maklum balas yang akan diberikan kepada guru.
            </p>
            <label className="mt-4 block text-sm">
              <span className="font-medium text-ink-2">Ulasan Umum (pilihan)</span>
              <textarea
                value={form.ulasanPencerapan}
                onChange={(e) => update("ulasanPencerapan", e.target.value)}
                rows={3}
                placeholder="Ulasan keseluruhan sesi pencerapan…"
                className={cn(inputCls, "resize-y")}
              />
            </label>
            <label className="mt-4 block text-sm sm:max-w-xs">
              <span className="font-medium text-ink-2">
                Cadangan Tarikh Pemantauan Tindak Lanjut
              </span>
              <input
                type="date"
                value={form.tarikhTindakLanjut}
                onChange={(e) => update("tarikhTindakLanjut", e.target.value)}
                className={inputCls}
              />
            </label>
          </div>

          <div className="mt-6 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-full border border-stone px-5 py-2.5 text-sm font-medium text-ink-2 transition hover:bg-stone-2"
            >
              ← Kembali
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:opacity-90"
            >
              Seterusnya: Ringkasan →
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-4">
          <div className="rounded-2xl border border-stone bg-paper-card p-6 shadow-soft md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted">Jumlah Skor</p>
                <p className="mt-1 font-serif text-5xl text-ink">
                  {result.jumlahSkor}
                  <span className="font-sans text-xl text-muted"> / 100</span>
                </p>
              </div>
              <span
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-bold",
                  getTarafColor(result.taraf)
                )}
              >
                {result.taraf}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-stone bg-paper-card shadow-soft">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-stone bg-stone-2 text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-4 py-3 font-semibold">Sub-standard</th>
                  <th className="px-4 py-3 font-semibold">Skor</th>
                  <th className="px-4 py-3 font-semibold">%</th>
                  <th className="px-4 py-3 font-semibold">Wajaran</th>
                </tr>
              </thead>
              <tbody>
                {result.subStandards.map((s) => (
                  <tr key={s.code} className="border-b border-stone-2 last:border-0">
                    <td className="px-4 py-3 font-mono font-medium text-ink">
                      {s.code}
                    </td>
                    <td className="px-4 py-3 font-mono text-ink-2">
                      {s.weightedScore}
                    </td>
                    <td className="px-4 py-3 font-mono text-ink-2">
                      {s.percentage}%
                    </td>
                    <td className="px-4 py-3 font-mono text-muted">
                      {s.weight}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-2xl border border-accent/30 bg-accent-soft/40 p-6 shadow-soft md:p-8">
            <h3 className="text-base font-semibold text-ink">
              Ulasan untuk Guru
            </h3>
            <p className="mt-1 text-sm text-muted">
              Semak dapatan pencerapan sebelum simpan. Maklum balas ini akan
              dimuat turun untuk guru yang dicerap.
            </p>

            {form.ulasanPencerapan.trim() && (
              <div className="mt-4 overflow-hidden rounded-xl border border-stone bg-paper-card p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Ulasan Umum
                </p>
                <p className="ulasan-text-wrap mt-2 text-sm text-ink-2">
                  {form.ulasanPencerapan}
                </p>
              </div>
            )}

            <div className="mt-4 space-y-3">
              {SUB_STANDARDS.map((sub) => {
                const dapatan = form.dapatanPencerap[sub.code]?.trim();
                const langkah = form.langkahPenambahbaikan[sub.code]?.trim();
                if (!dapatan && !langkah) return null;
                return (
                  <div
                    key={sub.code}
                    className="overflow-hidden rounded-xl border border-stone bg-paper-card p-4"
                  >
                    <p className="text-sm font-semibold text-accent">
                      {sub.code} — {sub.title}
                    </p>
                    {dapatan && (
                      <>
                        <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-muted">
                          Dapatan Pencerap
                        </p>
                        <p className="ulasan-text-wrap mt-1 text-sm text-ink-2">
                          {dapatan}
                        </p>
                      </>
                    )}
                    {langkah && (
                      <>
                        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted">
                          Langkah Penambahbaikan
                        </p>
                        <p className="ulasan-text-wrap mt-1 text-sm text-ink-2">
                          {langkah}
                        </p>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {!form.ulasanPencerapan.trim() &&
              !Object.values(form.dapatanPencerap).some((v) => v?.trim()) &&
              !Object.values(form.langkahPenambahbaikan).some((v) => v?.trim()) && (
                <p className="mt-4 rounded-xl border border-dashed border-stone bg-paper-card px-4 py-3 text-sm text-muted">
                  Tiada ulasan ditulis lagi. Kembali ke penskoran untuk isi
                  dapatan pencerapan.
                </p>
              )}

            {form.tarikhTindakLanjut && (
              <p className="mt-4 text-sm text-ink-2">
                <span className="font-medium">Tarikh tindak lanjut:</span>{" "}
                {formatTarikh(form.tarikhTindakLanjut)}
              </p>
            )}
          </div>

          <div className="flex flex-wrap justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded-full border border-stone px-5 py-2.5 text-sm font-medium text-ink-2 transition hover:bg-stone-2"
            >
              ← Kembali ke Penskoran
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || Boolean(kpReadOnly)}
              className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:opacity-90 disabled:opacity-60"
            >
              {saving ? "Menyimpan…" : "Simpan & Lihat Laporan"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
