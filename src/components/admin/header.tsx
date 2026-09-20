"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  Bell,
  ExternalLink,
  Shield,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { logoutUser } from "@/lib/supabase/services";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

const pageTitles: Record<string, { title: string; category: string }> = {
  "/admin/dashboard": { title: "Dashboard", category: "Overview" },
  "/admin/monitoring": { title: "Monitoring Global", category: "Overview" },
  "/admin/guru": { title: "Data Guru", category: "Master Data" },
  "/admin/siswa": { title: "Data Siswa", category: "Master Data" },
  "/admin/dudi": { title: "Data DUDI", category: "Master Data" },
  "/admin/penempatan": { title: "Penempatan Magang", category: "Manajemen" },
  "/admin/settings": { title: "Pengaturan Sistem", category: "Sistem" },
  "/admin/logs": { title: "Log Aktivitas", category: "Sistem" },
};

export function AdminHeader({ onOpenMobileMenu }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const current = pageTitles[pathname] || { title: "Admin Portal", category: "SIMMAS" };
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

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
      description: "Anda telah keluar dari sesi Admin SIMMAS.",
    });
    router.push("/login");
  };

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
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Realtime Live</span>
        </div>

        {/* View Landing Page link */}
        <Link
          href="/"
          target="_blank"
          className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          <span>Landing Page</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>

        {/* Notification Bell */}
        <button
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
        </button>

        {/* Interactive Admin Account Badge & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className={cn(
              "flex items-center gap-2.5 p-1.5 pr-2.5 sm:pr-3 rounded-2xl border border-border bg-card hover:bg-muted/60 transition-all text-left group shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/20",
              dropdownOpen && "bg-muted/70 ring-2 ring-primary/20 border-primary/40"
            )}
            aria-expanded={dropdownOpen}
            aria-label="Menu Akun Administrator"
          >
            <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-2xs">
              <Shield className="h-4 w-4" />
            </div>

            <div className="hidden md:block text-left min-w-0 max-w-[140px]">
              <p className="text-xs font-bold text-foreground leading-tight truncate">
                Administrator
              </p>
              <p className="text-[10px] text-muted-foreground truncate leading-none mt-0.5">
                Super Admin
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
                <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
                  <Shield className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-extrabold text-foreground truncate">
                    Administrator
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                    admin@simmas.sch.id
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-primary/10 text-primary border border-primary/20">
                      Super Administrator
                    </span>
                  </div>
                </div>
              </div>

              {/* System Info */}
              <div className="px-2 py-1.5 text-xs text-muted-foreground flex items-center justify-between border-b border-border/60 pb-2 mb-1.5">
                <span className="text-[11px] font-medium">Hak Akses</span>
                <span className="text-[11px] font-bold text-emerald-600">Full Control</span>
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
