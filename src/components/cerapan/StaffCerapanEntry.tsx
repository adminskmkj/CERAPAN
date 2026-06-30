"use client";

import { CerapanForm } from "@/components/cerapan/CerapanForm";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Satu borang penskoran untuk pentadbir (P1/P2) dan KP (jenis Ketua Panitia).
 * Markah masuk rekod yang sama mengikut jenis — bukan aliran “tambah baru” berasingan.
 */
export function StaffCerapanEntry() {
  const { isAdmin, isKetuaPanitia, loading } = useAuth();

  if (loading) {
    return <p className="text-muted">Memuatkan…</p>;
  }

  const mode =
    isKetuaPanitia && !isAdmin ? "ketua-panitia" : "pencerapan";

  return (
    <div>
      <p className="eyebrow">Tapak Standard 4</p>
      <h1 className="mt-2 text-3xl md:text-4xl">
        {mode === "ketua-panitia"
          ? "Pencerapan Ketua Panitia"
          : "Pencerapan Pentadbir"}
      </h1>
      <p className="mt-1 text-sm text-muted">
        {mode === "ketua-panitia"
          ? "Borang & markah sama seperti pentadbir — hanya jenis laporan Ketua Panitia. Boleh wujud bersama Pencerapan 1 & 2 untuk guru yang sama."
          : "Pencerapan pertama & kedua — pentadbir. Guru yang sama boleh juga dicerap ketua panitia (jenis berasingan)."}
      </p>
      <div className="mt-8">
        <CerapanForm mode={mode} />
      </div>
    </div>
  );
}