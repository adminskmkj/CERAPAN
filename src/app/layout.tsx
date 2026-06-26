import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppHeader } from "@/components/layout/AppHeader";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "CERAPAN — Standard 4 PdP",
  description:
    "Aplikasi pemantauan guru Standard 4 Pembelajaran dan Pemudahcaraan (PdPc)",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ms">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <AppHeader />
          <main className="laporan-main mx-auto max-w-6xl px-4 py-8">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}