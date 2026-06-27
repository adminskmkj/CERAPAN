import Link from "next/link";
import {
  ArrowRight,
  ClipboardCheck,
  FileBarChart,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: ClipboardCheck,
    title: "Borang Cerapan Digital",
    desc: "8 sub-standard Standard 4 PdP dengan penskoran automatik.",
  },
  {
    icon: FileBarChart,
    title: "Laporan Moden",
    desc: "Cetak atau muat turun PDF laporan setiap guru.",
  },
  {
    icon: Shield,
    title: "Simpan & Cari Rekod",
    desc: "Senarai cerapan ikut sekolah, guru, dan taraf PdP.",
  },
];

const taraf = [
  { label: "CEMERLANG", range: "85 – 100", cls: "taraf-cemerlang" },
  { label: "BAIK", range: "70 – 84.99", cls: "taraf-baik" },
  { label: "SEDERHANA", range: "55 – 69.99", cls: "taraf-sederhana" },
  { label: "PERLU TINDAKAN SEGERA", range: "0 – 54.99", cls: "taraf-ptps" },
];

export default function HomePage() {
  return (
    <div className="space-y-16 md:space-y-20">
      {/* Hero — off-grid editorial */}
      <section className="relative overflow-hidden rounded-3xl border border-stone bg-paper-card px-6 py-16 shadow-soft md:px-12 md:py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,_#e4ddcd_1px,_transparent_1px)] bg-[size:18px_18px] opacity-60" />
        <div className="absolute left-0 top-10 h-40 w-1 bg-accent" />
        <div className="relative max-w-2xl">
          <p className="eyebrow">SKPM Kualiti@Sekolah</p>
          <h1 className="mt-4 text-4xl leading-[1.04] md:text-6xl">
            Cerapan Standard 4
            <span className="mt-1 block font-serif text-ink-2 italic md:text-4xl">
              Pembelajaran &amp; Pemudahcaraan
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-2">
            Platform pemantauan guru untuk JPN dan sekolah. Isi borang cerapan,
            kira skor automatik, dan jana laporan PDF dengan satu klik.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-5">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:opacity-90"
            >
              Pergi ke Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/cerapan/baharu"
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-accent"
            >
              Cerapan Baharu
              <span className="transition group-hover:translate-x-0.5">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features — editorial triptych */}
      <section className="grid gap-px overflow-hidden rounded-2xl border border-stone bg-stone md:grid-cols-3">
        {features.map(({ icon: Icon, title, desc }) => (
          <article key={title} className="bg-paper-card p-8">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-stone text-accent">
              <Icon className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <h2 className="mt-5 text-xl">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{desc}</p>
          </article>
        ))}
      </section>

      {/* Taraf dossier */}
      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Indeks</p>
            <h2 className="mt-2 text-2xl md:text-3xl">Julat Taraf PdP</h2>
          </div>
          <p className="hidden text-sm text-muted sm:block">
            Skor agregat ditentukan oleh wajaran sub-standard.
          </p>
        </div>
        <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-stone bg-stone sm:grid-cols-2 lg:grid-cols-4">
          {taraf.map((t, i) => (
            <div
              key={t.label}
              className={`flex items-center justify-between bg-paper-card px-5 py-4 ${t.cls}`}
            >
              <div>
                <p className="font-mono text-xs text-muted">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <p className="mt-1 text-sm font-semibold">{t.label}</p>
              </div>
              <p className="font-mono text-sm font-semibold">{t.range}%</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA close */}
      <section className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-stone bg-paper-card px-8 py-10 shadow-soft md:flex-row md:items-center">
        <div>
          <h2 className="text-xl md:text-2xl">Mula cerapan hari ini</h2>
          <p className="mt-1 text-sm text-muted">
            Pilih pentadbir dan guru, isi skor, jana laporan serta-merta.
          </p>
        </div>
        <Link
          href="/cerapan/baharu"
          className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:opacity-90"
        >
          Cerapan Baharu
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
