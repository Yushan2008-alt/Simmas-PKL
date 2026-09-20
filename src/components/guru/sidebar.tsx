"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  CalendarCheck,
  GraduationCap,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getActiveGuru, logoutUser } from "@/lib/supabase/services";

interface GuruSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function GuruSidebar({ isOpen, onClose }: GuruSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [guru, setGuru] = React.useState(getActiveGuru());

  React.useEffect(() => {
    setGuru(getActiveGuru());

    const handleAuthChange = () => setGuru(getActiveGuru());
    if (typeof window !== "undefined") {
      window.addEventListener("simmas_auth_changed", handleAuthChange);
      return () => window.removeEventListener("simmas_auth_changed", handleAuthChange);
    }
  }, []);

  const menuGroups = [
    {
      groupLabel: "UTAMA",
      items: [
        {
          title: "Dashboard",
          href: "/guru/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      groupLabel: "PEMBIMBINGAN",
      items: [
        {
          title: "Siswa Bimbingan",
          href: "/guru/siswa",
          icon: Users,
        },
        {
          title: "Jurnal & Absensi",
          href: "/guru/jurnal",
          icon: ClipboardCheck,
        },
        {
          title: "Kunjungan Lapangan",
          href: "/guru/kunjungan",
          icon: CalendarCheck,
        },
      ],
    },
  ];

  const handleLogout = () => {
    logoutUser();
    toast.success("Berhasil keluar", {
      description: "Anda telah keluar dari sesi Guru Pembimbing.",
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
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:translate-x-0",
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-border">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-sm text-white font-bold">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-extrabold tracking-tight text-foreground">
                SIMMAS
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                GURU
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Menus */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {menuGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1.5">
              <p className="px-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-muted-foreground/80 mb-2">
                {group.groupLabel}
              </p>
              {group.items.map((item, idx) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={idx}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all group",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25 font-bold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={cn(
                          "h-4 w-4 transition-colors",
                          isActive
                            ? "text-primary-foreground"
                            : "text-muted-foreground group-hover:text-foreground"
                        )}
                      />
                      <span>{item.title}</span>
                    </div>
                    {isActive && (
                      <ChevronRight className="h-4 w-4 text-primary-foreground/70" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-4 border-t border-border bg-muted/20">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-background border border-border/80 shadow-2xs mb-3">
            <div className="h-9 w-9 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
              {guruInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-foreground truncate">
                {guru.name}
              </p>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3 w-3 text-blue-600" />
                <p className="text-[10px] font-medium text-muted-foreground truncate">
                  Guru Pembimbing
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Keluar Sesi</span>
          </button>
        </div>
      </aside>
    </>
  );
}
