import { Suspense } from "react";

export default function LogMasukLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={<p className="text-slate-500">Memuatkan...</p>}>{children}</Suspense>;
}