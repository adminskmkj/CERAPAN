import { CerapanForm } from "@/components/cerapan/CerapanForm";

export default function CerapanBaharuPage() {
  return (
    <div>
      <p className="eyebrow">Tapak Standard 4</p>
      <h1 className="mt-2 text-3xl md:text-4xl">Cerapan Baharu</h1>
      <p className="mt-1 text-sm text-muted">
        Pembelajaran dan Pemudahcaraan (PdPc)
      </p>
      <div className="mt-8">
        <CerapanForm />
      </div>
    </div>
  );
}
