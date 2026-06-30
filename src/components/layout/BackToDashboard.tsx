"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const HIDE_ON = new Set(["/", "/dashboard", "/log-masuk"]);

/** Pautan balik dashboard untuk pentadbir / KP (bukan paparan cetak). */
export function BackToDashboard({ className }: { className?: string }) {
  const pathname = usePathname();
  const { isAdmin, isKetuaPanitia, loading } = useAuth();

  const isPrintView =
    pathname.includes("/maklum-balas") ||
    /\/cerapan\/[^/]+\/laporan/.test(pathname);

  if (loading || isPrintView) return null;
  if (!isAdmin && !isKetuaPanitia) return null;
  if (HIDE_ON.has(pathname)) return null;

  return (
    <Link
      href="/dashboard"
      className={cn(
        "no-print mb-6 inline-flex items-center gap-2 rounded-full border border-stone bg-paper-card px-4 py-2 text-sm font-medium text-ink-2 shadow-soft transition hover:border-accent hover:bg-accent-soft hover:text-accent",
        className
      )}
    >
      <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
      <BarChart3 className="h-4 w-4" strokeWidth={1.5} />
      Balik ke Dashboard
    </Link>
  );
}