import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rumah Quran Maosani — Absensi & Kas",
  description: "Sistem absensi dan keuangan santri Rumah Quran Maosani",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className="h-full">
      <body className="min-h-full flex flex-col text-white antialiased">
        {children}
      </body>
    </html>
  );
}
