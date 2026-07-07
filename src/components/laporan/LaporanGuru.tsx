"use client";

import { useRef } from "react";
import Link from "next/link";
import type { CerapanRecord } from "@/lib/types/cerapan";
import { SUB_STANDARDS } from "@/lib/scoring/standard4";
import { jenisCerapanLabel } from "@/lib/cerapan/jenis";
import { compactUlasanText, formatTarikh } from "@/lib/utils";
import {
  BarChart3,
  Download,
  FileText,
  Pencil,
  PlusCircle,
  Printer,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { MaklumBalasHeader } from "./MaklumBalasHeader";

interface Props {
  record: CerapanRecord;
}

export function LaporanGuru({ record }: Props) {
  const { isAdmin, isKetuaPanitia, canModifyCerapanRecord } = useAuth();
  const bolehUbah = canModifyCerapanRecord({
    sesiPengisian: record.sesiPengisian,
    createdBy: record.createdBy,
    panitiaKp: record.panitiaKp,
    mataPelajaran: record.mataPelajaran,
  });
  const ref = useRef<HTMLDivElement>(null);

  const dapatan = record.dapatanPencerap ?? {};
  const langkah = record.langkahPenambahbaikan ?? {};
  const adaUlasan =
    Boolean(record.ulasanPencerapan?.trim()) ||
    Object.values(dapatan).some((v) => v?.trim()) ||
    Object.values(langkah).some((v) => v?.trim());

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
        pagebreak: { mode: ["css", "legacy"], before: ".laporan-ulasan-section" },
      })
      .from(el)
      .save();
  }

  return (
    <div>
      <div className="no-print mb-4 flex flex-wrap items-center gap-2">
        {(isAdmin || isKetuaPanitia) && (
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-stone bg-paper-card px-4 py-2 text-sm font-medium text-ink-2 shadow-soft transition hover:bg-stone-2"
          >
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </Link>
        )}
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-full border border-stone bg-paper-card px-4 py-2 text-sm font-medium text-ink-2 shadow-soft transition hover:bg-stone-2"
        >
          <Printer className="h-4 w-4" />
          Cetak Laporan
        </button>
        <button
          type="button"
          onClick={handlePdf}
          className="inline-flex items-center gap-2 rounded-full border border-stone bg-paper-card px-4 py-2 text-sm font-medium text-ink-2 shadow-soft transition hover:bg-stone-2"
        >
          <Download className="h-4 w-4" />
          Muat Turun PDF
        </button>
        <Link
          href={`/cerapan/${record.id}/maklum-balas`}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:opacity-90"
        >
          <FileText className="h-4 w-4" />
          Maklum Balas Pencerapan
        </Link>
        {bolehUbah && (
          <Link
            href={`/cerapan/${record.id}/ubah`}
            className="inline-flex items-center gap-2 rounded-full border border-accent bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:opacity-90"
          >
            <Pencil className="h-4 w-4" />
            Ubah Pencerapan
          </Link>
        )}
        {isAdmin && (
          <Link
            href="/cerapan/baharu"
            className="inline-flex items-center gap-2 rounded-full border border-accent bg-paper-card px-5 py-2.5 text-sm font-semibold text-accent shadow-soft transition hover:bg-accent-soft"
          >
            <PlusCircle className="h-4 w-4" />
            Pencerapan Baru
          </Link>
        )}
      </div>

      <div ref={ref} className="laporan-formal">
        <div className="laporan-formal-header">
          <p className="laporan-formal-org">SKPM KUALITI@SEKOLAH</p>
          <h1 className="laporan-formal-title">TAPAK STANDARD 4</h1>
          <p className="laporan-formal-sub">
            PEMBELAJARAN DAN PEMUDAHCARAAN (PdPc) — LAPORAN PENCERAPAN
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
              <td className="lf-label">Jenis Pencerapan</td>
              <td className="lf-value">
                {jenisCerapanLabel(record.sesiPengisian)}
              </td>
            </tr>
            <tr>
              <td className="lf-label">Tarikh</td>
              <td className="lf-value">{formatTarikh(record.tarikh)}</td>
              <td className="lf-label">Kalendar Akademik</td>
              <td className="lf-value">{record.kalendarAkademik}</td>
            </tr>
            <tr>
              <td className="lf-label">Pencerap</td>
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

        <div className="laporan-ulasan-section">
          <MaklumBalasHeader namaSekolah={record.namaSekolah} />

          {record.ulasanPencerapan?.trim() && (
            <div className="laporan-ulasan-umum">
              <p className="laporan-ulasan-label">Ulasan Pencerapan:</p>
              <p className="laporan-ulasan-text ulasan-text-wrap">
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
                  <td className="mb-cell-aspek">
                    <strong>{sub.code}</strong> {sub.title}
                  </td>
                  <td className="mb-cell-dapatan">
                    {dapatan[sub.code]?.trim()
                      ? compactUlasanText(dapatan[sub.code])
                      : adaUlasan
                        ? "—"
                        : "\u00a0"}
                  </td>
                  <td className="mb-cell-langkah ulasan-text-wrap">
                    {langkah[sub.code]?.trim()
                      ? compactUlasanText(langkah[sub.code])
                      : adaUlasan
                        ? "—"
                        : "\u00a0"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!adaUlasan && (
            <p className="laporan-ulasan-kosong">
              Tiada ulasan direkodkan untuk pencerapan ini.
            </p>
          )}

          <p className="mb-tindak-lanjut">
            <strong>Cadangan tarikh pemantauan tindak lanjut</strong>
            {" : "}
            {record.tarikhTindakLanjut
              ? formatTarikh(record.tarikhTindakLanjut)
              : "........................................"}
          </p>

          <table className="laporan-formal-table laporan-formal-tandatangan">
            <tbody>
              <tr>
                <td className="w-1/2 align-bottom">
                  <p className="lf-sig-label">Tandatangan Pencerap</p>
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
    </div>
  );
}