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
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Senarai Rekod</h1>
          <p className="mt-1 text-sm text-slate-500">
            {loading ? "Memuatkan..." : `${records.length} rekod cerapan`}
          </p>
        </div>
        <Link
          href="/cerapan/baharu"
          className="rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white"
        >
          + Cerapan Baharu
        </Link>
      </div>

      <div className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-3">
        <label className="text-sm">
          <span className="font-medium text-slate-600">Cari Nama Guru</span>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              value={namaGuru}
              onChange={(e) => setNamaGuru(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm"
              placeholder="Nama guru..."
            />
          </div>
        </label>
        <label className="text-sm">
          <span className="font-medium text-slate-600">Kod Sekolah</span>
          <input
            value={kodSekolah}
            onChange={(e) => setKodSekolah(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            placeholder="Contoh: JBA0001"
          />
        </label>
        <label className="text-sm">
          <span className="font-medium text-slate-600">Taraf PdP</span>
          <select
            value={taraf}
            onChange={(e) => setTaraf(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
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
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-slate-600">Tiada rekod lagi.</p>
          <Link
            href="/cerapan/baharu"
            className="mt-3 inline-block text-sm font-semibold text-brand-700"
          >
            Buat cerapan pertama
          </Link>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Guru</th>
                <th className="px-4 py-3">Sekolah</th>
                <th className="px-4 py-3">Tarikh</th>
                <th className="px-4 py-3">Skor</th>
                <th className="px-4 py-3">Taraf</th>
                <th className="px-4 py-3 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <p className="font-medium">{r.namaGuru}</p>
                    <p className="text-xs text-slate-500">{r.mataPelajaran}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p>{r.namaSekolah}</p>
                    <p className="text-xs text-slate-500">{r.kodSekolah}</p>
                  </td>
                  <td className="px-4 py-3">{formatTarikh(r.tarikh)}</td>
                  <td className="px-4 py-3 font-semibold">
                    {r.result.jumlahSkor}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full border px-2 py-1 text-xs font-semibold",
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
                        className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Laporan
                      </Link>
                      <button
                        type="button"
                        aria-label="Padam rekod cerapan"
                        onClick={() => handleDelete(r.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
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