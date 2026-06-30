import { Sparkles } from "lucide-react";
import { HomeActions } from "@/components/layout/HomeActions";
import { NAMA_SEKOLAH } from "@/lib/data/sekolah";

export default function HomePage() {
  return (
    <section className="premium-home relative">
      <div className="premium-home-grid" aria-hidden />
      <div className="relative max-w-2xl">
        <p className="eyebrow flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-accent" strokeWidth={1.5} />
          SKPM Kualiti@Sekolah
        </p>
        <h1 className="mt-4 text-4xl leading-[1.04] md:text-[3.5rem]">
          Pencerapan Standard 4
          <span className="mt-2 block font-serif text-ink-2 italic md:text-[2.15rem]">
            Pembelajaran &amp; Pemudahcaraan
          </span>
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-2">
          Platform pemantauan guru untuk JPN dan sekolah. Isi borang pencerapan,
          kira skor automatik, dan jana laporan PDF dengan satu klik.
        </p>
        <p className="mt-3 text-sm text-muted">{NAMA_SEKOLAH}</p>
        <HomeActions />
      </div>
    </section>
  );
}