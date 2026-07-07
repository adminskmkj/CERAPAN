"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Archive,
  ChevronDown,
  Eye,
  PlusCircle,
  Pencil,
  Search,
  Trash2,
  UserPen,
} from "lucide-react";
import {
  JENIS_KENDIRI,
  JENIS_PENCERAPAN_1,
  JENIS_PENCERAPAN_2,
  getSenaraiEmptyState,
  groupCerapanByGuru,
  jenisCerapanBadgeClass,
  jenisCerapanLabel,
  jenisOrderForFilter,
  recordsForJenisInGroup,
} from "@/lib/cerapan/jenis";
import { NAMA_SEKOLAH } from "@/lib/data/sekolah";
import { deleteCerapan, searchCerapan } from "@/lib/storage";
import { SESI_PENGISIAN, getTarafColor } from "@/lib/scoring/standard4";
import { useAuth } from "@/contexts/AuthContext";
import { cn, formatTarikh } from "@/lib/utils";

const JENIS_TABS = [
  { value: "", label: "Semua" },
  { value: JENIS_KENDIRI, label: "Kendiri" },
  { value: JENIS_PENCERAPAN_1, label: "Pencerapan 1" },
  { value: JENIS_PENCERAPAN_2, label: "Pencerapan 2" },
] as const;

function LaporanIndividuSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-10 w-80 rounded-full bg-stone-2" />
      <div className="h-24 rounded-2xl bg-stone-2" />
      <div className="space-y-3">
        <div className="h-16 rounded-2xl bg-stone-2" />
        <div className="h-16 rounded-2xl bg-stone-2" />
        <div className="h-16 rounded-2xl bg-stone-2" />
      </div>
    </div>
  );
}

