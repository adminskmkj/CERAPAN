"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_LABELS, type UserRole } from "@/lib/auth/types";

interface ProfileRow {
  id: string;
  full_name: string;
  role: UserRole;
  school_id: string | null;
  created_at: string;
}

export default function PentadbirPenggunaPage() {
  const { isAdmin, isCloudMode, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    role: "cerap_officer" as UserRole,
  });

  useEffect(() => {
    if (!authLoading && isCloudMode && !isAdmin) {
      router.replace("/dashboard");
    }
  }, [authLoading, isCloudMode, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) loadUsers();
  }, [isAdmin]);

  async function loadUsers() {
    const res = await fetch("/api/admin/users");
    if (res.ok) setUsers(await res.json());
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        signal: controller.signal,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal cipta pengguna");
        return;
      }

      setSuccess(`Akaun ${data.email} berjaya dicipta.`);
      setForm({ email: "", password: "", fullName: "", role: "cerap_officer" });
      loadUsers();
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setError(
          "Masa tamat. Server mungkin sedang compile — refresh halaman dan cuba sekali lagi."
        );
      } else {
        setError("Ralat rangkaian. Semak sambungan internet dan cuba lagi.");
      }
    } finally {
      clearTimeout(timeout);
      setSubmitting(false);
    }
  }

  if (authLoading)
    return <p className="text-muted">Memuatkan…</p>;

  if (!isCloudMode) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        Panel pentadbir memerlukan Supabase. Sila konfigurasi `.env.local`
        terlebih dahulu.
      </div>
    );
  }

  if (!isAdmin) return null;

  const inputCls = "mt-1 w-full rounded-xl border border-stone px-3 py-2.5";

  return (
    <div className="space-y-10">
      <div>
        <p className="eyebrow">Pentadbir</p>
        <h1 className="mt-2 text-3xl md:text-4xl">Urus Pengguna</h1>
        <p className="mt-1 text-sm text-muted">
          Cipta akaun e-mel baharu untuk pegawai cerapan dan pentadbir.
        </p>
      </div>

      <form
        onSubmit={handleCreate}
        className="rounded-2xl border border-stone bg-paper-card p-6 shadow-soft md:p-8"
      >
        <h2 className="text-lg">Cipta Akaun Baharu</h2>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="font-medium text-ink-2">E-mel Baharu *</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputCls}
              placeholder="cerap@sekolah.edu.my"
            />
          </label>
          <label className="text-sm">
            <span className="font-medium text-ink-2">
              Kata Laluan Sementara *
            </span>
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={inputCls}
            />
          </label>
          <label className="text-sm">
            <span className="font-medium text-ink-2">Nama Penuh *</span>
            <input
              required
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className={inputCls}
            />
          </label>
          <label className="text-sm">
            <span className="font-medium text-ink-2">Peranan *</span>
            <select
              value={form.role}
              onChange={(e) =>
                setForm({ ...form, role: e.target.value as UserRole })
              }
              className={inputCls}
            >
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? "Sedang mencipta akaun…" : "Cipta Akaun"}
        </button>
        {submitting && (
          <p className="mt-2 text-xs text-muted">
            Biasanya 1–3 saat. Kali pertama mungkin ambil 10–20 saat.
          </p>
        )}
      </form>

      <div className="overflow-x-auto rounded-2xl border border-stone bg-paper-card shadow-soft">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-stone bg-stone-2 text-left text-xs uppercase tracking-wider text-muted">
              <th className="px-4 py-3 font-semibold">Nama</th>
              <th className="px-4 py-3 font-semibold">Peranan</th>
              <th className="px-4 py-3 font-semibold">Dicipta</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-stone-2 last:border-0">
                <td className="px-4 py-3 font-medium text-ink">
                  {u.full_name}
                </td>
                <td className="px-4 py-3 text-ink-2">
                  {ROLE_LABELS[u.role]}
                </td>
                <td className="px-4 py-3 font-mono text-muted">
                  {new Date(u.created_at).toLocaleDateString("ms-MY")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
