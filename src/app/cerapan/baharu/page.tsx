import { CerapanForm } from "@/components/cerapan/CerapanForm";

export default function CerapanBaharuPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Cerapan Baharu</h1>
      <p className="mt-1 text-sm text-slate-500">
        Tapak Standard 4 — Pembelajaran dan Pemudahcaraan (PdPc)
      </p>
      <div className="mt-6">
        <CerapanForm />
      </div>
    </div>
  );
}