export default function LaporanIndividuPage() {
  const { isAdmin, isKetuaPanitia, canDeleteCerapanRecord, canModifyCerapanRecord } =
    useAuth();
  const isStaff = isAdmin || isKetuaPanitia;
  const [records, setRecords] = useState<Awaited<ReturnType<typeof searchCerapan>>>([]);
  const [loading, setLoading] = useState(true);
  const [namaGuru, setNamaGuru] = useState("");
  const [taraf, setTaraf] = useState("");
  const [jenis, setJenis] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await searchCerapan({
      namaGuru: namaGuru || undefined,
      taraf: taraf || undefined,
      sesiPengisian: jenis || undefined,
    });
    setRecords(data);
    setLoading(false);
  }, [namaGuru, taraf, jenis]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const guruGroups = useMemo(() => groupCerapanByGuru(records), [records]);
  const jenisRows = useMemo(() => jenisOrderForFilter(jenis), [jenis]);
  const emptyState = useMemo(
    () =>
      getSenaraiEmptyState(jenis, {
        isPentadbir: isAdmin,
        isKetuaPanitia,
      }),
    [jenis, isAdmin, isKetuaPanitia]
  );

  useEffect(() => {
    if (expanded && !guruGroups.some((g) => g.key === expanded)) {
      setExpanded(null);
    }
  }, [expanded, guruGroups]);

  async function handleDelete(id: string) {
    if (confirm("Padam rekod pencerapan ini?")) {
      await deleteCerapan(id);
      refresh();
    }
  }

  function toggleGuru(key: string) {
    setExpanded((current) => (current === key ? null : key));
  }

  if (loading) return <LaporanIndividuSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-stone bg-paper-card px-4 py-3 shadow-soft">
        <p className="text-sm text-muted">
          {guruGroups.length} guru · {records.length} rekod · {NAMA_SEKOLAH}
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href="/cerapan/kendiri" className="premium-btn-secondary">
            <UserPen className="h-4 w-4" strokeWidth={1.5} />
            Pencerapan Kendiri
          </Link>
          {isAdmin && (
            <Link href="/cerapan/baharu" className="premium-btn-primary">
              <PlusCircle className="h-4 w-4" strokeWidth={1.5} />
              Isi Pencerapan
            </Link>
          )}
          {isKetuaPanitia && !isAdmin && (
            <Link href="/cerapan/baharu" className="premium-btn-primary">
              <PlusCircle className="h-4 w-4" strokeWidth={1.5} />
              Isi Pencerapan
            </Link>
          )}
        </div>
      </div>

      <div className="premium-tabs">
        {JENIS_TABS.map((tab) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => setJenis(tab.value)}
            className={cn(
              "premium-tab",
              jenis === tab.value ? "premium-tab--active" : "premium-tab--idle"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="premium-filter grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="text-sm sm:col-span-2 lg:col-span-1">
          <span className="font-medium text-ink-2">Cari Nama Guru</span>
          <div className="relative mt-1.5">
            <Search
              className="absolute left-3 top-2.5 h-4 w-4 text-muted"
              strokeWidth={1.5}
            />
            <input
              value={namaGuru}
              onChange={(e) => setNamaGuru(e.target.value)}
              className="w-full rounded-xl border border-stone bg-white py-2.5 pl-9 pr-3 text-sm shadow-sm"
              placeholder="Nama guru…"
            />
          </div>
        </label>
        <label className="text-sm">
          <span className="font-medium text-ink-2">Taraf PdP</span>
          <select
            value={taraf}
            onChange={(e) => setTaraf(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-stone bg-white px-3 py-2.5 text-sm shadow-sm"
          >
            <option value="">Semua</option>
            <option value="CEMERLANG">CEMERLANG</option>
            <option value="BAIK">BAIK</option>
            <option value="SEDERHANA">SEDERHANA</option>
            <option value="PERLU TINDAKAN SEGERA">PERLU TINDAKAN SEGERA</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="font-medium text-ink-2">Jenis Pencerapan</span>
          <select
            value={jenis}
            onChange={(e) => setJenis(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-stone bg-white px-3 py-2.5 text-sm shadow-sm"
          >
            <option value="">Semua jenis</option>
            {SESI_PENGISIAN.map((s) => (
              <option key={s} value={s}>
                {jenisCerapanLabel(s)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {guruGroups.length === 0 ? (
        <div className="dash-empty">
          <Archive className="mx-auto h-8 w-8 text-muted" strokeWidth={1.25} />
          <p className="mt-4 text-sm text-muted">{emptyState.message}</p>
          {emptyState.hint && (
            <p className="mt-2 text-sm text-ink-2">{emptyState.hint}</p>
          )}
          {emptyState.action && (
            <Link
              href={emptyState.action.href}
              className="premium-btn-primary mt-5"
            >
              {emptyState.action.label}
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {guruGroups.map((group, i) => {
            const isOpen = expanded === group.key;
            const filledCount = jenisRows.filter(
              (j) => recordsForJenisInGroup(group, j).length > 0
            ).length;

            return (
              <div key={group.key} className="premium-accordion">
                <button
                  type="button"
                  onClick={() => toggleGuru(group.key)}
                  aria-expanded={isOpen}
                  className="premium-accordion-trigger"
                >
                  <span className="font-mono text-xs text-muted">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="min-w-0 flex-1 truncate text-base font-semibold text-ink">
                    {group.namaGuru}
                  </p>
                  <span className="hidden rounded-full border border-stone bg-white px-2.5 py-0.5 text-[10px] font-semibold text-muted sm:inline">
                    {filledCount}/{jenisRows.length}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 text-muted transition-transform duration-200",
                      isOpen && "rotate-180"
                    )}
                    strokeWidth={1.5}
                  />
                </button>

                {isOpen && (
                  <div className="premium-accordion-body sm:px-5">
                    <div className="space-y-2">
                      {jenisRows.flatMap((jenisKey) => {
                        const rows = recordsForJenisInGroup(group, jenisKey);
                        if (rows.length === 0) {
                          return (
                            <div
                              key={jenisKey}
                              className={cn(
                                "premium-jenis-row",
                                "premium-jenis-row--empty"
                              )}
                            >
                              <span
                                className={cn(
                                  "min-w-[7.5rem] rounded-full border px-2.5 py-0.5 text-center text-xs font-semibold",
                                  jenisCerapanBadgeClass(jenisKey)
                                )}
                              >
                                {jenisCerapanLabel(jenisKey)}
                              </span>
                              <p className="flex-1 text-sm text-muted">
                                Belum diisi
                              </p>
                            </div>
                          );
                        }
                        return rows.map((record) => (
                          <div
                            key={`${jenisKey}-${record.id}`}
                            className="premium-jenis-row"
                          >
                            <span
                              className={cn(
                                "min-w-[7.5rem] rounded-full border px-2.5 py-0.5 text-center text-xs font-semibold",
                                jenisCerapanBadgeClass(jenisKey)
                              )}
                            >
                              {jenisCerapanLabel(jenisKey)}
                            </span>
                            <div className="min-w-0 flex-1 text-sm">
                              <p className="text-ink-2">
                                {record.mataPelajaran} · {record.kelas}
                                {record.namaPemerhati
                                  ? ` · ${record.namaPemerhati}`
                                  : ""}
                              </p>
                              <p className="text-xs text-muted">
                                {formatTarikh(record.tarikh)}
                              </p>
                            </div>
                            <p className="font-mono text-sm font-semibold text-ink">
                              {record.result.jumlahSkor}
                            </p>
                            <span
                              className={cn(
                                "rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                                getTarafColor(record.result.taraf)
                              )}
                            >
                              {record.result.taraf}
                            </span>
                            <div className="flex gap-2">
                              {canModifyCerapanRecord(record) && (
                                <Link
                                  href={`/cerapan/${record.id}/ubah`}
                                  className="inline-flex items-center gap-1 rounded-lg border border-stone bg-white px-2.5 py-1.5 text-xs font-medium text-ink-2 shadow-sm transition hover:border-accent/30 hover:text-accent"
                                >
                                  <Pencil
                                    className="h-3.5 w-3.5"
                                    strokeWidth={1.5}
                                  />
                                  Ubah
                                </Link>
                              )}
                              <Link
                                href={`/cerapan/${record.id}/laporan`}
                                className="inline-flex items-center gap-1 rounded-lg border border-stone bg-white px-2.5 py-1.5 text-xs font-medium text-ink-2 shadow-sm transition hover:border-accent/30 hover:text-accent"
                              >
                                <Eye
                                  className="h-3.5 w-3.5"
                                  strokeWidth={1.5}
                                />
                                Laporan
                              </Link>
                              {canDeleteCerapanRecord(record) && (
                                <button
                                  type="button"
                                  aria-label="Padam rekod pencerapan"
                                  onClick={() => handleDelete(record.id)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-stone bg-white px-2.5 py-1.5 text-xs font-medium text-red-700 shadow-sm transition hover:border-red-200 hover:bg-red-50"
                                >
                                  <Trash2
                                    className="h-3.5 w-3.5"
                                    strokeWidth={1.5}
                                  />
                                </button>
                              )}
                            </div>
                          </div>
                        ));
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}