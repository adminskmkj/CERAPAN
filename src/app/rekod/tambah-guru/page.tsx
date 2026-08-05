"use client";

import { useCallback, useEffect, useState } from "react";
import { PlusCircle, Trash2, Users } from "lucide-react";
import { KOD_SEKOLAH, NAMA_SEKOLAH } from "@/lib/data/sekolah";
import { padamGuru, tambahGuru } from "@/lib/storage/guru-store";
import { useAuth } from "@/contexts/AuthContext";

interface GuruRow {
  id: string;
  kodSekolah: string;
  namaGuru: string;
  mataPelajaran: string | null;
  createdAt: string;
}

export default function TambahGuruPage() {
  const { isAdmin, isKetuaPanitia } = useAuth();
  const canManage = isAdmin || isKetuaPanitia;

  const [rows, setRows] = useState<GuruRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [nama, setNama] = useState("");
  const [mata, setMata] = useState("");
  const [paste, setPaste] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ kodSekolah: KOD_SEKOLAH });
      const res = await fetch(`/api/guru?${qs}`);
      if (res.ok) {
        const json = await res.json();
        setRows(json.gurus ?? []);
      }
    } catch {
      /* abaikan */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (canManage) load();
    else setLoading(false);
  }, [canManage, load]);

  async function handleTambahSatu() {
    const n = nama.trim();
    if (!n) {
      setMsg({ type: "err", text: "Isi nama guru dulu." });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      await tambahGuru(KOD_SEKOLAH, n, {
        namaSekolah: NAMA_SEKOLAH,
        mataPelajaran: mata.trim() || undefined,
      });
      setNama("");
      setMata("");
      await load();
      setMsg({ type: "ok", text: `Berjaya tambah "${n}".` });
    } catch {
      setMsg({ type: "err", text: "Gagal tambah guru." });
    } finally {
      setBusy(false);
    }
  }

  async function handleTambahSenarai() {
    const list = paste
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (list.length === 0) {
      setMsg({ type: "err", text: "Tiada nama dalam kotak." });
      return;
    }
    setBusy(true);
    setMsg(null);
    let berjaya = 0;
    for (const n of list) {
      try {
        await tambahGuru(KOD_SEKOLAH, n, { namaSekolah: NAMA_SEKOLAH });
        berjaya++;
      } catch {
        /* teruskan */
      }
    }
    setPaste("");
    await load();
    setMsg({
      type: "ok",
      text: `Berjaya tambah ${berjaya}/${list.length} nama.`,
    });
    setBusy(false);
  }

  async function handleBuang(id: string, label: string) {
    if (!confirm(`Buang "${label}" dari senarai guru?`)) return;
    setBusy(true);
    try {
      await padamGuru(id);
      await load();
      setMsg({ type: "ok", text: `Berjaya buang "${label}".` });
    } catch {
      setMsg({ type: "err", text: "Gagal buang guru." });
    } finally {
      setBusy(false);
    }
  }

  if (!canManage) {
    return (
      <div className="dash-empty">
        <Users className="mx-auto h-8 w-8 text-muted" strokeWidth={1.25} />
        <p className="mt-4 text-sm text-muted">
          Halaman ini hanya untuk Pentadbir atau Ketua Panitia.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="premium-card space-y-3">
          <h2 className="text-base font-semibold text-ink">Tambah Guru Satu</h2>
          <label className="block text-sm">
            <span className="font-medium text-ink-2">Nama Guru *</span>
            <input
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTambahSatu()}
              className="mt-1.5 w-full rounded-xl border border-stone bg-white px-3 py-2.5 text-sm shadow-sm"
              placeholder="Nama guru pindah…"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-ink-2">Mata Pelajaran</span>
            <input
              value={mata}
              onChange={(e) => setMata(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-stone bg-white px-3 py-2.5 text-sm shadow-sm"
              placeholder="Contoh: Matematik"
            />
          </label>
          <button
            type="button"
            onClick={handleTambahSatu}
            disabled={busy}
            className="premium-btn-primary"
          >
            <PlusCircle className="h-4 w-4" strokeWidth={1.5} />
            Tambah
          </button>
        </section>

        <section className="premium-card space-y-3">
          <h2 className="text-base font-semibold text-ink">
            Tambah Ramai (paste senarai)
          </h2>
          <p className="text-xs text-muted">
            Satu nama satu baris. Nama akan disimpan terus ke senarai guru.
          </p>
          <textarea
            value={paste}
            onChange={(e) => setPaste(e.target.value)}
            rows={6}
            className="w-full rounded-xl border border-stone bg-white px-3 py-2.5 text-sm shadow-sm"
            placeholder={"NAZMI BIN ALI\nSITI FATIMAH\n..."}
          />
          <button
            type="button"
            onClick={handleTambahSenarai}
            disabled={busy}
            className="premium-btn-primary"
          >
            <PlusCircle className="h-4 w-4" strokeWidth={1.5} />
            Tambah Senarai
          </button>
        </section>
      </div>

      {msg && (
        <p
          className={
            msg.type === "ok"
              ? "text-sm font-medium text-green-700"
              : "text-sm font-medium text-red-700"
          }
        >
          {msg.text}
        </p>
      )}

      <section className="premium-card space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">
            Senarai Guru ({rows.length})
          </h2>
          <span className="text-xs text-muted">{NAMA_SEKOLAH}</span>
        </div>

        {loading ? (
          <p className="text-sm text-muted">Memuatkan…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted">Tiada guru dalam senarai.</p>
        ) : (
          <ul className="divide-y divide-stone">
            {rows.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">
                    {r.namaGuru}
                  </p>
                  {r.mataPelajaran && (
                    <p className="text-xs text-muted">{r.mataPelajaran}</p>
                  )}
                </div>
                <button
                  type="button"
                  aria-label={`Buang ${r.namaGuru}`}
                  onClick={() => handleBuang(r.id, r.namaGuru)}
                  disabled={busy}
                  className="inline-flex items-center gap-1 rounded-lg border border-stone bg-white px-2.5 py-1.5 text-xs font-medium text-red-700 shadow-sm transition hover:border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Buang
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
