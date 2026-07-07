import { CerapanForm } from "@/components/cerapan/CerapanForm";
import { isKendiri } from "@/lib/cerapan/jenis";
import { canModifyCerapan } from "@/lib/auth/roles";
import { getAuthSession } from "@/lib/auth/session";
import { getCerapan } from "@/lib/storage";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function UbahCerapanPage({ params }: Props) {
  const { id } = await params;
  const record = await getCerapan(id);
  if (!record) notFound();

  const session = await getAuthSession();
  if (
    !session ||
    !canModifyCerapan(session.appRole, record.sesiPengisian, {
      userId: session.user.id,
      userPanitia: session.panitia,
      record: {
        sesiPengisian: record.sesiPengisian,
        createdBy: record.createdBy,
        panitiaKp: record.panitiaKp,
        mataPelajaran: record.mataPelajaran,
      },
      isUpdate: true,
    })
  ) {
    redirect(`/log-masuk?redirect=/cerapan/${id}/ubah`);
  }

  const mode = isKendiri(record.sesiPengisian) ? "kendiri" : "pencerapan";

  return (
    <div>
      <p className="eyebrow">Tapak Standard 4</p>
      <h1 className="mt-2 text-3xl md:text-4xl">Ubah Pencerapan</h1>
      <p className="mt-1 text-sm text-muted">
        {record.namaGuru} · {record.sesiPengisian}
        {record.namaPemerhati ? ` · ${record.namaPemerhati}` : ""}
      </p>
      <p className="mt-2 text-xs text-muted">
        Akses ubah rekod: pentadbir sahaja.{" "}
        <Link href="/rekod/laporan-individu" className="text-accent underline">
          Kembali ke rekod
        </Link>
      </p>
      <div className="mt-8">
        <CerapanForm mode={mode} initial={record} />
      </div>
    </div>
  );
}