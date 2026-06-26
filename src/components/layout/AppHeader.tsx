"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ClipboardList,
  Home,
  LogIn,
  LogOut,
  Menu,
  PlusCircle,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Utama", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/cerapan/baharu", label: "Cerapan Baharu", icon: PlusCircle },
  { href: "/senarai", label: "Senarai Rekod", icon: ClipboardList },
];

export function AppHeader() {
  const pathname = usePathname();
  const { user, profile, isCloudMode, isAdmin, signOut, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const isLaporan = pathname.includes("/laporan");
  const isLogin = pathname === "/log-masuk";

  if (isLaporan || isLogin) return null;

  return (
    <header className="no-print sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-700 text-sm font-bold text-white">
            C4
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">CERAPAN</p>
            <p className="text-xs text-slate-500">Standard 4 PdP · SKPM</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
                pathname === href
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/pentadbir/pengguna"
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
                pathname.startsWith("/pentadbir")
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <Users className="h-4 w-4" />
              Pengguna
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {!loading && isCloudMode && (
            user ? (
              <div className="hidden items-center gap-2 md:flex">
                <span className="text-xs text-slate-500">
                  {profile?.fullName ?? user.email}
                </span>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Keluar
                </button>
              </div>
            ) : (
              <Link
                href="/log-masuk"
                className="hidden md:inline-flex items-center gap-1 rounded-lg bg-brand-700 px-3 py-2 text-xs font-semibold text-white"
              >
                <LogIn className="h-3.5 w-3.5" />
                Log Masuk
              </Link>
            )
          )}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <nav className="space-y-1">
            {nav.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
                  pathname === href
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/pentadbir/pengguna"
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
                  pathname.startsWith("/pentadbir")
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <Users className="h-4 w-4" />
                Pengguna
              </Link>
            )}
          </nav>
          {!loading && isCloudMode && (
            <div className="mt-3 border-t border-slate-100 pt-3">
              {user ? (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    signOut();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  <LogOut className="h-4 w-4" />
                  Keluar ({profile?.fullName ?? user.email})
                </button>
              ) : (
                <Link
                  href="/log-masuk"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-lg bg-brand-700 px-3 py-2 text-sm font-semibold text-white"
                >
                  <LogIn className="h-4 w-4" />
                  Log Masuk
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
