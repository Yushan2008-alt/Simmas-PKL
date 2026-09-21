"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, ShieldCheck, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getActiveGuru, getDefaultGuru, logoutUser } from "@/lib/supabase/services";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  const router = useRouter();
  const current = pageTitles[pathname] || { title: "Portal Guru", category: "SIMMAS" };
  const [mounted, setMounted] = React.useState(false);
  const [guru, setGuru] = React.useState(() => getDefaultGuru());
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
    setGuru(getActiveGuru());

    const handleAuthChange = () => setGuru(getActiveGuru());
    if (typeof window !== "undefined") {
      window.addEventListener("simmas_auth_changed", handleAuthChange);
      return () => window.removeEventListener("simmas_auth_changed", handleAuthChange);
    }
  }, []);

  // Close dropdown on click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logoutUser();
    toast.success("Berhasil keluar", {
      description: "Anda telah keluar dari sesi Guru SIMMAS.",
    });
    router.push("/login");
  };

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
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/90 px-4 sm:px-6 backdrop-blur-md">
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
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Interactive Teacher Account Badge & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className={cn(
              "flex items-center gap-2.5 p-1.5 pr-2.5 sm:pr-3 rounded-2xl border border-border bg-card hover:bg-muted/60 transition-all text-left group shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/20",
              dropdownOpen && "bg-muted/70 ring-2 ring-primary/20 border-primary/40"
            )}
            aria-expanded={dropdownOpen}
            aria-label="Menu Akun Guru"
          >
            <div className="h-8 w-8 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-extrabold text-xs shrink-0 shadow-2xs">
              {mounted ? guruInitials : "G"}
            </div>

            <div className="hidden md:block text-left min-w-0 max-w-[150px]">
              <p className="text-xs font-bold text-foreground leading-tight truncate">
                {mounted ? guru.name : "Memuat..."}
              </p>
              <p className="text-[10px] text-muted-foreground truncate leading-none mt-0.5">
                NIP: {mounted ? guru.nip : "-"}
              </p>
            </div>

            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                dropdownOpen && "rotate-180 text-foreground"
              )}
            />
          </button>

          {/* Dropdown Menu Popover */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-border bg-card p-3 shadow-xl z-50 animate-in fade-in-0 zoom-in-95 duration-150">
              {/* Account Profile Details */}
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-muted/40 mb-2">
                <div className="h-10 w-10 rounded-xl bg-blue-600/15 text-blue-600 flex items-center justify-center font-extrabold text-sm shrink-0">
                  {guruInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-extrabold text-foreground truncate">
                    {guru.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                    {guru.email}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
                      <ShieldCheck className="h-3 w-3 text-blue-600" />
                      Guru Pembimbing
                    </span>
                  </div>
                </div>
              </div>

              {/* Department & NIP Information */}
              <div className="space-y-1.5 px-2 py-1.5 text-xs text-muted-foreground border-b border-border/60 pb-2 mb-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium">NIP</span>
                  <span className="text-[11px] font-bold text-foreground font-mono">
                    {guru.nip}
                  </span>
                </div>
                {guru.department && (
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium">Departemen</span>
                    <span className="text-[11px] font-bold text-foreground truncate max-w-[150px]">
                      {guru.department}
                    </span>
                  </div>
                )}
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-500/10 rounded-xl transition-colors mt-1"
              >
                <LogOut className="h-4 w-4" />
                <span>Keluar Sesi</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
