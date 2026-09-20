"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FilePlus,
  Camera,
  ClipboardCheck,
  GraduationCap,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SiswaSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function SiswaSidebar({ isOpen, onClose }: SiswaSidebarProps) {
  const pathname = usePathname();

  const menuGroups = [
    {
      groupLabel: "UTAMA",
      items: [
        {
          title: "Dashboard",
          href: "/siswa/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      groupLabel: "AKTIVITAS MAGANG",
      items: [
        {
          title: "Pengajuan Magang",
          href: "/siswa/pengajuan",
          icon: FilePlus,
        },
        {
          title: "Presensi Harian",
          href: "/siswa/absensi",
          icon: Camera,
        },
        {
          title: "Jurnal Kegiatan",
          href: "/siswa/jurnal",
          icon: ClipboardCheck,
        },
      ],
    },
  ];

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
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 shadow-sm text-white font-bold">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-extrabold tracking-tight text-foreground">
                SIMMAS
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400">
                SISWA
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
      </aside>
    </>
  );
}
