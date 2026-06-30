"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { BorangMaklumBalas } from "@/components/laporan/BorangMaklumBalas";
import { getCerapan } from "@/lib/storage";
import type { CerapanRecord } from "@/lib/types/cerapan";

export default function MaklumBalasPage() {
  const { id } = useParams<{ id: string }>();
  const [record, setRecord] = useState<CerapanRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getCerapan(id)
      .then(setRecord)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <p className="text-muted">Memuatkan borang…</p>;
  }

  if (!record) {
    return (
      <div className="rounded-2xl border border-stone bg-paper-card p-8 text-center shadow-soft">
        <p className="text-muted">Rekod tidak dijumpai.</p>
        <Link
          href="/rekod/laporan-individu"
          className="mt-4 inline-block text-sm font-semibold text-accent"
        >
          ← Kembali ke Laporan Individu
        </Link>
      </div>
    );
  }

  return <BorangMaklumBalas record={record} />;
}