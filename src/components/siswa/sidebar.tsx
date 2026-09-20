"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FilePlus,
  Camera,
  ClipboardCheck,
  User,
  GraduationCap,
  LogOut,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getActiveSiswa, logoutUser } from "@/lib/supabase/services";

interface SiswaSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function SiswaSidebar({ isOpen, onClose }: SiswaSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [siswa, setSiswa] = React.useState(getActiveSiswa());

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
    {
      groupLabel: "AKUN",
      items: [
        {
          title: "Profil Siswa",
          href: "/siswa/profil",
          icon: User,
        },
      ],
    },
  ];

  const handleLogout = () => {
    logoutUser();
    toast.success("Berhasil keluar", {
      description: "Anda telah keluar dari sesi Siswa SIMMAS.",
    });
    router.push("/login");
  };

  const isSedangMagang = siswa.status === "Sedang Magang";

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

        {/* User Card & Logout Footer */}
        <div className="p-4 border-t border-border bg-muted/20">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-background border border-border/80 shadow-2xs mb-3">
            <div className="h-9 w-9 rounded-xl bg-purple-600/10 text-purple-600 flex items-center justify-center font-bold text-xs shrink-0">
              {siswa.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-foreground truncate">
                {siswa.name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={cn(
                    "px-1.5 py-0.2 rounded text-[9px] font-extrabold",
                    isSedangMagang
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  )}
                >
                  {siswa.status}
                </span>
                <span className="text-[10px] text-muted-foreground truncate">
                  {siswa.class_name}
                </span>
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
