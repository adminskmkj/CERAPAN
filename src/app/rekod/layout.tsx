import { Sparkles } from "lucide-react";
import { RekodSubTabs } from "@/components/rekod/RekodSubTabs";

export default function RekodLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dash-page space-y-6">
      <section className="no-print dash-hero">
        <p className="eyebrow flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-accent" strokeWidth={1.5} />
          Arkib &amp; Laporan
        </p>
        <h1 className="mt-2 text-3xl md:text-[2.35rem]">REKOD</h1>
        <p className="mt-2 text-sm text-muted">
          Laporan penuh untuk cetak atau laporan individu mengikut guru
        </p>
        <div className="mt-5">
          <RekodSubTabs />
        </div>
      </section>
      {children}
    </div>
  );
}