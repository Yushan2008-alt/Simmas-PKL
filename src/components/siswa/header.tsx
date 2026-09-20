"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, ExternalLink, Radio, LogOut, ChevronDown, Sparkles, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getActiveSiswa, getDefaultSiswa, logoutUser } from "@/lib/supabase/services";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

const pageTitles: Record<string, { title: string; category: string }> = {
  "/siswa/dashboard": { title: "Dashboard Siswa", category: "Utama" },
  "/siswa/pengajuan": { title: "Pengajuan Magang", category: "Aktivitas" },
  "/siswa/absensi": { title: "Presensi Harian", category: "Aktivitas" },
  "/siswa/jurnal": { title: "Jurnal Kegiatan", category: "Aktivitas" },
};

export function SiswaHeader({ onOpenMobileMenu }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const current = pageTitles[pathname] || { title: "Portal Siswa", category: "SIMMAS" };
  const [siswa, setSiswa] = React.useState(() => getActiveSiswa());
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setSiswa(getActiveSiswa());

    const handleSiswaUpdate = () => setSiswa(getActiveSiswa());
    if (typeof window !== "undefined") {
      window.addEventListener("simmas_siswa_updated", handleSiswaUpdate);
      window.addEventListener("simmas_auth_changed", handleSiswaUpdate);
      return () => {
        window.removeEventListener("simmas_siswa_updated", handleSiswaUpdate);
        window.removeEventListener("simmas_auth_changed", handleSiswaUpdate);
      };
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
      description: "Anda telah keluar dari sesi Siswa SIMMAS.",
    });
    router.push("/login");
  };

  const isSedangMagang = siswa.status === "Sedang Magang";
  const studentInitials = (siswa.name || "Siswa")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

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
        {/* Realtime Status Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
          <Radio className="h-2.5 w-2.5 animate-pulse text-emerald-500" />
          <span>REAL-TIME AKTIF</span>
        </div>

        {/* View Landing */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span>Lihat Web</span>
        </Link>

        {/* Interactive Student Account Badge & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className={cn(
              "flex items-center gap-2.5 p-1.5 pr-2.5 sm:pr-3 rounded-2xl border border-border bg-card hover:bg-muted/60 transition-all text-left group shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/20",
              dropdownOpen && "bg-muted/70 ring-2 ring-primary/20 border-primary/40"
            )}
            aria-expanded={dropdownOpen}
            aria-label="Menu Akun Siswa"
          >
            <div
              suppressHydrationWarning
              className="h-8 w-8 rounded-xl bg-purple-600/10 text-purple-600 flex items-center justify-center font-extrabold text-xs shrink-0 shadow-2xs"
            >
              {studentInitials}
            </div>

            <div className="hidden md:block text-left min-w-0 max-w-[140px]">
              <p suppressHydrationWarning className="text-xs font-bold text-foreground leading-tight truncate">
                {siswa.name}
              </p>
              <p suppressHydrationWarning className="text-[10px] text-muted-foreground truncate leading-none mt-0.5">
                {siswa.class_name}
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
                <div
                  suppressHydrationWarning
                  className="h-10 w-10 rounded-xl bg-purple-600/15 text-purple-600 flex items-center justify-center font-extrabold text-sm shrink-0"
                >
                  {studentInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <p suppressHydrationWarning className="text-xs font-extrabold text-foreground truncate">
                    {siswa.name}
                  </p>
                  <p suppressHydrationWarning className="text-[11px] text-muted-foreground truncate mt-0.5">
                    {siswa.email}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span
                      suppressHydrationWarning
                      className={cn(
                        "px-1.5 py-0.5 rounded text-[9px] font-extrabold",
                        isSedangMagang
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                          : "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                      )}
                    >
                      {siswa.status}
                    </span>
                    <span suppressHydrationWarning className="text-[10px] font-medium text-muted-foreground">
                      NIS: {siswa.nis}
                    </span>
                  </div>
                </div>
              </div>

              {/* Class Information */}
              <div className="px-2 py-1.5 text-xs text-muted-foreground flex items-center justify-between border-b border-border/60 pb-2 mb-1.5">
                <span className="text-[11px] font-medium">Kelas / Rombel</span>
                <span suppressHydrationWarning className="text-[11px] font-bold text-foreground">
                  {siswa.class_name}
                </span>
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
