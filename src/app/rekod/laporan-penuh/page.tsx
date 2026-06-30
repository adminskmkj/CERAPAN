"use client";

import { useEffect, useMemo, useState } from "react";
import { Printer } from "lucide-react";
import { buildPrintLaporanRows } from "@/lib/analytics/print-laporan";
import {
  JENIS_KENDIRI,
  JENIS_ORDER,
  JENIS_PENCERAPAN_1,
  JENIS_PENCERAPAN_2,
  jenisCerapanLabel,
} from "@/lib/cerapan/jenis";
import { PrintLaporanTable } from "@/components/laporan/PrintLaporanTable";
import { listCerapan } from "@/lib/storage";
import type { CerapanRecord } from "@/lib/types/cerapan";
import { cn } from "@/lib/utils";

const JENIS_TABS = [
  { value: JENIS_KENDIRI, label: "Pencerapan Kendiri" },
  { value: JENIS_PENCERAPAN_1, label: "Pencerapan 1" },
  { value: JENIS_PENCERAPAN_2, label: "Pencerapan 2" },
] as const;

export default function LaporanPenuhPage() {
  const [records, setRecords] = useState<CerapanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeJenis, setActiveJenis] = useState<string>(JENIS_KENDIRI);

  useEffect(() => {
    listCerapan()
      .then(setRecords)
      .finally(() => setLoading(false));
  }, []);

  const rowsByJenis = useMemo(() => {
    const map: Record<string, ReturnType<typeof buildPrintLaporanRows>> = {};
    for (const jenis of JENIS_ORDER) {
      map[jenis] = buildPrintLaporanRows(records, jenis);
    }
    return map;
  }, [records]);

  const generatedAt = useMemo(
    () =>
      new Date().toLocaleDateString("ms-MY", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    []
  );

  if (loading) {
    return <p className="text-muted">Memuatkan laporan…</p>;
  }

  return (
    <div className="print-laporan-page space-y-5">
      <div className="no-print flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-stone bg-paper-card px-4 py-3 shadow-soft">
        <p className="text-sm text-muted">
          Jadual guru · nama pentadbir · peratus aspek 4.1–4.5 · status taraf PdP
        </p>
        <button
          type="button"
          onClick={() => window.print()}
          className="premium-btn-primary"
        >
          <Printer className="h-4 w-4" strokeWidth={1.5} />
          Cetak Semua Laporan
        </button>
      </div>

      <div className="no-print premium-tabs">
        {JENIS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveJenis(tab.value)}
            className={cn(
              "premium-tab",
              activeJenis === tab.value
                ? "premium-tab--active"
                : "premium-tab--idle"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="print-laporan-stack rounded-2xl border border-stone bg-white p-4 shadow-soft md:p-6">
        {JENIS_ORDER.map((jenis, index) => (
          <div
            key={jenis}
            className={cn(
              "print-laporan-panel",
              index > 0 && "print-laporan-panel--new-page",
              activeJenis === jenis ? "block" : "hidden print:block"
            )}
          >
            <PrintLaporanTable
              jenis={jenis}
              rows={rowsByJenis[jenis]}
              generatedAt={generatedAt}
            />
          </div>
        ))}
      </div>

      <p className="no-print text-xs text-muted">
        Pratonton skrin: tab {jenisCerapanLabel(activeJenis)}. Bila cetak, ketiga-tiga
        jenis bermula pada muka surat A4 baharu.
      </p>
    </div>
  );
}