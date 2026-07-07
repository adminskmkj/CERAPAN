"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ADMIN_EMAIL } from "@/lib/auth/constants";

function LogMasukForm() {
  const { signIn, isCloudMode } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";

  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isCloudMode) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-stone bg-paper-card p-8 text-center shadow-soft">
        <h1 className="text-xl font-semibold text-ink">Mod Demo</h1>
        <p className="mt-3 text-sm text-muted">
          Log masuk memerlukan Supabase. Mod demo hanya untuk lihat rekod
          tempatan.
        </p>
        <Link
          href="/rekod/laporan-individu"
          className="mt-6 inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white"
        >
          Lihat Rekod
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn(email.trim(), password);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if (result.mustChangePassword) {
      router.push("/tukar-kata-laluan");
      router.refresh();
      return;
    }

    router.push(redirect);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border border-stone bg-paper-card p-8 shadow-soft">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-accent">
          <Lock className="h-5 w-5" strokeWidth={1.5} />
        </div>
        <h1 className="mt-5 text-2xl">Log Masuk</h1>
        <p className="mt-1 text-sm text-muted">
          Pentadbir: isi pencerapan 1 & 2, ubah/padam semua rekod. Ketua Panitia:
          isi pencerapan 1 atau 2 dalam panitia sendiri sahaja. Guru: isi kendiri
          baharu & lihat laporan tanpa log masuk — ubah rekod melalui pentadbir.
        </p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="font-medium text-ink-2">E-mel</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-stone px-3 py-2.5 text-sm"
              placeholder={ADMIN_EMAIL}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-ink-2">Kata Laluan</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-stone px-3 py-2.5 text-sm"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-accent py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Sedang log masuk…" : "Log Masuk"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted">
          Pentadbir & Ketua Panitia · Guru tanpa log masuk (kendiri)
        </p>
      </div>

      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-accent"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Utama
      </Link>
    </div>
  );
}

export default function LogMasukPage() {
  return (
    <Suspense fallback={<p className="text-muted">Memuatkan…</p>}>
      <LogMasukForm />
    </Suspense>
  );
}