"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { KP_PASSWORD_MIN_LENGTH, KP_TEMP_PASSWORD } from "@/lib/auth/constants";

export default function TukarKataLaluanPage() {
  const { user, mustChangePassword, loading, signOut, refreshRole, appRole } =
    useAuth();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/log-masuk?redirect=/tukar-kata-laluan");
      return;
    }
    if (!mustChangePassword) {
      router.replace("/dashboard");
      return;
    }
    setReady(true);
  }, [loading, user, mustChangePassword, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch("/api/auth/tukar-kata-laluan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, confirm }),
    });
    const json = (await res.json()) as { error?: string; ok?: boolean };

    if (!res.ok) {
      setError(json.error ?? "Gagal menukar kata laluan");
      setSaving(false);
      return;
    }

    await refreshRole();
    router.push(
      appRole === "ketua_panitia" ? "/cerapan/baharu" : "/dashboard"
    );
    router.refresh();
  }

  if (loading || !ready) {
    return <p className="text-muted">Memuatkan…</p>;
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-8 shadow-soft">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-800">
          <KeyRound className="h-5 w-5" strokeWidth={1.5} />
        </div>
        <h1 className="mt-5 text-2xl text-ink">Tukar kata laluan</h1>
        <p className="mt-2 text-sm text-ink-2">
          Anda menggunakan kata laluan sementara ({KP_TEMP_PASSWORD}). Wajib
          tetapkan kata laluan baharu (minimum {KP_PASSWORD_MIN_LENGTH} aksara)
          sebelum meneruskan.
        </p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="font-medium text-ink-2">Kata laluan baharu</span>
            <input
              type="password"
              required
              minLength={KP_PASSWORD_MIN_LENGTH}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-stone px-3 py-2.5 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-ink-2">Sahkan kata laluan</span>
            <input
              type="password"
              required
              minLength={KP_PASSWORD_MIN_LENGTH}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-stone px-3 py-2.5 text-sm"
            />
          </label>
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-full bg-accent py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Menyimpan…" : "Simpan & teruskan"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => signOut()}
          className="mt-4 w-full text-center text-xs text-muted underline"
        >
          Log keluar
        </button>
      </div>
    </div>
  );
}