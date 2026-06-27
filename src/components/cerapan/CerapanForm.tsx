"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { getSenaraiPemerhati, tambahPemerhati } from "@/lib/storage/pentadbir-store";
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
  const [senaraiPemerhati, setSenaraiPemerhati] = useState<string[]>([]);
  const [pemerhatiMode, setPemerhatiMode] = useState<"pilih" | "baharu">(
    initial?.namaPemerhati ? "pilih" : "pilih"
  );
  const [pemerhatiBaharu, setPemerhatiBaharu] = useState("");
  const [memuatkanGuru, setMemuatkanGuru] = useState(false);
  const kodInputRef = useRef<HTMLInputElement>(null);

  const result = useMemo(() => calculateCerapan(form.scores), [form.scores]);

  const kodSekolahAktif = form.kodSekolah.trim().toUpperCase();

  useEffect(() => {
    getSenaraiPemerhati().then(setSenaraiPemerhati);
  }, []);

  useEffect(() => {
    if (!kodSekolahAktif) {
      setSenaraiGuru([]);
      return;
    }
    setMemuatkanGuru(true);
    getSenaraiGuru(kodSekolahAktif)
      .then(setSenaraiGuru)
      .finally(() => setMemuatkanGuru(false));
  }, [kodSekolahAktif]);

  // Autofill browser kadang isi input tanpa onChange — sync ke state React
  useEffect(() => {
    const el = kodInputRef.current;
    if (!el) return;

    const syncAutofill = () => {
      const nilai = el.value.trim().toUpperCase();
      if (nilai && nilai !== form.kodSekolah.trim().toUpperCase()) {
        setForm((f) => ({ ...f, kodSekolah: nilai }));
      }
    };

    el.addEventListener("change", syncAutofill);
    const timer = window.setInterval(syncAutofill, 400);
    return () => {
      el.removeEventListener("change", syncAutofill);
      window.clearInterval(timer);
    };
  }, [form.kodSekolah]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function getNamaGuruAkhir() {
    return guruMode === "baharu" ? guruBaharu.trim() : form.namaGuru.trim();
  }

  function getNamaPemerhatiAkhir() {
    return pemerhatiMode === "baharu"
      ? pemerhatiBaharu.trim()
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
    if (!getNamaPemerhatiAkhir()) {
      setError("Sila pilih atau masukkan nama pemerhati.");
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
      const namaPemerhati = getNamaPemerhatiAkhir();
      tambahGuru(form.kodSekolah, namaGuru);
      tambahPemerhati(namaPemerhati);

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
        namaPemerhati,
        scores: ensureScores(form.scores),
      });
      router.push(`/cerapan/${record.id}/laporan`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan rekod");
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <StepIndicator current={step} />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {step === 1 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Maklumat Cerapan</h2>
          <p className="mt-1 text-sm text-slate-500">
            Isi maklumat sekolah, guru, dan pemerhati yang mencerap.
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
                <span className="font-medium text-slate-700">
                  {label}
                  {required ? " *" : ""}
                </span>
                <input
                  ref={key === "kodSekolah" ? kodInputRef : undefined}
                  type={type}
                  name={key}
                  autoComplete={key === "kodSekolah" ? "off" : undefined}
                  value={form[key as keyof FormState] as string}
                  onChange={(e) => {
                    const val =
                      key === "kodSekolah"
                        ? e.target.value.toUpperCase()
                        : e.target.value;
                    update(key as keyof FormState, val as never);
                  }}
                  onInput={(e) => {
                    if (key !== "kodSekolah") return;
                    const val = e.currentTarget.value.toUpperCase();
                    update("kodSekolah", val);
                  }}
                  onBlur={(e) => {
                    if (key !== "kodSekolah") return;
                    update("kodSekolah", e.target.value.trim().toUpperCase());
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none ring-brand-500 focus:ring-2"
                />
              </label>
            ))}

            <div className="block text-sm sm:col-span-2">
              <span className="font-medium text-slate-700">Nama Guru *</span>
              <div className="mt-1 space-y-2">
                {!kodSekolahAktif && (
                  <p className="text-xs text-amber-700">
                    Isi kod sekolah untuk muat senarai guru sedia ada.
                  </p>
                )}
                {memuatkanGuru && (
                  <p className="text-xs text-slate-500">Memuatkan senarai guru...</p>
                )}
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
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none ring-brand-500 focus:ring-2"
                >
                  <option value="">
                    {senaraiGuru.length
                      ? "— Pilih guru —"
                      : "— Tiada dalam senarai, tambah baharu —"}
                  </option>
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
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none ring-brand-500 focus:ring-2"
                  />
                )}
              </div>
            </div>

            <div className="block text-sm sm:col-span-2">
              <span className="font-medium text-slate-700">Nama Pemerhati *</span>
              <div className="mt-1 space-y-2">
                <select
                  value={
                    pemerhatiMode === "baharu" ? "__baharu__" : form.namaPemerhati
                  }
                  onChange={(e) => {
                    if (e.target.value === "__baharu__") {
                      setPemerhatiMode("baharu");
                      setPemerhatiBaharu("");
                    } else {
                      setPemerhatiMode("pilih");
                      update("namaPemerhati", e.target.value);
                    }
                  }}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none ring-brand-500 focus:ring-2"
                >
                  <option value="">— Pilih nama anda —</option>
                  {senaraiPemerhati.map((nama) => (
                    <option key={nama} value={nama}>
                      {nama}
                    </option>
                  ))}
                  <option value="__baharu__">+ Tambah nama baharu</option>
                </select>
                {pemerhatiMode === "baharu" && (
                  <input
                    type="text"
                    value={pemerhatiBaharu}
                    onChange={(e) => setPemerhatiBaharu(e.target.value)}
                    placeholder="Masukkan nama pemerhati"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none ring-brand-500 focus:ring-2"
                  />
                )}
              </div>
            </div>

            <label className="block text-sm">
              <span className="font-medium text-slate-700">Sesi Pengisian *</span>
              <select
                value={form.sesiPengisian}
                onChange={(e) => update("sesiPengisian", e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none ring-brand-500 focus:ring-2"
              >
                {SESI_PENGISIAN.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              <span className="font-medium text-slate-700">Kalendar Akademik *</span>
              <select
                value={form.kalendarAkademik}
                onChange={(e) => update("kalendarAkademik", e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none ring-brand-500 focus:ring-2"
              >
                {KALENDAR_AKADEMIK.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => validateStep1() && setStep(2)}
              className="rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
            >
              Seterusnya: Penskoran
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section>
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Tandakan skor mengikut penskoran. Lalai: 4 (terbaik) jika belum dipilih.
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
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium"
            >
              Kembali
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Seterusnya: Ringkasan
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Jumlah Skor</p>
                <p className="text-4xl font-bold text-slate-900">
                  {result.jumlahSkor}
                  <span className="text-lg text-slate-400"> / 100</span>
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

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Sub-standard</th>
                  <th className="px-4 py-3">Skor</th>
                  <th className="px-4 py-3">%</th>
                  <th className="px-4 py-3">Wajaran</th>
                </tr>
              </thead>
              <tbody>
                {result.subStandards.map((s) => (
                  <tr key={s.code} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium">{s.code}</td>
                    <td className="px-4 py-3">{s.weightedScore}</td>
                    <td className="px-4 py-3">{s.percentage}%</td>
                    <td className="px-4 py-3 text-slate-500">{s.weight}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium"
            >
              Kembali
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? "Menyimpan..." : "Simpan & Lihat Laporan"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
