import Link from "next/link";
import { ArrowRight, ClipboardCheck, FileBarChart, Shield } from "lucide-react";

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
    <div className="space-y-10">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 px-8 py-12 text-white shadow-lg">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-200">
          SKPM Kualiti@Sekolah
        </p>
        <h1 className="mt-3 max-w-2xl text-3xl font-bold leading-tight md:text-4xl">
          CERAPAN Standard 4 — Pembelajaran dan Pemudahcaraan
        </h1>
        <p className="mt-4 max-w-xl text-blue-100">
          Platform pemantauan guru untuk JPN dan sekolah. Isi borang cerapan, kira skor
          automatik, dan jana laporan PDF dengan satu klik.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-brand-800"
          >
            Pergi ke Dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/cerapan/baharu"
            className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white"
          >
            Cerapan Baharu
          </Link>
          <Link
            href="/log-masuk"
            className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white"
          >
            Log Masuk
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {features.map(({ icon: Icon, title, desc }) => (
          <article
            key={title}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="mt-4 font-semibold text-slate-900">{title}</h2>
            <p className="mt-2 text-sm text-slate-600">{desc}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Julat Taraf PdP</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {taraf.map((t) => (
            <div
              key={t.label}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold ${t.cls}`}
            >
              <p>{t.label}</p>
              <p className="mt-1 text-xs font-normal opacity-80">{t.range}%</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}