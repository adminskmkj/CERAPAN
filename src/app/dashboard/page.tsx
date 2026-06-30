"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BarChart3, ClipboardList, PlusCircle, Sparkles } from "lucide-react";
import {
  ASPEK_LEMAH_THRESHOLD,
  excelHorizontalCellClass,
  excelTarafCellClass,
} from "@/lib/analytics/aspek";
import {
  ASPEK_BARIS_1,
  ASPEK_BARIS_2,
  buildJenisTotalRows,
  fmt2,
  type JenisTotalRow,
} from "@/lib/analytics/horizontal";
import {
  JENIS_ORDER,
  jenisCerapanLabel,
} from "@/lib/cerapan/jenis";
import { NAMA_SEKOLAH } from "@/lib/data/sekolah";
import { listCerapan } from "@/lib/storage";
import {
  computeStatsByJenis,
  type DashboardStats,
  type DashboardStatsByJenis,
} from "@/lib/storage/cerapan-supabase";
import { SUB_STANDARDS, getTarafColor, type Taraf } from "@/lib/scoring/standard4";
import type { CerapanRecord } from "@/lib/types/cerapan";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const ASPEK_KOLUM_SETIAP_BARIS = ASPEK_BARIS_1.length * 2;

function fmtPurata(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

const EMPTY_STATS: DashboardStats = {
  total: 0,
  byTaraf: {},
  bySekolah: [],
  purataSkor: 0,
};

function JenisAnalisisPanel({
  jenis,
  stats,
}: {
  jenis: string;
  stats: DashboardStats;
}) {
  return (
    <article className="dash-stat-card dash-stat-card--big">
      <header className="dash-stat-card-header">
        <h3 className="dash-stat-title">{jenisCerapanLabel(jenis)}</h3>
        <p className="dash-stat-subtitle">
          {stats.total > 0
            ? `${stats.total} rekod · purata ${fmtPurata(stats.purataSkor)}%`
            : "Belum ada rekod"}
        </p>
      </header>

      {stats.total === 0 ? (
        <p className="flex flex-1 items-center justify-center p-12 text-sm text-muted">
          Belum ada rekod
        </p>
      ) : (
        <>
          <div className="dash-stat-main">
            <div className="dash-stat-main-cell">
              <div className="dash-stat-label">
                <ClipboardList className="h-4 w-4" strokeWidth={1.5} />
                <span>Jumlah</span>
              </div>
              <p className="dash-stat-metric-lg">{stats.total}</p>
            </div>
            <div className="dash-stat-main-cell">
              <div className="dash-stat-label">
                <BarChart3 className="h-4 w-4" strokeWidth={1.5} />
                <span>Purata Skor</span>
              </div>
              <p className="dash-stat-metric-lg">
                {fmtPurata(stats.purataSkor)}
                <span className="dash-stat-pct">%</span>
              </p>
            </div>
          </div>

          <div className="dash-stat-taraf-row">
            <div className="dash-stat-taraf-box taraf-cemerlang">
              <p className="dash-stat-taraf-label">CEMERLANG</p>
              <p className="dash-stat-metric-lg">
                {stats.byTaraf.CEMERLANG ?? 0}
              </p>
            </div>
            <div className="dash-stat-taraf-box taraf-ptps">
              <p className="dash-stat-taraf-label">PTPS</p>
              <p className="dash-stat-metric-lg">
                {stats.byTaraf["PERLU TINDAKAN SEGERA"] ?? 0}
              </p>
            </div>
          </div>
        </>
      )}
    </article>
  );
}

function AspekCells({
  row,
  subs,
}: {
  row: JenisTotalRow;
  subs: typeof SUB_STANDARDS;
}) {
  return (
    <>
      {subs.map((sub) => {
        const cell = row.cells[sub.code];
        const hasData = Boolean(cell);
        const cellClass = excelHorizontalCellClass(cell?.pct ?? 0, hasData);
        return (
          <Fragment key={sub.code}>
            <td className={cellClass}>{cell ? fmt2(cell.skor) : "—"}</td>
            <td className={cellClass}>{cell ? fmt2(cell.pct) : "—"}</td>
          </Fragment>
        );
      })}
    </>
  );
}

function PurataAspekTable({ row }: { row: JenisTotalRow }) {
  return (
    <article className="dash-aspek-card">
      <header className="dash-aspek-head">
        <div>
          <h3 className="dash-stat-title">Purata {row.label}</h3>
          <p className="dash-stat-subtitle">
            {NAMA_SEKOLAH} · jumlah skor {fmt2(row.jumlahSkor)}
          </p>
        </div>
        <span
          className={cn(
            "dash-aspek-taraf rounded-full border px-3 py-1 text-xs font-bold",
            getTarafColor(row.taraf as Taraf)
          )}
        >
          {row.taraf}
        </span>
      </header>

      <div className="excel-premium">
        <table className="excel-horizontal excel-horizontal-fit w-full">
          <tbody>
            <tr>
              {ASPEK_BARIS_1.map((sub) => (
                <Fragment key={sub.code}>
                  <th className="excel-h-th-code">{sub.code}</th>
                  <th className="excel-h-th-pct">% {sub.code}</th>
                </Fragment>
              ))}
            </tr>
            <tr>
              <AspekCells row={row} subs={ASPEK_BARIS_1} />
            </tr>
            <tr>
              {ASPEK_BARIS_2.map((sub) => (
                <Fragment key={sub.code}>
                  <th className="excel-h-th-code">{sub.code}</th>
                  <th className="excel-h-th-pct">% {sub.code}</th>
                </Fragment>
              ))}
            </tr>
            <tr>
              <AspekCells row={row} subs={ASPEK_BARIS_2} />
            </tr>
            <tr>
              <th
                className="excel-h-th-total"
                colSpan={ASPEK_KOLUM_SETIAP_BARIS / 2}
              >
                JUMLAH SKOR
              </th>
              <th
                className="excel-h-th-taraf"
                colSpan={ASPEK_KOLUM_SETIAP_BARIS / 2}
              >
                TARAF
              </th>
            </tr>
            <tr>
              <td
                className={cn(
                  "font-bold",
                  excelHorizontalCellClass(row.jumlahSkor, true)
                )}
                colSpan={ASPEK_KOLUM_SETIAP_BARIS / 2}
              >
                {fmt2(row.jumlahSkor)}
              </td>
              <td
                className={cn("font-bold", excelTarafCellClass(row.taraf))}
                colSpan={ASPEK_KOLUM_SETIAP_BARIS / 2}
              >
                {row.taraf}
              </td>
            </tr>
          </tbody>
        </table>
        <div className="excel-horizontal-legend">
          <span>
            <i className="excel-h--ptps" /> Merah &lt;55%
          </span>
          <span>
            <i className="excel-h--amaran" /> Kuning &lt;{ASPEK_LEMAH_THRESHOLD}%
          </span>
          <span>
            <i className="excel-h--baik" /> Baik 70–84%
          </span>
          <span>
            <i className="excel-h--cemerlang" /> Cemerlang ≥85%
          </span>
        </div>
      </div>
    </article>
  );
}

function DashboardSkeleton() {
  return (
    <div className="dash-page animate-pulse space-y-8">
      <div className="dash-hero h-32" />
      <div className="h-40 rounded-2xl bg-stone-2" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="h-52 rounded-2xl bg-stone-2" />
        <div className="h-52 rounded-2xl bg-stone-2" />
        <div className="h-52 rounded-2xl bg-stone-2" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { isAdmin } = useAuth();
  const [records, setRecords] = useState<CerapanRecord[]>([]);
  const [statsByJenis, setStatsByJenis] = useState<DashboardStatsByJenis | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const jenisRows = useMemo(() => buildJenisTotalRows(records), [records]);

  useEffect(() => {
    listCerapan()
      .then((data) => {
        setRecords(data);
        setStatsByJenis(computeStatsByJenis(data));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  const totalRekod = JENIS_ORDER.reduce(
    (sum, jenis) => sum + (statsByJenis?.[jenis]?.total ?? 0),
    0
  );

  return (
    <div className="dash-page space-y-10">
      <section className="dash-hero flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="eyebrow flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-accent" strokeWidth={1.5} />
            Pemantauan Standard 4
          </p>
          <h1 className="mt-2 text-3xl md:text-[2.35rem]">Dashboard Pencerapan</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-2">
            {NAMA_SEKOLAH} · {totalRekod} rekod · purata mengikut aspek dengan
            kod warna untuk tindakan pantas
          </p>
        </div>
        {isAdmin && (
          <Link
            href="/cerapan/baharu"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-premium transition hover:-translate-y-0.5 hover:opacity-95"
          >
            <PlusCircle className="h-4 w-4" strokeWidth={1.5} />
            Pencerapan Baharu
          </Link>
        )}
      </section>

      <section className="space-y-5">
        <div className="dash-section-head">
          <div>
            <h2 className="dash-section-title">Purata Mengikut Aspek</h2>
            <p className="mt-1 text-sm text-muted">
              Layout 2 baris · purata sahaja · tiada nama guru
            </p>
          </div>
        </div>

        {jenisRows.length === 0 ? (
          <div className="dash-empty text-sm text-muted">
            Belum ada data aspek untuk dipaparkan.
          </div>
        ) : (
          <div className="space-y-5">
            {jenisRows.map((row) => (
              <PurataAspekTable key={row.jenis} row={row} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-5">
        <div className="dash-section-head">
          <div>
            <h2 className="dash-section-title">Analisis Keseluruhan</h2>
            <p className="mt-1 text-sm text-muted">
              Ringkasan statistik mengikut jenis pencerapan
            </p>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {JENIS_ORDER.map((jenis) => (
            <JenisAnalisisPanel
              key={jenis}
              jenis={jenis}
              stats={statsByJenis?.[jenis] ?? EMPTY_STATS}
            />
          ))}
        </div>
      </section>
    </div>
  );
}