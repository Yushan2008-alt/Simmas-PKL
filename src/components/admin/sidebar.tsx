"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Activity,
  GraduationCap,
  Users,
  Building2,
  Briefcase,
  Settings,
  ScrollText,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const menuGroups = [
    {
      groupLabel: "OVERVIEW",
      items: [
        {
          title: "Dashboard",
          href: "/admin/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Monitoring Realtime",
          href: "/admin/monitoring",
          icon: Activity,
        },
      ],
    },
    {
      groupLabel: "MASTER DATA",
      items: [
        {
          title: "Data Siswa",
          href: "/admin/siswa",
          icon: GraduationCap,
        },
        {
          title: "Data Guru Pembimbing",
          href: "/admin/guru",
          icon: Users,
        },
        {
          title: "Mitra DUDI",
          href: "/admin/dudi",
          icon: Building2,
        },
      ],
    },
    {
      groupLabel: "MANAJEMEN & SISTEM",
      items: [
        {
          title: "Penempatan Magang",
          href: "/admin/penempatan",
          icon: Briefcase,
        },
        {
          title: "Log Audit Sistem",
          href: "/admin/logs",
          icon: ScrollText,
        },
        {
          title: "Pengaturan SIMMAS",
          href: "/admin/settings",
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:translate-x-0",
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-border">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm text-primary-foreground font-bold">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-extrabold tracking-tight text-foreground">
                SIMMAS
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary">
                ADMIN
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
                const IconComponent = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={idx}
                    href={item.href}
                    onClick={() => {
                      if (onClose) onClose();
                    }}
                    className={cn(
                      "flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                        : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                        )}
                      />
                      <span>{item.title}</span>
                    </div>
                    {isActive && (
                      <ChevronRight className="h-3.5 w-3.5 text-primary-foreground/70" />
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
