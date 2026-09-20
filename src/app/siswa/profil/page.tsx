"use client";

import * as React from "react";
import Link from "next/link";
import {
  User,
  GraduationCap,
  Building2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  KeyRound,
  ExternalLink,
  ChevronRight,
  Briefcase,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getActiveSiswa, getStudentPlacement } from "@/lib/supabase/services";
import { Siswa, Penempatan } from "@/types/database";

export default function SiswaProfilPage() {
  const [siswa, setSiswa] = React.useState<Siswa>(getActiveSiswa());
  const [placement, setPlacement] = React.useState<Penempatan | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Editable fields
  const [phone, setPhone] = React.useState("0812-3456-7890");
  const [address, setAddress] = React.useState("Jl. Merdeka No. 45, Jakarta Selatan");
  const [emergencyContact, setEmergencyContact] = React.useState("0812-9876-5432 (Orang Tua)");
  const [isSaving, setIsSaving] = React.useState(false);

  // Password modal simulation
  const [showPasswordModal, setShowPasswordModal] = React.useState(false);
  const [oldPassword, setOldPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const loadData = React.useCallback(async () => {
    try {
      const current = getActiveSiswa();
      setSiswa(current);
      const place = await getStudentPlacement(current.id);
      setPlacement(place);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    if (typeof window !== "undefined") {
      window.addEventListener("simmas_siswa_updated", handleUpdate);
      window.addEventListener("simmas_penempatan_updated", handleUpdate);
      return () => {
        window.removeEventListener("simmas_siswa_updated", handleUpdate);
        window.removeEventListener("simmas_penempatan_updated", handleUpdate);
      };
    }
  }, [loadData]);

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Kontak Berhasil Diperbarui", {
        description: "Data kontak dan alamat Anda telah tersimpan dalam sistem.",
      });
    }, 600);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Gagal", {
        description: "Password baru minimal 6 karakter.",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Gagal", {
        description: "Konfirmasi password baru tidak cocok.",
      });
      return;
    }

    toast.success("Password Berhasil Diubah", {
      description: "Gunakan password baru Anda pada saat login berikutnya.",
    });
    setShowPasswordModal(false);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const isSedangMagang = siswa.status === "Sedang Magang";

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-10 max-w-7xl mx-auto w-full">
      {/* Breadcrumb Header */}
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            <Link href="/siswa/dashboard" className="hover:text-foreground transition-colors">
              SIMMAS
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span>Akun</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">Profil Siswa</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-foreground">
            Profil & Data Akun
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola informasi data pribadi, kontak darurat, dan pantau status pembimbing magang Anda.
          </p>
        </div>

        <div className="flex items-center gap-2.5 mt-2 sm:mt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPasswordModal(true)}
            className="border-border text-foreground font-semibold gap-1.5"
          >
            <KeyRound className="h-4 w-4 text-blue-600" />
            Ubah Password
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Student Bio Card */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 opacity-90" />

            <div className="relative mt-8 mb-4 flex h-24 w-24 items-center justify-center rounded-2xl bg-white dark:bg-card border-4 border-card shadow-lg text-blue-600 font-black text-3xl">
              {siswa.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </div>

            <h2 className="text-xl font-bold tracking-tight text-foreground">{siswa.name}</h2>
            <p className="text-xs font-medium text-muted-foreground mt-0.5">{siswa.email}</p>

            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                <GraduationCap className="h-3.5 w-3.5" />
                {siswa.class_name}
              </span>

              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                  isSedangMagang
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900"
                    : "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-900"
                }`}
              >
                {isSedangMagang ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Sedang Magang
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3.5 w-3.5" />
                    {siswa.status}
                  </>
                )}
              </span>
            </div>

            <div className="w-full border-t border-border mt-6 pt-5 flex flex-col gap-3 text-left">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Nomor Induk Siswa (NIS)</span>
                <span className="font-bold text-foreground font-mono">{siswa.nis}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Program Keahlian</span>
                <span className="font-semibold text-foreground">Rekayasa Perangkat Lunak</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Tahun Ajaran</span>
                <span className="font-semibold text-foreground">2025/2026 Ganjil</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Status Akun</span>
                <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Aktif & Terverifikasi
                </span>
              </div>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              Ketentuan Pelaksanaan Magang
            </h3>
            <ul className="text-xs text-muted-foreground space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <span>Presensi harian wajib dilakukan 2 kali: Jam Datang dan Jam Pulang di lokasi industri.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <span>Pengisian jurnal harian dilakukan setiap hari kerja dan akan diverifikasi oleh guru pembimbing.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <span>Segera hubungi guru pembimbing jika terjadi kendala teknis atau masalah di tempat magang.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Contact Edit & Placement Information */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Placement Details Card */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div className="flex items-center justify-between mb-5 border-b border-border pb-4">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  Status Penempatan PKL / Magang
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Informasi tempat industri, posisi magang, dan guru pembimbing sekolah.
                </p>
              </div>

              {isSedangMagang ? (
                <span className="rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-3 py-1 text-xs font-bold">
                  Aktif Ditempatkan
                </span>
              ) : (
                <Link href="/siswa/pengajuan">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs gap-1.5">
                    Ajukan Magang
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              )}
            </div>

            {isSedangMagang && placement ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <span className="text-xs text-muted-foreground font-medium block mb-1">Perusahaan / DU/DI</span>
                  <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    {placement.dudi?.name || "PT Telkom Indonesia (Persero) Tbk"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1">
                    <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    {placement.dudi?.address || "Jl. Japati No. 1, Bandung, Jawa Barat"}
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <span className="text-xs text-muted-foreground font-medium block mb-1">Guru Pembimbing Sekolah</span>
                  <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <UserCheck className="h-4 w-4 text-indigo-600" />
                    {placement.teacher?.name || "Dr. Budi Santoso, M.Kom"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    NIP: {placement.teacher?.nip || "198501012010011005"}
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <span className="text-xs text-muted-foreground font-medium block mb-1">Pembimbing Lapangan (PIC DUDI)</span>
                  <p className="text-sm font-bold text-foreground">
                    {placement.dudi?.pic_name || "Hendra Wijaya, S.T."}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    {placement.dudi?.pic_phone || "0812-8899-0011"}
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <span className="text-xs text-muted-foreground font-medium block mb-1">Periode Magang</span>
                  <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    {placement.start_date} s.d. {placement.end_date}
                  </p>
                  <p className="text-xs text-emerald-600 font-medium mt-1">
                    Durasi: 3 Bulan Pelaksanaan PKL
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-amber-300 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20 p-6 text-center">
                <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-400 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-foreground">Belum Memiliki Penempatan Aktif</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1 mb-4">
                  Anda sedang dalam status pengajuan atau belum diverifikasi oleh pihak sekolah. Silakan periksa status di menu Pengajuan Magang.
                </p>
                <Link href="/siswa/pengajuan">
                  <Button size="sm" variant="outline" className="border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200">
                    Buka Halaman Pengajuan Magang
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Contact Information & Editable Form */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div className="border-b border-border pb-4 mb-5">
              <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Informasi Kontak & Alamat Siswa
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pastikan nomor telepon dan alamat domisili selalu diperbarui agar pihak sekolah dan industri dapat menghubungi Anda.
              </p>
            </div>

            <form onSubmit={handleSaveContact} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1.5">
                    Nomor WhatsApp / HP Siswa
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full rounded-xl border border-border bg-background pl-9 pr-4 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground block mb-1.5">
                    Kontak Darurat (Orang Tua / Wali)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)}
                      required
                      className="w-full rounded-xl border border-border bg-background pl-9 pr-4 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1.5">
                  Alamat Tempat Tinggal / Domisili
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="w-full rounded-xl border border-border bg-background pl-9 pr-4 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5 shadow-xs"
                >
                  <Save className="h-3.5 w-3.5" />
                  {isSaving ? "Menyimpan..." : "Simpan Perubahan Kontak"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal Ubah Password */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold">
                  <KeyRound className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-foreground">Ubah Password Akun</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Password Saat Ini</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  placeholder="Masukkan password saat ini"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Password Baru</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Minimal 6 karakter"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Konfirmasi Password Baru</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Ulangi password baru"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border mt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPasswordModal(false)}
                  className="border-border text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                >
                  Simpan Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
