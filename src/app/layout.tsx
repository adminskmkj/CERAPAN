import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import { AppHeader } from "@/components/layout/AppHeader";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const serif = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
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
      <body className={`${inter.variable} ${serif.variable} font-sans antialiased`}>
        <AuthProvider>
          <AppHeader />
          <main className="mx-auto max-w-6xl px-4 py-10 md:py-14">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
