import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import { ClientProviders } from "@/components/layout/ClientProviders";
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
  title: "PENCERAPAN — Standard 4 PdP",
  description:
    "Aplikasi pemantauan guru Standard 4 Pembelajaran dan Pemudahcaraan (PdPc)",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ms">
      <body className={`${inter.variable} ${serif.variable} font-sans antialiased`}>
        <ClientProviders>
          <main className="relative z-10 mx-auto w-full max-w-7xl px-4 py-10 md:px-6 md:py-14">
            {children}
          </main>
        </ClientProviders>
      </body>
    </html>
  );
}