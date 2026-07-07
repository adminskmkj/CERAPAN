"use client";

import { CerapanForm } from "@/components/cerapan/CerapanForm";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Borang penskoran pentadbir & ketua panitia — sama P1/P2, bezakan nama pencerap.
 */
export function StaffCerapanEntry() {
  const { isKetuaPanitia, isAdmin, loading } = useAuth();

  if (loading) {
    return <p className="text-muted">Memuatkan…</p>;
  }

  const isKp = isKetuaPanitia && !isAdmin;

  return (
    <div>
      <p className="eyebrow">Tapak Standard 4</p>
      <h1 className="mt-2 text-3xl md:text-4xl">
        {isKp ? "Pencerapan Ketua Panitia" : "Pencerapan Pentadbir"}
      </h1>
      <p className="mt-1 text-sm text-muted">
        {isKp
          ? "Pilih Pencerapan 1 atau 2 — KP cerap guru dalam panitia sendiri. Guru sama boleh ada beberapa laporan jika pencerap berbeza (cth. GB & KP pada pusingan sama)."
          : "Pilih Pencerapan 1 atau 2. Guru sama boleh ada lebih daripada satu rekod jika pencerap berbeza."}
      </p>
      <div className="mt-8">
        <CerapanForm mode="pencerapan" />
      </div>
    </div>
  );
}