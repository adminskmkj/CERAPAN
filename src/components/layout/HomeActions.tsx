"use client";

import Link from "next/link";
import { ArrowRight, PlusCircle, UserPen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function HomeActions() {
  const { isAdmin, isKetuaPanitia, loading } = useAuth();
  const isStaff = isAdmin || isKetuaPanitia;

  return (
    <div className="mt-9 flex flex-wrap items-center gap-4">
      <Link href="/dashboard" className="premium-btn-primary">
        Pergi ke Dashboard
        <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
      </Link>
      <Link href="/cerapan/kendiri" className="premium-btn-secondary">
        <UserPen className="h-4 w-4" strokeWidth={1.5} />
        Pencerapan Kendiri
      </Link>
      {!loading && isAdmin && (
        <Link href="/cerapan/baharu" className="premium-btn-secondary">
          <PlusCircle className="h-4 w-4" strokeWidth={1.5} />
          Pencerapan Pentadbir
        </Link>
      )}
      {!loading && isStaff && (
        <Link href="/cerapan/ketua-panitia" className="premium-btn-secondary">
          <UserPen className="h-4 w-4" strokeWidth={1.5} />
          Pencerapan Ketua Panitia
        </Link>
      )}
      {!loading && !isStaff && (
        <Link
          href="/log-masuk"
          className="group inline-flex items-center gap-1.5 px-1 text-sm font-semibold text-muted transition hover:text-accent"
        >
          Log masuk pentadbir / ketua panitia
          <span className="transition group-hover:translate-x-0.5">→</span>
        </Link>
      )}
    </div>
  );
}