"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import { CerapanForm } from "@/components/cerapan/CerapanForm";
import { isKendiri } from "@/lib/cerapan/jenis";
import type { CerapanRecord } from "@/lib/types/cerapan";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  record: CerapanRecord;
}

export function UbahCerapanEntry({ record }: Props) {
  const { loading } = useAuth();
  const mode = isKendiri(record.sesiPengisian) ? "kendiri" : "pencerapan";

  if (loading) {
    return (
      <div className="dash-page space-y-4">
        <p className="text-muted">Memuatkan borang ubah…</p>
      </div>
    );
  }

  return (
    <div className="dash-page space-y-6">
      <section className="no-print dash-hero">
        <p className="eyebrow flex items-center gap-2">
          <Pencil className="h-3.5 w-3.5 text-accent" strokeWidth={1.5} />
          Ubah Rekod
        </p>
        <h1 className="mt-2 text-3xl md:text-[2.35rem]">Ubah Pencerapan</h1>
        <p className="mt-2 text-sm text-muted">
          {record.namaGuru} · {record.mataPelajaran} · {record.kelas} ·{" "}
          {record.sesiPengisian}
          {record.namaPemerhati ? ` · ${record.namaPemerhati}` : ""}
        </p>
        <p className="mt-2 text-xs text-muted">
          Pentadbir sahaja.{" "}
          <Link
            href={`/cerapan/${record.id}/laporan`}
            className="text-accent underline"
          >
            Lihat laporan
          </Link>
          {" · "}
          <Link href="/rekod/laporan-individu" className="text-accent underline">
            Kembali ke rekod
          </Link>
        </p>
      </section>

      <CerapanForm mode={mode} initial={record} />
    </div>
  );
}