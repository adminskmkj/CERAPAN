"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Archive,
  BarChart3,
  Home,
  LogIn,
  LogOut,
  Menu,
  PlusCircle,
  UserPen,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const baseNav = [
  { href: "/", label: "Utama", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/cerapan/kendiri", label: "Pencerapan Kendiri", icon: UserPen },
  { href: "/rekod/laporan-penuh", label: "REKOD", icon: Archive },
];

const adminNav = {
  href: "/cerapan/baharu",
  label: "Isi Pencerapan",
  icon: PlusCircle,
};

const kpNav = {
  href: "/cerapan/baharu",
  label: "Isi Pencerapan",
  icon: PlusCircle,
};

export function AppHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { isAdmin, isKetuaPanitia, loading, signOut } = useAuth();
  const isStaff = isAdmin || isKetuaPanitia;
  const isPrintView =
    pathname.includes("/maklum-balas") ||
    /\/cerapan\/[^/]+\/laporan/.test(pathname);

  if (isPrintView) return null;

  const nav = isAdmin
    ? [...baseNav.slice(0, 3), adminNav, ...baseNav.slice(3)]
    : isKetuaPanitia
      ? [...baseNav.slice(0, 3), kpNav, ...baseNav.slice(3)]
      : baseNav;

  const isNavActive = (href: string) =>
    href.startsWith("/rekod")
      ? pathname.startsWith("/rekod")
      : pathname === href;

  const linkClass = (href: string) =>
    cn(
      "flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition",
      isNavActive(href)
        ? "bg-accent-soft text-accent shadow-sm"
        : "text-ink-2 hover:bg-stone-2/80"
    );

  async function handleSignOut() {
    await signOut();
    window.location.href = "/";
  }

  return (
    <header className="premium-header no-print sticky top-0 z-50">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3.5 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="premium-logo">P4</div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-ink">PENCERAPAN</p>
            <p className="text-[11px] text-muted">Standard 4 PdP · SKPM</p>
          </div>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <nav className="flex items-center gap-1">
            {nav.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className={linkClass(href)}>
                <Icon className="h-4 w-4" strokeWidth={1.5} />
                {label}
              </Link>
            ))}
          </nav>
          {!loading &&
            (isStaff ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="ml-2 flex items-center gap-2 rounded-full border border-stone px-3.5 py-2 text-sm font-medium text-ink-2 transition hover:bg-stone-2"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.5} />
                Log Keluar
              </button>
            ) : (
              <Link
                href="/log-masuk"
                className="ml-2 flex items-center gap-2 rounded-full border border-accent bg-accent-soft px-3.5 py-2 text-sm font-medium text-accent transition hover:opacity-90"
              >
                <LogIn className="h-4 w-4" strokeWidth={1.5} />
                Log Masuk
              </Link>
            ))}
        </div>

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
                  isNavActive(href)
                    ? "bg-accent-soft text-accent"
                    : "text-ink-2 hover:bg-stone-2"
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={1.5} />
                {label}
              </Link>
            ))}
            {!loading &&
              (isStaff ? (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    void handleSignOut();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-2 hover:bg-stone-2"
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.5} />
                  Log Keluar
                </button>
              ) : (
                <Link
                  href="/log-masuk"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-accent hover:bg-accent-soft"
                >
                  <LogIn className="h-4 w-4" strokeWidth={1.5} />
                  Log Masuk
                </Link>
              ))}
          </nav>
        </div>
      )}
    </header>
  );
}