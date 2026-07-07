"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { UbahCerapanEntry } from "@/components/cerapan/UbahCerapanEntry";
import { useAuth } from "@/contexts/AuthContext";
import { getCerapan } from "@/lib/storage";
import type { CerapanRecord } from "@/lib/types/cerapan";

export default function UbahCerapanPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { canModifyCerapanRecord, loading: authLoading } = useAuth();
  const [record, setRecord] = useState<CerapanRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getCerapan(id)
      .then(setRecord)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (authLoading || loading || !record || !id) return;
    if (!canModifyCerapanRecord(record)) {
      router.replace(`/log-masuk?redirect=/cerapan/${id}/ubah`);
    }
  }, [authLoading, loading, record, id, canModifyCerapanRecord, router]);

  if (loading || authLoading) {
    return <p className="text-muted">Memuatkan borang ubah…</p>;
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

  if (!canModifyCerapanRecord(record)) {
    return <p className="text-muted">Mengalihkan ke log masuk…</p>;
  }

  return <UbahCerapanEntry record={record} />;
}