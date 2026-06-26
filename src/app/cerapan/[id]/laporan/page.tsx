"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { LaporanGuru } from "@/components/laporan/LaporanGuru";
import { getCerapan } from "@/lib/storage";
import type { CerapanRecord } from "@/lib/types/cerapan";

export default function LaporanPage() {
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
    return <p className="text-slate-500">Memuatkan laporan...</p>;
  }

  if (!record) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-600">Rekod tidak dijumpai.</p>
        <Link href="/senarai" className="mt-4 inline-block text-brand-700">
          Kembali ke senarai
        </Link>
      </div>
    );
  }

  return <LaporanGuru record={record} />;
}