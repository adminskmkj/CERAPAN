"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function LogMasukPage() {
  const { signIn, isCloudMode, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (authLoading) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-slate-500">Memuatkan...</p>
      </div>
    );
  }

  if (!isCloudMode) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Mod Demo</h1>
        <p className="mt-3 text-sm text-slate-600">
          Supabase belum dikonfigurasi. Aplikasi berjalan dalam mod demo dengan
          simpanan tempatan (localStorage).
        </p>
        <Link
          href="/cerapan/baharu"
          className="mt-6 inline-block rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white"
        >
          Teruskan Tanpa Log Masuk
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

    router.push(redirect);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Log Masuk</h1>
        <p className="mt-1 text-sm text-slate-500">
          CERAPAN Standard 4 PdP — Akaun Pentadbir
        </p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="font-medium text-slate-700">E-mel</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5"
              placeholder="nama@sekolah.edu.my"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Kata Laluan</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand-700 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Sedang log masuk..." : "Log Masuk"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Akaun dicipta oleh Pentadbir. Tiada pendaftaran awam.
        </p>
      </div>
    </div>
  );
}