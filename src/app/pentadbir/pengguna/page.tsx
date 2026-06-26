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

  if (authLoading) return <p className="text-slate-500">Memuatkan...</p>;

  if (!isCloudMode) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        Panel pentadbir memerlukan Supabase. Sila konfigurasi `.env.local` terlebih dahulu.
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Urus Pengguna</h1>
        <p className="mt-1 text-sm text-slate-500">
          Cipta akaun e-mel baharu untuk pegawai cerapan dan pentadbir.
        </p>
      </div>

      <form
        onSubmit={handleCreate}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 className="font-semibold text-slate-900">Cipta Akaun Baharu</h2>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="font-medium">E-mel Baharu *</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full rounded-xl border px-3 py-2.5"
              placeholder="cerap@sekolah.edu.my"
            />
          </label>
          <label className="text-sm">
            <span className="font-medium">Kata Laluan Sementara *</span>
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-1 w-full rounded-xl border px-3 py-2.5"
            />
          </label>
          <label className="text-sm">
            <span className="font-medium">Nama Penuh *</span>
            <input
              required
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="mt-1 w-full rounded-xl border px-3 py-2.5"
            />
          </label>
          <label className="text-sm">
            <span className="font-medium">Peranan *</span>
            <select
              value={form.role}
              onChange={(e) =>
                setForm({ ...form, role: e.target.value as UserRole })
              }
              className="mt-1 w-full rounded-xl border px-3 py-2.5"
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
          className="mt-4 rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {submitting ? "Sedang mencipta akaun..." : "Cipta Akaun"}
        </button>
        {submitting && (
          <p className="mt-2 text-xs text-slate-500">
            Biasanya 1–3 saat. Kali pertama mungkin ambil 10–20 saat.
          </p>
        )}
      </form>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Peranan</th>
              <th className="px-4 py-3">Dicipta</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium">{u.full_name}</td>
                <td className="px-4 py-3">{ROLE_LABELS[u.role]}</td>
                <td className="px-4 py-3 text-slate-500">
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