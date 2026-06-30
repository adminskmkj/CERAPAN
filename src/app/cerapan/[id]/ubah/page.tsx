import { CerapanForm } from "@/components/cerapan/CerapanForm";
import { isKetuaPanitiaCerapan, isPencerapanAdmin } from "@/lib/cerapan/jenis";
import { getCerapan } from "@/lib/storage";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function UbahCerapanPage({ params }: Props) {
  const { id } = await params;
  const record = await getCerapan(id);
  if (!record) notFound();

  const mode = isKetuaPanitiaCerapan(record.sesiPengisian)
    ? "ketua-panitia"
    : isPencerapanAdmin(record.sesiPengisian)
      ? "pencerapan"
      : "kendiri";

  return (
    <div>
      <p className="eyebrow">Tapak Standard 4</p>
      <h1 className="mt-2 text-3xl md:text-4xl">Ubah Pencerapan</h1>
      <p className="mt-1 text-sm text-muted">
        {record.namaGuru} · {record.sesiPengisian}
      </p>
      <div className="mt-8">
        <CerapanForm mode={mode} initial={record} />
      </div>
    </div>
  );
}