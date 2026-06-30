"use client";

import { useRef } from "react";
import Link from "next/link";
import type { CerapanRecord } from "@/lib/types/cerapan";
import { SUB_STANDARDS } from "@/lib/scoring/standard4";
import { compactUlasanText, formatTarikh } from "@/lib/utils";
import { ArrowLeft, Download, PlusCircle, Printer } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { MaklumBalasHeader } from "./MaklumBalasHeader";

interface Props {
  record: CerapanRecord;
}

export function BorangMaklumBalas({ record }: Props) {
  const { isAdmin } = useAuth();
  const ref = useRef<HTMLDivElement>(null);

  async function handlePdf() {
    const el = ref.current;
    if (!el) return;
    const html2pdf = (await import("html2pdf.js")).default;
    await html2pdf()
      .set({
        margin: [8, 8, 8, 8],
        filename: `maklum-balas-${record.namaGuru.replace(/\s+/g, "-")}-${record.tarikh}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(el)
      .save();
  }

  const dapatan = record.dapatanPencerap ?? {};
  const langkah = record.langkahPenambahbaikan ?? {};

  return (
    <div>
      <div className="no-print mb-4 flex flex-wrap items-center gap-2">
        <Link
          href={`/cerapan/${record.id}/laporan`}
          className="inline-flex items-center gap-2 rounded-full border border-stone bg-paper-card px-4 py-2 text-sm font-medium text-ink-2 shadow-soft transition hover:bg-stone-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Laporan
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-full border border-stone bg-paper-card px-4 py-2 text-sm font-medium text-ink-2 shadow-soft transition hover:bg-stone-2"
        >
          <Printer className="h-4 w-4" />
          Cetak Borang
        </button>
        <button
          type="button"
          onClick={handlePdf}
          className="inline-flex items-center gap-2 rounded-full border border-stone bg-paper-card px-4 py-2 text-sm font-medium text-ink-2 shadow-soft transition hover:bg-stone-2"
        >
          <Download className="h-4 w-4" />
          Muat Turun PDF
        </button>
        {isAdmin && (
          <Link
            href="/cerapan/baharu"
            className="ml-auto inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:opacity-90"
          >
            <PlusCircle className="h-4 w-4" />
            PENCERAPAN BARU
          </Link>
        )}
      </div>

      <div ref={ref} className="maklum-balas-formal">
        <MaklumBalasHeader namaSekolah={record.namaSekolah} />

        <table className="mb-meta-table">
          <tbody>
            <tr>
              <td className="mb-meta-label">NAMA SEKOLAH</td>
              <td className="mb-meta-value">: {record.namaSekolah}</td>
              <td className="mb-meta-label">KOD SEKOLAH</td>
              <td className="mb-meta-value">: {record.kodSekolah}</td>
            </tr>
            <tr>
              <td className="mb-meta-label">NAMA GURU</td>
              <td className="mb-meta-value">: {record.namaGuru}</td>
              <td className="mb-meta-label">TARIKH</td>
              <td className="mb-meta-value">: {formatTarikh(record.tarikh)}</td>
            </tr>
            <tr>
              <td className="mb-meta-label">TAHUN/KELAS YANG DICERAP</td>
              <td className="mb-meta-value">: {record.kelas}</td>
              <td className="mb-meta-label">BIL. DICERAP</td>
              <td className="mb-meta-value">: {record.sesiPengisian}</td>
            </tr>
            <tr>
              <td className="mb-meta-label">MATA PELAJARAN</td>
              <td className="mb-meta-value">: {record.mataPelajaran}</td>
              <td className="mb-meta-label">PENCERAP</td>
              <td className="mb-meta-value">: {record.namaPemerhati || "—"}</td>
            </tr>
          </tbody>
        </table>

        {record.ulasanPencerapan?.trim() && (
          <div className="mb-ulasan-umum">
            <p className="mb-section-label">Ulasan Pencerapan:</p>
            <p className="mb-ulasan-text ulasan-text-wrap">
              {compactUlasanText(record.ulasanPencerapan)}
            </p>
          </div>
        )}

        <table className="mb-aspek-table">
          <thead>
            <tr>
              <th className="mb-col-no">NO.</th>
              <th className="mb-col-aspek">ASPEK</th>
              <th className="mb-col-dapatan">DAPATAN PENCERAP</th>
              <th className="mb-col-langkah">
                LANGKAH PENAMBAHBAIKAN
                <br />
                <span className="mb-th-note">(diisi oleh guru yang dicerap)</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {SUB_STANDARDS.map((sub, i) => (
              <tr key={sub.code}>
                <td className="text-center">{i + 1}</td>
                <td>
                  <strong>{sub.code}</strong> {sub.title}
                </td>
                <td className="mb-cell-dapatan">
                  {dapatan[sub.code]?.trim()
                    ? compactUlasanText(dapatan[sub.code])
                    : "\u00a0"}
                </td>
                <td className="mb-cell-langkah ulasan-text-wrap">
                  {langkah[sub.code]?.trim()
                    ? compactUlasanText(langkah[sub.code])
                    : "\u00a0"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mb-tindak-lanjut">
          <strong>Cadangan tarikh pemantauan tindak lanjut</strong>
          {" : "}
          {record.tarikhTindakLanjut
            ? formatTarikh(record.tarikhTindakLanjut)
            : "........................................"}
        </p>

        <table className="mb-sig-table">
          <tbody>
            <tr>
              <td>
                <p className="mb-sig-label">Tandatangan Pencerap</p>
                <div className="mb-sig-line" />
                <p className="mb-sig-name">{record.namaPemerhati || ""}</p>
              </td>
              <td>
                <p className="mb-sig-label">Tandatangan Yang Dicerap</p>
                <div className="mb-sig-line" />
                <p className="mb-sig-name">{record.namaGuru}</p>
              </td>
            </tr>
          </tbody>
        </table>

        <p className="mb-footer">
          Borang dijana secara digital · {formatTarikh(record.updatedAt)}
        </p>
      </div>
    </div>
  );
}