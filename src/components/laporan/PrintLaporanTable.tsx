"use client";

import {
  DOMAIN_ASPEK,
  fmtPct,
  type PrintLaporanRow,
} from "@/lib/analytics/print-laporan";
import { excelHorizontalCellClass } from "@/lib/analytics/aspek";
import { jenisCerapanLabel } from "@/lib/cerapan/jenis";
import { NAMA_SEKOLAH } from "@/lib/data/sekolah";
import { getTarafColor } from "@/lib/scoring/standard4";
import { cn } from "@/lib/utils";

interface Props {
  jenis: string;
  rows: PrintLaporanRow[];
  generatedAt?: string;
}

export function PrintLaporanTable({ jenis, rows, generatedAt }: Props) {
  const filled = rows.filter((r) => r.hasRecord).length;
  const label = jenisCerapanLabel(jenis).toUpperCase();

  return (
    <section className="print-laporan-section">
      <header className="print-laporan-head">
        <div>
          <p className="print-laporan-eyebrow">Laporan Pencerapan Standard 4</p>
          <h2 className="print-laporan-title">{label}</h2>
          <p className="print-laporan-meta">
            {NAMA_SEKOLAH} · {filled} / {rows.length} guru mempunyai rekod
            {generatedAt ? ` · ${generatedAt}` : ""}
          </p>
        </div>
      </header>

      <table className="print-laporan-table w-full">
        <thead>
          <tr>
            <th className="print-laporan-th print-laporan-th--nama">Nama Guru</th>
            <th className="print-laporan-th">Kelas</th>
            <th className="print-laporan-th">Mata Pelajaran</th>
            <th className="print-laporan-th print-laporan-th--pentadbir">
              Nama Pencerap
            </th>
            {DOMAIN_ASPEK.map((d) => (
              <th key={d} className="print-laporan-th print-laporan-th--pct">
                {d}
              </th>
            ))}
            <th className="print-laporan-th print-laporan-th--status">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={`${row.namaGuru}-${row.namaPentadbir}-${i}`}
              className={cn(!row.hasRecord && "print-laporan-row--empty")}
            >
              <td className="print-laporan-td print-laporan-td--nama">
                <span className="print-laporan-no">{i + 1}.</span>
                {row.namaGuru}
              </td>
              <td className="print-laporan-td">{row.kelas}</td>
              <td className="print-laporan-td">{row.mataPelajaran}</td>
              <td className="print-laporan-td print-laporan-td--pentadbir">
                {row.namaPentadbir}
              </td>
              {DOMAIN_ASPEK.map((domain) => {
                const pct = row.domainPct[domain];
                const hasData = pct !== null;
                return (
                  <td
                    key={domain}
                    className={cn(
                      "print-laporan-td print-laporan-td--pct text-center font-mono text-xs",
                      row.hasRecord &&
                        excelHorizontalCellClass(pct ?? 0, hasData)
                    )}
                  >
                    {fmtPct(pct)}
                  </td>
                );
              })}
              <td className="print-laporan-td print-laporan-td--status text-center">
                {row.status ? (
                  <span
                    className={cn(
                      "inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold",
                      getTarafColor(row.status)
                    )}
                  >
                    {row.status === "PERLU TINDAKAN SEGERA"
                      ? "PTPS"
                      : row.status}
                  </span>
                ) : (
                  "—"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}