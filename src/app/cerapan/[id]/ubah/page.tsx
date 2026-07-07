import { UbahCerapanEntry } from "@/components/cerapan/UbahCerapanEntry";
import { canModifyCerapan } from "@/lib/auth/roles";
import { getAuthSession } from "@/lib/auth/session";
import { getCerapan } from "@/lib/storage";
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

  return <UbahCerapanEntry record={record} />;
}