"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, ClipboardList, PlusCircle, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { listCerapan } from "@/lib/storage";
import { computeStats } from "@/lib/storage/cerapan-supabase";
import type { DashboardStats } from "@/lib/storage/cerapan-supabase";
import { getTarafColor, type Taraf } from "@/lib/scoring/standard4";
import { cn } from "@/lib/utils";

const TARAF_BAR: Record<Taraf, string> = {
  CEMERLANG: "bg-green-500",
  BAIK: "bg-blue-600",
  SEDERHANA: "bg-amber-500",
  "PERLU TINDAKAN SEGERA": "bg-red-600",
};

export default function DashboardPage() {
  const { profile, isCloudMode, isAdmin } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listCerapan()
      .then((records) => setStats(computeStats(records)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-slate-500">Memuatkan dashboard...</p>;
  }

  const s = stats ?? {
    total: 0,
    byTaraf: {},
    bySekolah: [],
    purataSkor: 0,
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            {profile
              ? `Selamat datang, ${profile.fullName}`
              : isCloudMode
                ? "Sila log masuk"
                : "Mod demo — simpanan tempatan"}
          </p>
        </div>
        <Link
          href="/cerapan/baharu"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white"
        >
          <PlusCircle className="h-4 w-4" />
          Cerapan Baharu
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600">Jumlah Cerapan</p>
            <ClipboardList className="h-5 w-5 text-slate-400" />
          </div>
          <p className="mt-2 text-3xl font-bold">{s.total}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600">Purata Skor</p>
            <BarChart3 className="h-5 w-5 text-slate-400" />
          </div>
          <p className="mt-2 text-3xl font-bold">{s.purataSkor}%</p>
        </div>
        <div className="taraf-cemerlang rounded-2xl border p-5 shadow-sm">
          <p className="text-sm font-medium">CEMERLANG</p>
          <p className="mt-2 text-3xl font-bold">{s.byTaraf.CEMERLANG ?? 0}</p>
        </div>
        <div className="taraf-ptps rounded-2xl border p-5 shadow-sm">
          <p className="text-sm font-medium">PTPS</p>
          <p className="mt-2 text-3xl font-bold">
            {s.byTaraf["PERLU TINDAKAN SEGERA"] ?? 0}
          </p>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">Taburan Taraf PdP</h2>
          <div className="mt-4 space-y-3">
            {(
              ["CEMERLANG", "BAIK", "SEDERHANA", "PERLU TINDAKAN SEGERA"] as const
            ).map((taraf) => {
              const count = s.byTaraf[taraf] ?? 0;
              const pct = s.total ? Math.round((count / s.total) * 100) : 0;
              return (
                <div key={taraf}>
                  <div className="flex justify-between text-sm">
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-xs font-semibold",
                        getTarafColor(taraf)
                      )}
                    >
                      {taraf}
                    </span>
                    <span className="text-slate-500">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={cn("h-full rounded-full", TARAF_BAR[taraf])}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">Cerapan Mengikut Sekolah</h2>
          {s.bySekolah.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">Tiada data lagi.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {s.bySekolah.slice(0, 8).map((sk) => (
                <li
                  key={sk.kod}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2 text-sm"
                >
                  <span>
                    <span className="font-medium">{sk.nama}</span>
                    <span className="ml-2 text-slate-400">{sk.kod}</span>
                  </span>
                  <span className="font-bold text-brand-700">{sk.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {isAdmin && (
        <Link
          href="/pentadbir/pengguna"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium shadow-sm hover:bg-slate-50"
        >
          <Users className="h-4 w-4" />
          Urus Pengguna
        </Link>
      )}
    </div>
  );
}