"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Search, Trash2 } from "lucide-react";
import { deleteCerapan, searchCerapan } from "@/lib/storage";
import type { CerapanRecord } from "@/lib/types/cerapan";
import { getTarafColor } from "@/lib/scoring/standard4";
import { cn, formatTarikh } from "@/lib/utils";

export default function SenaraiPage() {
  const [records, setRecords] = useState<CerapanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [namaGuru, setNamaGuru] = useState("");
  const [kodSekolah, setKodSekolah] = useState("");
  const [taraf, setTaraf] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await searchCerapan({
      namaGuru: namaGuru || undefined,
      kodSekolah: kodSekolah || undefined,
      taraf: taraf || undefined,
    });
    setRecords(data);
    setLoading(false);
  }, [namaGuru, kodSekolah, taraf]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleDelete(id: string) {
    if (confirm("Padam rekod cerapan ini?")) {
      await deleteCerapan(id);
      refresh();
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Arkib</p>
          <h1 className="mt-2 text-3xl md:text-4xl">Senarai Rekod</h1>
          <p className="mt-1 text-sm text-muted">
            {loading ? "Memuatkan…" : `${records.length} rekod cerapan`}
          </p>
        </div>
        <Link
          href="/cerapan/baharu"
          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:opacity-90"
        >
          + Cerapan Baharu
        </Link>
      </div>

      {/* Search strip */}
      <div className="grid gap-3 rounded-2xl border border-stone bg-paper-card p-4 shadow-soft sm:grid-cols-3">
        <label className="text-sm">
          <span className="font-medium text-ink-2">Cari Nama Guru</span>
          <div className="relative mt-1.5">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone" strokeWidth={1.5} />
            <input
              value={namaGuru}
              onChange={(e) => setNamaGuru(e.target.value)}
              className="w-full rounded-lg border border-stone py-2 pl-9 pr-3 text-sm"
              placeholder="Nama guru…"
            />
          </div>
        </label>
        <label className="text-sm">
          <span className="font-medium text-ink-2">Kod Sekolah</span>
          <input
            value={kodSekolah}
            onChange={(e) => setKodSekolah(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-stone px-3 py-2 text-sm"
            placeholder="Contoh: JBA0001"
          />
        </label>
        <label className="text-sm">
          <span className="font-medium text-ink-2">Taraf PdP</span>
          <select
            value={taraf}
            onChange={(e) => setTaraf(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-stone px-3 py-2 text-sm"
          >
            <option value="">Semua</option>
            <option value="CEMERLANG">CEMERLANG</option>
            <option value="BAIK">BAIK</option>
            <option value="SEDERHANA">SEDERHANA</option>
            <option value="PERLU TINDAKAN SEGERA">PERLU TINDAKAN SEGERA</option>
          </select>
        </label>
      </div>

      {!loading && records.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone bg-paper-card p-16 text-center">
          <p className="text-muted">Tiada rekod lagi.</p>
          <Link
            href="/cerapan/baharu"
            className="mt-3 inline-block text-sm font-semibold text-accent"
          >
            Buat cerapan pertama →
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-stone bg-paper-card shadow-soft">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-stone text-left text-xs uppercase tracking-wider text-muted">
                <th className="px-4 py-3 font-semibold">#</th>
                <th className="px-4 py-3 font-semibold">Guru</th>
                <th className="px-4 py-3 font-semibold">Sekolah</th>
                <th className="px-4 py-3 font-semibold">Tarikh</th>
                <th className="px-4 py-3 font-semibold">Skor</th>
                <th className="px-4 py-3 font-semibold">Taraf</th>
                <th className="px-4 py-3 text-right font-semibold">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr
                  key={r.id}
                  className="border-b border-stone-2 last:border-0 hover:bg-stone-2/50"
                >
                  <td className="px-4 py-3 font-mono text-xs text-muted">
                    {String(i + 1).padStart(2, "0")}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{r.namaGuru}</p>
                    <p className="text-xs text-muted">{r.mataPelajaran}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-ink">{r.namaSekolah}</p>
                    <p className="font-mono text-xs text-muted">
                      {r.kodSekolah}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-ink-2">
                    {formatTarikh(r.tarikh)}
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold text-ink">
                    {r.result.jumlahSkor}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                        getTarafColor(r.result.taraf)
                      )}
                    >
                      {r.result.taraf}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/cerapan/${r.id}/laporan`}
                        className="inline-flex items-center gap-1 rounded-md border border-stone px-2.5 py-1 text-xs font-medium text-ink-2 transition hover:bg-stone-2"
                      >
                        <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
                        Laporan
                      </Link>
                      <button
                        type="button"
                        aria-label="Padam rekod cerapan"
                        onClick={() => handleDelete(r.id)}
                        className="inline-flex items-center gap-1 rounded-md border border-stone px-2.5 py-1 text-xs font-medium text-red-700 transition hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
