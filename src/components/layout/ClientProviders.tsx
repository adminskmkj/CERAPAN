"use client";

import dynamic from "next/dynamic";
import { AppHeader } from "@/components/layout/AppHeader";
import { BackToDashboard } from "@/components/layout/BackToDashboard";
import { AuthProvider } from "@/contexts/AuthContext";

const MouseFollower = dynamic(
  () =>
    import("@/components/layout/MouseFollower").then((m) => m.MouseFollower),
  { ssr: false }
);

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <MouseFollower />
      <AppHeader />
      <BackToDashboard />
      {children}
    </AuthProvider>
  );
}