"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, ClipboardList, PlusCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { listCerapan } from "@/lib/storage";
import {
  computeStats,
  type DashboardStats,
} from "@/lib/storage/cerapan-supabase";
import { getTarafColor, type Taraf } from "@/lib/scoring/standard4";
import { cn } from "@/lib/utils";

const TARAF_BAR: Record<Taraf, string> = {
  CEMERLANG: "bg-emerald-600",
  BAIK: "bg-accent",
  SEDERHANA: "bg-amber-600",
  "PERLU TINDAKAN SEGERA": "bg-red-700",
};

const TARAF_ORDER: Taraf[] = [
  "CEMERLANG",
  "BAIK",
  "SEDERHANA",
  "PERLU TINDAKAN SEGERA",
];

export default function DashboardPage() {
  const { profile, isAdmin } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listCerapan()
      .then((records) => setStats(computeStats(records)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <p className="text-muted">
        Memuatkan dashboard<span className="animate-pulse">…</span>
      </p>
    );
  }

  const s = stats ?? {
    total: 0,
    byTaraf: {},
    bySekolah: [],
    purataSkor: 0,
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Pemantauan</p>
          <h1 className="mt-2 text-3xl md:text-4xl">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">
            {profile
              ? `Selamat datang, ${profile.fullName}`
              : "Pemantauan cerapan guru"}
          </p>
        </div>
        <Link
          href="/cerapan/baharu"
          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:opacity-90"
        >
          <PlusCircle className="h-4 w-4" strokeWidth={1.5} />
          Cerapan Baharu
        </Link>
      </div>

      {/* Bento — stat tiles */}
      <section className="grid gap-px overflow-hidden rounded-2xl border border-stone bg-stone sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-paper-card p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">Jumlah Cerapan</p>
            <ClipboardList className="h-5 w-5 text-stone" strokeWidth={1.5} />
          </div>
          <p className="mt-3 font-serif text-5xl">{s.total}</p>
        </div>
        <div className="bg-paper-card p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">Purata Skor</p>
            <BarChart3 className="h-5 w-5 text-stone" strokeWidth={1.5} />
          </div>
          <p className="mt-3 font-serif text-5xl">
            {s.purataSkor}
            <span className="font-sans text-xl text-muted">%</span>
          </p>
        </div>
        <div className="taraf-cemerlang bg-paper-card p-6">
          <p className="text-sm">CEMERLANG</p>
          <p className="mt-3 font-serif text-5xl">
            {s.byTaraf.CEMERLANG ?? 0}
          </p>
        </div>
        <div className="taraf-ptps bg-paper-card p-6">
          <p className="text-sm">PTPS</p>
          <p className="mt-3 font-serif text-5xl">
            {s.byTaraf["PERLU TINDAKAN SEGERA"] ?? 0}
          </p>
        </div>
      </section>

      {/* Split — distribution + schools */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-stone bg-paper-card p-6 shadow-soft">
          <h2 className="text-lg">Taburan Taraf PdP</h2>
          <div className="mt-5 space-y-4">
            {TARAF_ORDER.map((taraf) => {
              const count = s.byTaraf[taraf] ?? 0;
              const pct = s.total ? Math.round((count / s.total) * 100) : 0;
              return (
                <div key={taraf}>
                  <div className="flex items-center justify-between text-sm">
                    <span
                      className={cn(
                        "rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                        getTarafColor(taraf)
                      )}
                    >
                      {taraf}
                    </span>
                    <span className="font-mono text-muted">
                      {count} <span className="text-stone">·</span> {pct}%
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-2">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        TARAF_BAR[taraf]
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-stone bg-paper-card p-6 shadow-soft">
          <h2 className="text-lg">Cerapan Mengikut Sekolah</h2>
          {s.bySekolah.length === 0 ? (
            <p className="mt-6 text-sm text-muted">Tiada data lagi.</p>
          ) : (
            <ul className="mt-5 divide-y divide-stone">
              {s.bySekolah.slice(0, 8).map((sk, i) => (
                <li
                  key={sk.kod}
                  className="flex items-center justify-between py-2.5 text-sm"
                >
                  <span className="flex items-baseline gap-3">
                    <span className="font-mono text-xs text-muted">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-medium text-ink">{sk.nama}</span>
                    <span className="font-mono text-xs text-muted">
                      {sk.kod}
                    </span>
                  </span>
                  <span className="font-mono font-semibold text-accent">
                    {sk.count}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {isAdmin && (
        <Link
          href="/pentadbir/pengguna"
          className="inline-flex items-center gap-2 rounded-full border border-stone bg-paper-card px-5 py-2.5 text-sm font-medium shadow-soft transition hover:bg-stone-2"
        >
          Urus Pengguna →
        </Link>
      )}
    </div>
  );
}
