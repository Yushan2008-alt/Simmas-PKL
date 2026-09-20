import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
});

export const viewport: Viewport = {
  themeColor: "#2563eb",
};

export const metadata: Metadata = {
  title: "SIMMAS - Sistem Informasi Manajemen Magang Siswa",
  description:
    "Platform terpusat pengelolaan magang SMK. Mudah, modern, dan efisien untuk Siswa, Guru, dan Admin.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${plusJakartaSans.variable} h-full scroll-smooth`}>
      <body className="min-h-full flex flex-col font-sans antialiased text-foreground bg-background selection:bg-blue-100 selection:text-blue-900">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
