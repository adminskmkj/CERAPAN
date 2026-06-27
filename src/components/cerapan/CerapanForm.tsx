"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { StepIndicator } from "./StepIndicator";
import { ScoringMatrix } from "./ScoringMatrix";
import {
  KALENDAR_AKADEMIK,
  SESI_PENGISIAN,
  calculateCerapan,
  getTarafColor,
  type InputValue,
} from "@/lib/scoring/standard4";
import { ensureScores, saveCerapan } from "@/lib/storage";
import { getSenaraiGuru, tambahGuru } from "@/lib/storage/guru-store";
import {
  getSenaraiPentadbir,
  tambahPentadbir,
} from "@/lib/storage/pentadbir-store";
import { cn } from "@/lib/utils";

interface FormState {
  kodSekolah: string;
  namaSekolah: string;
  namaGuru: string;
  mataPelajaran: string;
  kelas: string;
  sesiPengisian: string;
  tarikh: string;
  kalendarAkademik: string;
  namaPemerhati: string;
  scores: Record<string, InputValue | undefined>;
}

const emptyForm = (): FormState => ({
  kodSekolah: "",
  namaSekolah: "",
  namaGuru: "",
  mataPelajaran: "",
  kelas: "",
  sesiPengisian: SESI_PENGISIAN[0],
  tarikh: new Date().toISOString().slice(0, 10),
  kalendarAkademik: KALENDAR_AKADEMIK[2],
  namaPemerhati: "",
  scores: {},
});

interface Props {
  initial?: Partial<FormState> & { id?: string };
}

export function CerapanForm({ initial }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>({ ...emptyForm(), ...initial });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [senaraiGuru, setSenaraiGuru] = useState<string[]>([]);
  const [guruMode, setGuruMode] = useState<"pilih" | "baharu">(
    initial?.namaGuru ? "pilih" : "pilih"
  );
  const [guruBaharu, setGuruBaharu] = useState("");
  const [senaraiPentadbir, setSenaraiPentadbir] = useState<string[]>([]);
  const [pentadbirMode, setPentadbirMode] = useState<"pilih" | "baharu">(
    initial?.namaPemerhati ? "pilih" : "pilih"
  );
  const [pentadbirBaharu, setPentadbirBaharu] = useState("");

  const result = useMemo(() => calculateCerapan(form.scores), [form.scores]);

  useEffect(() => {
    getSenaraiPentadbir().then(setSenaraiPentadbir);
  }, []);

  useEffect(() => {
    const kod = form.kodSekolah.trim();
    if (!kod) {
      setSenaraiGuru([]);
      return;
    }
    getSenaraiGuru(kod).then(setSenaraiGuru);
  }, [form.kodSekolah]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function getNamaGuruAkhir() {
    return guruMode === "baharu" ? guruBaharu.trim() : form.namaGuru.trim();
  }

  function getNamaPentadbirAkhir() {
    return pentadbirMode === "baharu"
      ? pentadbirBaharu.trim()
      : form.namaPemerhati.trim();
  }

  function validateStep1() {
    const required: (keyof FormState)[] = [
      "kodSekolah",
      "namaSekolah",
      "mataPelajaran",
      "kelas",
      "tarikh",
    ];
    for (const key of required) {
      if (!String(form[key]).trim()) {
        setError("Sila lengkapkan semua maklumat wajib.");
        return false;
      }
    }
    if (!getNamaGuruAkhir()) {
      setError("Sila pilih atau masukkan nama guru.");
      return false;
    }
    if (!getNamaPentadbirAkhir()) {
      setError("Sila pilih atau masukkan nama pentadbir / pemerhati.");
      return false;
    }
    setError("");
    return true;
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const namaGuru = getNamaGuruAkhir();
      const namaPentadbir = getNamaPentadbirAkhir();
      tambahGuru(form.kodSekolah, namaGuru);
      tambahPentadbir(namaPentadbir);

      const record = await saveCerapan({
        id: initial?.id,
        kodSekolah: form.kodSekolah.trim(),
        namaSekolah: form.namaSekolah.trim(),
        namaGuru,
        mataPelajaran: form.mataPelajaran.trim(),
        kelas: form.kelas.trim(),
        sesiPengisian: form.sesiPengisian,
        tarikh: form.tarikh,
        kalendarAkademik: form.kalendarAkademik,
        namaPemerhati: namaPentadbir,
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

      {step === 1 && (
        <section className="rounded-2xl border border-stone bg-paper-card p-6 shadow-soft md:p-8">
          <p className="eyebrow">Langkah 1</p>
          <h2 className="mt-2 text-xl">Maklumat Cerapan</h2>
          <p className="mt-1 text-sm text-muted">
            Isi maklumat sekolah, guru, dan pentadbir yang mencerap.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {(
              [
                ["kodSekolah", "Kod Sekolah", "text", true],
                ["namaSekolah", "Nama Sekolah", "text", true],
                ["mataPelajaran", "Mata Pelajaran", "text", true],
                ["kelas", "Tahap / Kelas", "text", true],
                ["tarikh", "Tarikh Cerapan", "date", true],
              ] as const
            ).map(([key, label, type, required]) => (
              <label key={key} className="block text-sm">
                <span className="font-medium text-ink-2">
                  {label}
                  {required ? " *" : ""}
                </span>
                <input
                  type={type}
                  value={form[key as keyof FormState] as string}
                  onChange={(e) =>
                    update(key as keyof FormState, e.target.value as never)
                  }
                  className={inputCls}
                />
              </label>
            ))}

            <div className="block text-sm sm:col-span-2">
              <span className="font-medium text-ink-2">Nama Guru *</span>
              {form.kodSekolah.trim() ? (
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
                    {senaraiGuru.map((nama) => (
                      <option key={nama} value={nama}>
                        {nama}
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
              ) : (
                <p className="mt-1 rounded-xl border border-dashed border-stone px-3 py-2.5 text-muted">
                  Isi kod sekolah dahulu untuk memaparkan senarai guru.
                </p>
              )}
            </div>

            <div className="block text-sm sm:col-span-2">
              <span className="font-medium text-ink-2">
                Nama Pentadbir / Pemerhati *
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
                  <option value="">— Pilih pentadbir —</option>
                  {senaraiPentadbir.map((nama) => (
                    <option key={nama} value={nama}>
                      {nama}
                    </option>
                  ))}
                  <option value="__baharu__">+ Tambah pentadbir baharu</option>
                </select>
                {pentadbirMode === "baharu" && (
                  <input
                    type="text"
                    value={pentadbirBaharu}
                    onChange={(e) => setPentadbirBaharu(e.target.value)}
                    placeholder="Masukkan nama pentadbir"
                    className={inputCls}
                  />
                )}
              </div>
            </div>

            <label className="block text-sm">
              <span className="font-medium text-ink-2">Sesi Pengisian *</span>
              <select
                value={form.sesiPengisian}
                onChange={(e) => update("sesiPengisian", e.target.value)}
                className={inputCls}
              >
                {SESI_PENGISIAN.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
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
            Tandakan skor mengikut penskoran. Lalai: 4 (terbaik) jika belum
            dipilih.
          </div>
          <ScoringMatrix
            scores={form.scores}
            onChange={(itemId, value) =>
              setForm((f) => ({
                ...f,
                scores: { ...f.scores, [itemId]: value },
              }))
            }
          />
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

          <div className="flex flex-wrap justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded-full border border-stone px-5 py-2.5 text-sm font-medium text-ink-2 transition hover:bg-stone-2"
            >
              ← Kembali
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
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
