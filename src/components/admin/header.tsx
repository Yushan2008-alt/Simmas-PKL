"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  Bell,
  Search,
  ExternalLink,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const current = pageTitles[pathname] || { title: "Admin Portal", category: "SIMMAS" };

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
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Realtime Live</span>
        </div>

        {/* View Landing Page link */}
        <Link
          href="/"
          target="_blank"
          className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          <span>Landing Page</span>
          <ExternalLink className="h-3 w-3" />
        </Link>

        {/* Notification Bell */}
        <button
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
        </button>
      </div>
    </header>
  );
}
