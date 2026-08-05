"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, Printer, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const REKOD_TABS = [
  {
    href: "/rekod/laporan-penuh",
    label: "Laporan Penuh",
    icon: Printer,
  },
  {
    href: "/rekod/laporan-individu",
    label: "Laporan Individu",
    icon: ClipboardList,
  },
] as const;

export function RekodSubTabs() {
  const pathname = usePathname();
  const { isAdmin, isKetuaPanitia } = useAuth();
  const canManage = isAdmin || isKetuaPanitia;

  return (
    <nav className="premium-tabs" aria-label="Jenis rekod">
      {REKOD_TABS.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "premium-tab inline-flex items-center gap-2",
              active ? "premium-tab--active" : "premium-tab--idle"
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={1.5} />
            {label}
          </Link>
        );
      })}
      {canManage && (
        <Link
          href="/rekod/tambah-guru"
          className={cn(
            "premium-tab inline-flex items-center gap-2",
            pathname.startsWith("/rekod/tambah-guru")
              ? "premium-tab--active"
              : "premium-tab--idle"
          )}
        >
          <Users className="h-4 w-4" strokeWidth={1.5} />
          Senarai Guru
        </Link>
      )}
    </nav>
  );
}