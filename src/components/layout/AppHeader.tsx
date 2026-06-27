"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ClipboardList,
  Home,
  Menu,
  PlusCircle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Utama", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/cerapan/baharu", label: "Cerapan Baharu", icon: PlusCircle },
  { href: "/senarai", label: "Senarai Rekod", icon: ClipboardList },
];

export function AppHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isLaporan = pathname.includes("/laporan");
  const isLogin = pathname === "/log-masuk";

  if (isLaporan || isLogin) return null;

  const linkClass = (href: string) =>
    cn(
      "flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition",
      pathname === href
        ? "bg-accent-soft text-accent"
        : "text-ink-2 hover:bg-stone-2"
    );

  return (
    <header className="no-print sticky top-0 z-50 border-b border-stone bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent font-mono text-xs font-bold text-white">
            C4
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-ink">CERAPAN</p>
            <p className="text-[11px] text-muted">Standard 4 PdP · SKPM</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={linkClass(href)}>
              <Icon className="h-4 w-4" strokeWidth={1.5} />
              {label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
          className="inline-flex items-center justify-center rounded-lg border border-stone p-2 text-ink-2 transition hover:bg-stone-2 md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-stone bg-paper-card px-4 py-3 md:hidden">
          <nav className="space-y-1">
            {nav.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium",
                  pathname === href
                    ? "bg-accent-soft text-accent"
                    : "text-ink-2 hover:bg-stone-2"
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={1.5} />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
