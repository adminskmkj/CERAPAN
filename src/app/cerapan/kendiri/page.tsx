import { CerapanForm } from "@/components/cerapan/CerapanForm";

export default function CerapanKendiriPage() {
  return (
    <div>
      <p className="eyebrow">Tapak Standard 4</p>
      <h1 className="mt-2 text-3xl md:text-4xl">Pencerapan Kendiri</h1>
      <p className="mt-1 text-sm text-muted">
        Guru mengisi sendiri — satu rekod kendiri setiap guru
      </p>
      <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950">
        <p className="font-semibold">Untuk guru</p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sky-900">
          <li>
            <strong>Modul / Pencerapan 1 &amp; 2</strong> — borang Standard 4{" "}
            <strong>sama</strong>; diisi oleh <strong>pentadbir</strong> (bukan
            guru), pada dua masa berbeza dalam tahun.
          </li>
          <li>
            <strong>Kendiri</strong> — borang yang sama juga; ini sahaja yang{" "}
            <strong>guru isi sendiri</strong> (tanpa log masuk).
          </li>
          <li>
            Markah Pencerapan 1, 2 &amp; Ketua Panitia — semak di{" "}
            <strong>Rekod → Laporan Individu</strong>.
          </li>
        </ul>
      </div>
      <div className="mt-8">
        <CerapanForm mode="kendiri" />
      </div>
    </div>
  );
}