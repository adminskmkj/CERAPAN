"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { canManageGuru } from "@/lib/auth/permissions";
import type { UserRole } from "@/lib/auth/types";
import {
  listGuruRows,
  padamGuru,
  tambahGuru,
  type GuruRow,
} from "@/lib/storage/guru-store";

export default function PentadbirGuruPage() {
  const { profile, isCloudMode, loading: authLoading } = useAuth();
  const router = useRouter();
  const [gurus, setGurus] = useState<GuruRow[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    kodSekolah: "",
    namaSekolah: "",
    namaGuru: "",
    mataPelajaran: "",
  });

  const bolehUrus =
    profile && canManageGuru(profile.role as UserRole);

  useEffect(() => {
    if (!authLoading && isCloudMode && !bolehUrus) {
      router.replace("/dashboard");
    }
  }, [authLoading, isCloudMode, bolehUrus, router]);

  async function loadGurus(kod?: string) {
    const rows = await listGuruRows(kod || undefined);
    setGurus(rows);
  }

  useEffect(() => {
    if (bolehUrus) loadGurus();
  }, [bolehUrus]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await tambahGuru(form.kodSekolah, form.namaGuru, {
        namaSekolah: form.namaSekolah,
        mataPelajaran: form.mataPelajaran,
      });
      setSuccess(`Guru ${form.namaGuru} berjaya ditambah.`);
      setForm((f) => ({ ...f, namaGuru: "", mataPelajaran: "" }));
      loadGurus(form.kodSekolah || undefined);
    } catch {
      setError("Gagal menambah guru. Cuba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string, nama: string) {
    if (!confirm(`Padam ${nama} dari senarai?`)) return;
    const result = await padamGuru(id);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(`${nama} dipadam.`);
    loadGurus(form.kodSekolah || undefined);
  }

  if (authLoading) return <p className="text-slate-500">Memuatkan...</p>;

  if (!isCloudMode) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        Senarai guru cloud memerlukan Supabase. Selepas deploy Vercel, data guru disimpan
        dalam pangkalan data — bukan pelayar.
      </div>
    );
  }

  if (!bolehUrus) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Urus Senarai Guru</h1>
        <p className="mt-1 text-sm text-slate-500">
          Tambah guru mengikut kod sekolah. Senarai ini dipaparkan dalam dropdown borang
          cerapan — dikongsi untuk semua pengguna selepas deploy Vercel.
        </p>
      </div>

      <form
        onSubmit={handleCreate}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 className="font-semibold text-slate-900">Tambah Guru</h2>

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
            <span className="font-medium">Kod Sekolah *</span>
            <input
              required
              value={form.kodSekolah}
              onChange={(e) =>
                setForm({ ...form, kodSekolah: e.target.value.toUpperCase() })
              }
              className="mt-1 w-full rounded-xl border px-3 py-2.5"
              placeholder="ABC1234"
            />
          </label>
          <label className="text-sm">
            <span className="font-medium">Nama Sekolah</span>
            <input
              value={form.namaSekolah}
              onChange={(e) => setForm({ ...form, namaSekolah: e.target.value })}
              className="mt-1 w-full rounded-xl border px-3 py-2.5"
            />
          </label>
          <label className="text-sm">
            <span className="font-medium">Nama Guru *</span>
            <input
              required
              value={form.namaGuru}
              onChange={(e) => setForm({ ...form, namaGuru: e.target.value })}
              className="mt-1 w-full rounded-xl border px-3 py-2.5"
            />
          </label>
          <label className="text-sm">
            <span className="font-medium">Mata Pelajaran</span>
            <input
              value={form.mataPelajaran}
              onChange={(e) => setForm({ ...form, mataPelajaran: e.target.value })}
              className="mt-1 w-full rounded-xl border px-3 py-2.5"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-4 rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {submitting ? "Menyimpan..." : "Tambah Guru"}
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-900">Senarai Guru (Cloud)</h2>
          <button
            type="button"
            onClick={() => loadGurus(form.kodSekolah || undefined)}
            className="text-xs font-medium text-brand-700"
          >
            Muat semula
          </button>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Kod</th>
              <th className="px-4 py-3">Nama Guru</th>
              <th className="px-4 py-3">Mata Pelajaran</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {gurus.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  Tiada guru dalam pangkalan data. Tambah guru di atas atau isi kod sekolah
                  untuk tapis.
                </td>
              </tr>
            ) : (
              gurus.map((g) => (
                <tr key={g.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-slate-500">{g.kodSekolah}</td>
                  <td className="px-4 py-3 font-medium">{g.namaGuru}</td>
                  <td className="px-4 py-3">{g.mataPelajaran || "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(g.id, g.namaGuru)}
                      className="text-xs font-medium text-red-600 hover:underline"
                    >
                      Padam
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}