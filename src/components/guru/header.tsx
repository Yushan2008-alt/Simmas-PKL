"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ExternalLink, Radio, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getActiveGuru } from "@/lib/supabase/services";

interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

const pageTitles: Record<string, { title: string; category: string }> = {
  "/guru/dashboard": { title: "Dashboard Guru", category: "Utama" },
  "/guru/siswa": { title: "Siswa Bimbingan", category: "Pembimbingan" },
  "/guru/jurnal": { title: "Jurnal & Absensi", category: "Pembimbingan" },
  "/guru/kunjungan": { title: "Kunjungan Lapangan", category: "Pembimbingan" },
};

export function GuruHeader({ onOpenMobileMenu }: HeaderProps) {
  const pathname = usePathname();
  const current = pageTitles[pathname] || { title: "Portal Guru", category: "SIMMAS" };
  const [guru, setGuru] = React.useState(getActiveGuru());

  React.useEffect(() => {
    setGuru(getActiveGuru());

    const handleAuthChange = () => setGuru(getActiveGuru());
    if (typeof window !== "undefined") {
      window.addEventListener("simmas_auth_changed", handleAuthChange);
      return () => window.removeEventListener("simmas_auth_changed", handleAuthChange);
    }
  }, []);

  const guruInitials =
    (guru.name || "Guru")
      .replace(/\b(dr\.|dra\.|drs\.|prof\.|h\.|hj\.|ir\.|m\.kom|s\.kom|s\.pd|m\.pd|s\.t|m\.t|m\.sc|b\.sc|m\.si|s\.si|se|ak)\b/gi, "")
      .replace(/[^a-zA-Z\s]/g, "")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "GP";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/90 px-6 backdrop-blur-md">
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            <span>{current.category}</span>
            <span>/</span>
            <span className="text-primary">{current.title}</span>
          </div>
          <h1 className="text-base font-bold text-foreground leading-tight">
            {current.title}
          </h1>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Realtime Status Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
          <Radio className="h-2.5 w-2.5 animate-pulse text-emerald-500" />
          <span>REAL-TIME AKTIF</span>
        </div>

        {/* Teacher Identity Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-muted/30">
          <div className="h-7 w-7 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold text-xs">
            {guruInitials}
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-foreground leading-none">
              {guru.name}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              NIP: {guru.nip}
            </p>
          </div>
        </div>

        {/* View Landing */}
        <Button
          variant="outline"
          size="sm"
          asChild
          className="h-9 gap-1.5 text-xs font-semibold rounded-xl"
        >
          <Link href="/" target="_blank">
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Lihat Web</span>
          </Link>
        </Button>
      </div>
    </header>
  );
}
