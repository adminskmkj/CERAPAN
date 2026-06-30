import { redirect } from "next/navigation";

/** Laluan lama — sama dengan /cerapan/baharu (satu borang markah). */
export default function CerapanKetuaPanitiaRedirectPage() {
  redirect("/cerapan/baharu");
}