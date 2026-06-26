"use client";

import { useRef } from "react";
import type { CerapanRecord } from "@/lib/types/cerapan";
import { SUB_STANDARDS } from "@/lib/scoring/standard4";
import { formatTarikh } from "@/lib/utils";
import { Download, Printer } from "lucide-react";

interface Props {
  record: CerapanRecord;
}

export function LaporanGuru({ record }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  async function handlePdf() {
    const el = ref.current;
    if (!el) return;
    const html2pdf = (await import("html2pdf.js")).default;
    await html2pdf()
      .set({
        margin: [8, 8, 8, 8],
        filename: `laporan-${record.namaGuru.replace(/\s+/g, "-")}-${record.tarikh}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(el)
      .save();
  }

  return (
    <div>
      <div className="no-print mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium"
        >
          <Printer className="h-4 w-4" />
          Cetak Laporan
        </button>
        <button
          type="button"
          onClick={handlePdf}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium"
        >
          <Download className="h-4 w-4" />
          Muat Turun PDF
        </button>
      </div>

      <div ref={ref} className="laporan-formal">
        <div className="laporan-formal-header">
          <p className="laporan-formal-org">SKPM KUALITI@SEKOLAH</p>
          <h1 className="laporan-formal-title">TAPAK STANDARD 4</h1>
          <p className="laporan-formal-sub">
            PEMBELAJARAN DAN PEMUDAHCARAAN (PdPc) — LAPORAN CERAPAN
          </p>
        </div>

        <table className="laporan-formal-table">
          <tbody>
            <tr>
              <td className="lf-label">Kod Sekolah</td>
              <td className="lf-value">{record.kodSekolah}</td>
              <td className="lf-label">Nama Sekolah</td>
              <td className="lf-value">{record.namaSekolah}</td>
            </tr>
            <tr>
              <td className="lf-label">Nama Guru</td>
              <td className="lf-value">{record.namaGuru}</td>
              <td className="lf-label">Mata Pelajaran</td>
              <td className="lf-value">{record.mataPelajaran}</td>
            </tr>
            <tr>
              <td className="lf-label">Kelas</td>
              <td className="lf-value">{record.kelas}</td>
              <td className="lf-label">Sesi Pengisian</td>
              <td className="lf-value">{record.sesiPengisian}</td>
            </tr>
            <tr>
              <td className="lf-label">Tarikh</td>
              <td className="lf-value">{formatTarikh(record.tarikh)}</td>
              <td className="lf-label">Kalendar Akademik</td>
              <td className="lf-value">{record.kalendarAkademik}</td>
            </tr>
            <tr>
              <td className="lf-label">Pemerhati</td>
              <td className="lf-value" colSpan={3}>
                {record.namaPemerhati || "-"}
              </td>
            </tr>
          </tbody>
        </table>

        <table className="laporan-formal-table laporan-formal-skor">
          <thead>
            <tr>
              <th>Sub-standard</th>
              <th>Skor</th>
              <th>%</th>
              <th>Wajaran</th>
              <th>Taraf</th>
            </tr>
          </thead>
          <tbody>
            {record.result.subStandards.map((s) => (
              <tr key={s.code}>
                <td>
                  {s.code} {SUB_STANDARDS.find((x) => x.code === s.code)?.title}
                </td>
                <td className="text-center">
                  {s.weightedScore}/{s.weight}
                </td>
                <td className="text-center">{s.percentage}%</td>
                <td className="text-center">{s.weight}%</td>
                <td className="text-center">—</td>
              </tr>
            ))}
            <tr className="lf-total">
              <td>
                <strong>JUMLAH SKOR</strong>
              </td>
              <td className="text-center" colSpan={2}>
                <strong>
                  {record.result.jumlahSkor} / 100
                </strong>
              </td>
              <td className="text-center" />
              <td className="text-center">
                <strong>{record.result.taraf}</strong>
              </td>
            </tr>
          </tbody>
        </table>

        <table className="laporan-formal-table laporan-formal-tandatangan">
          <tbody>
            <tr>
              <td className="w-1/2 align-bottom">
                <p className="lf-sig-label">Tandatangan Pemerhati</p>
                <div className="lf-sig-line" />
                <p className="lf-sig-name">{record.namaPemerhati || ""}</p>
              </td>
              <td className="w-1/2 align-bottom">
                <p className="lf-sig-label">Tandatangan Guru Dicerap</p>
                <div className="lf-sig-line" />
                <p className="lf-sig-name">{record.namaGuru}</p>
              </td>
            </tr>
          </tbody>
        </table>

        <p className="laporan-formal-footer">
          Borang dijana secara digital · ID: {record.id.slice(0, 8)} ·{" "}
          {formatTarikh(record.updatedAt)}
        </p>
      </div>
    </div>
  );
}