"use client";

import * as React from "react";
import { Settings, Save, School, AppWindow, Globe, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSystemSettings, updateSystemSettings } from "@/lib/supabase/services";
import { SystemSettings } from "@/types/database";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState<"general" | "landing" | "school">("general");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const [settings, setSettings] = React.useState<SystemSettings>({
    general: {
      appName: "SIMMAS",
      appDescription: "Sistem Informasi Manajemen Magang Siswa",
      contactEmail: "info@simmas.sch.id",
    },
    landing: {
      heroTitle: "Magang\nlebih\nteratur.",
      heroSubtitle: "Sistem Informasi Manajemen Magang Siswa",
      heroDescription:
        "Platform manajemen magang siswa SMK yang menghubungkan sekolah, guru pembimbing, dan dunia usaha dalam satu sistem terpadu.",
    },
    school: {
      schoolName: "SMK Negeri 1 Surabaya",
      schoolAddress: "Jl. SMEA No. 4, Wonokromo, Surabaya",
      schoolPhone: "(031) 8292038",
      schoolWebsite: "www.smkn1-sby.sch.id",
      principalName: "Drs. H. Sugiyono, M.Pd.",
      principalNip: "196503151989031008",
    },
  });

  React.useEffect(() => {
    async function load() {
      try {
        const data = await getSystemSettings();
        setSettings(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSystemSettings(activeTab, settings[activeTab]);
      toast.success("Pengaturan berhasil disimpan", {
        description: `Konfigurasi tab ${activeTab.toUpperCase()} telah diperbarui di database.`,
      });
    } catch (e) {
      toast.error("Gagal menyimpan pengaturan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
          Pengaturan Sistem
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Konfigurasi identitas platform, konten landing page, dan data kelembagaan sekolah.
        </p>
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-border gap-2">
        <button
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === "general"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <AppWindow className="h-4 w-4" />
          <span>Identitas Aplikasi</span>
        </button>

        <button
          onClick={() => setActiveTab("landing")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === "landing"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Globe className="h-4 w-4" />
          <span>Halaman Depan</span>
        </button>

        <button
          onClick={() => setActiveTab("school")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === "school"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <School className="h-4 w-4" />
          <span>Data Sekolah</span>
        </button>
      </div>

      {/* Tab Forms */}
      <form onSubmit={handleSave} className="bg-card p-6 sm:p-8 rounded-2xl border border-border shadow-xs space-y-5">
        {activeTab === "general" && (
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Nama Aplikasi
              </label>
              <Input
                value={settings.general.appName}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    general: { ...settings.general, appName: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Deskripsi Singkat Aplikasi
              </label>
              <Input
                value={settings.general.appDescription}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    general: { ...settings.general, appDescription: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Email Kontak Pengaduan / Helpdesk
              </label>
              <Input
                type="email"
                value={settings.general.contactEmail}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    general: { ...settings.general, contactEmail: e.target.value },
                  })
                }
              />
            </div>
          </div>
        )}

        {activeTab === "landing" && (
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Hero Headline (Judul Utama)
              </label>
              <Input
                value={settings.landing.heroTitle}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    landing: { ...settings.landing, heroTitle: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Hero Subtitle (Label Kecil Atas)
              </label>
              <Input
                value={settings.landing.heroSubtitle}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    landing: { ...settings.landing, heroSubtitle: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Deskripsi Penjelasan Hero
              </label>
              <textarea
                rows={3}
                value={settings.landing.heroDescription}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    landing: { ...settings.landing, heroDescription: e.target.value },
                  })
                }
                className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-xs sm:text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
          </div>
        )}

        {activeTab === "school" && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Nama Resmi Sekolah
                </label>
                <Input
                  value={settings.school.schoolName}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      school: { ...settings.school, schoolName: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Website Resmi
                </label>
                <Input
                  value={settings.school.schoolWebsite}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      school: { ...settings.school, schoolWebsite: e.target.value },
                    })
                  }
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Nama Kepala Sekolah
                </label>
                <Input
                  value={settings.school.principalName}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      school: { ...settings.school, principalName: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  NIP Kepala Sekolah
                </label>
                <Input
                  value={settings.school.principalNip}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      school: { ...settings.school, principalNip: e.target.value },
                    })
                  }
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Alamat Sekolah
              </label>
              <Input
                value={settings.school.schoolAddress}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    school: { ...settings.school, schoolAddress: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Nomor Telepon Kantor
              </label>
              <Input
                value={settings.school.schoolPhone}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    school: { ...settings.school, schoolPhone: e.target.value },
                  })
                }
              />
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-border flex justify-end">
          <Button type="submit" disabled={saving} className="gap-2 font-bold text-xs sm:text-sm">
            <Save className="h-4 w-4" />
            <span>{saving ? "Menyimpan..." : "Simpan Pengaturan"}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
