"use client";

import * as React from "react";
import Link from "next/link";
import {
  Building2,
  Calendar,
  Clock,
  ClipboardCheck,
  Camera,
  FilePlus,
  Lock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  UserCheck,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  getActiveSiswa,
  getActivePengajuan,
  getStudentPlacement,
  getTodayAbsensi,
  getJurnalList,
  verifyPengajuan,
  resetSiswaDemo,
  checkInSiswa,
  checkOutSiswa,
} from "@/lib/supabase/services";
import { Siswa, PengajuanMagang, Penempatan, Absensi, Jurnal } from "@/types/database";
import { CameraCaptureModal } from "@/components/siswa/camera-capture-modal";

export default function SiswaDashboardPage() {
  const [siswa, setSiswa] = React.useState<Siswa>(getActiveSiswa());
  const [pengajuan, setPengajuan] = React.useState<PengajuanMagang | null>(null);
  const [placement, setPlacement] = React.useState<Penempatan | null>(null);
  const [todayAbsensi, setTodayAbsensi] = React.useState<Absensi | null>(null);
  const [jurnals, setJurnals] = React.useState<Jurnal[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Camera modal state
  const [cameraModal, setCameraModal] = React.useState<{
    isOpen: boolean;
    type: "DATANG" | "PULANG";
  }>({ isOpen: false, type: "DATANG" });

  const loadData = React.useCallback(async () => {
    try {
      const currentSiswa = getActiveSiswa();
      setSiswa(currentSiswa);

      const [peng, place, abs, jList] = await Promise.all([
        getActivePengajuan(currentSiswa.id),
        getStudentPlacement(currentSiswa.id),
        getTodayAbsensi(currentSiswa.id),
        getJurnalList({ studentId: currentSiswa.id }),
      ]);

      setPengajuan(peng);
      setPlacement(place);
      setTodayAbsensi(abs);
      setJurnals(jList);
    } catch (e) {
      console.error("Failed to load siswa dashboard data:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    if (typeof window !== "undefined") {
      window.addEventListener("simmas_pengajuan_updated", handleUpdate);
      window.addEventListener("simmas_siswa_updated", handleUpdate);
      window.addEventListener("simmas_absensi_updated", handleUpdate);
      window.addEventListener("simmas_jurnal_updated", handleUpdate);
      window.addEventListener("simmas_penempatan_updated", handleUpdate);
      return () => {
        window.removeEventListener("simmas_pengajuan_updated", handleUpdate);
        window.removeEventListener("simmas_siswa_updated", handleUpdate);
        window.removeEventListener("simmas_absensi_updated", handleUpdate);
        window.removeEventListener("simmas_jurnal_updated", handleUpdate);
        window.removeEventListener("simmas_penempatan_updated", handleUpdate);
      };
    }
  }, [loadData]);

  // Demo simulator functions
  const handleSimulateVerify = async () => {
    if (!pengajuan) return;
    try {
      await verifyPengajuan(pengajuan.id);
      toast.success("Pengajuan Berhasil Disetujui Sekolah!", {
        description: "Status siswa kini 'Sedang Magang'. Modul Presensi & Jurnal otomatis terbuka.",
      });
      loadData();
    } catch (e: any) {
      toast.error("Gagal verifikasi pengajuan", {
        description: e?.message || "Terjadi kesalahan.",
      });
    }
  };

  const handleResetDemo = async () => {
    try {
      await resetSiswaDemo(siswa.id);
      toast.info("Demo di-reset ke status 'Belum Magang'", {
        description: "Pengajuan kembali berstatus 'Menunggu Verifikasi'.",
      });
      loadData();
    } catch (e: any) {
      toast.error("Gagal reset demo", {
        description: e?.message || "Terjadi kesalahan.",
      });
    }
  };

  const handleCameraCapture = async (photoBase64: string) => {
    try {
      if (cameraModal.type === "DATANG") {
        await checkInSiswa(siswa.id, photoBase64, "Hadir");
        toast.success("Presensi Datang Berhasil Disimpan!", {
          description: "Foto bukti kehadiran webcam dan jam masuk telah tercatat.",
        });
      } else {
        await checkOutSiswa(siswa.id, photoBase64);
        toast.success("Presensi Pulang Berhasil Disimpan!", {
          description: "Foto bukti kepulangan webcam dan jam pulang telah tercatat.",
        });
      }
      loadData();
    } catch (e: any) {
      toast.error("Gagal menyimpan presensi", {
        description: e?.message || "Terjadi kesalahan.",
      });
    }
  };

  const isBelumMagang = siswa.status === "Belum Magang";

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto">
      {/* Top Banner / Student Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/10 text-purple-600">
              Portal Siswa Magang
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">NIS: {siswa.nis}</span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">{siswa.class_name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Halo, {siswa.name}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Kelola pengajuan tempat magang, presensi harian webcam, dan jurnal kegiatan harian.
          </p>
        </div>

        {/* Demo Simulator Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          {isBelumMagang ? (
            <Button
              onClick={handleSimulateVerify}
              className="rounded-xl h-10 px-4 text-xs font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
            >
              <Sparkles className="h-4 w-4" />
              <span>Verifikasi Pengajuan (Simulasi Unlock)</span>
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={handleResetDemo}
              className="rounded-xl h-10 px-4 text-xs font-semibold gap-2 border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reset Status ke &apos;Belum Magang&apos; (Demo)</span>
            </Button>
          )}
        </div>
      </div>

      {/* CASE 1: BELUM MAGANG (PUNYA PENGAJUAN MENUNGGU VERIFIKASI) */}
      {isBelumMagang ? (
        <div className="space-y-6">
          {/* Active Application Review Banner */}
          {pengajuan && pengajuan.status === "Menunggu Verifikasi" ? (
            <div className="rounded-3xl border border-amber-300/80 bg-amber-500/5 p-6 sm:p-8 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
                      SEDANG DITINJAU SEKOLAH
                    </span>
                    <h2 className="text-lg font-bold text-foreground mt-1">
                      Pengajuan Tempat Magang Anda Sedang Diverifikasi
                    </h2>
                  </div>
                </div>

                <Link href="/siswa/pengajuan">
                  <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold gap-1 border-amber-300 text-amber-800 hover:bg-amber-100/50">
                    <span>Lihat Rincian Pengajuan</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-amber-200/60 text-xs">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    DUDI Pilihan
                  </p>
                  <p className="font-bold text-foreground text-sm mt-0.5 flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-primary" />
                    {pengajuan.dudi?.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{pengajuan.dudi?.sector}</p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Posisi yang Diajukan
                  </p>
                  <p className="font-bold text-foreground text-sm mt-0.5">
                    {pengajuan.position}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Periode: {pengajuan.start_date} s/d {pengajuan.end_date}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Tanggal Diajukan
                  </p>
                  <p className="font-bold text-foreground text-sm mt-0.5 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-primary" />
                    {pengajuan.created_at ? new Date(pengajuan.created_at).toLocaleDateString("id-ID") : "-"}
                  </p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium">
                    Menunggu verifikasi guru koordinator & admin
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* No application yet banner */
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 text-center space-y-3">
              <Building2 className="h-10 w-10 text-muted-foreground mx-auto opacity-50" />
              <h2 className="text-lg font-bold text-foreground">
                Anda Belum Memiliki Pengajuan Magang
              </h2>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Silakan pilih mitra industri (DUDI) yang tersedia dan ajukan posisi magang yang Anda minati.
              </p>
              <Link href="/siswa/pengajuan">
                <Button className="rounded-xl font-bold text-xs gap-1.5 mt-2">
                  <FilePlus className="h-4 w-4" />
                  <span>Ajukan Tempat Magang Sekarang</span>
                </Button>
              </Link>
            </div>
          )}

          {/* Locked Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Locked Absensi Card */}
            <div className="relative rounded-2xl border border-dashed border-border bg-muted/20 p-6 space-y-3 overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-muted text-muted-foreground">
                    <Camera className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Presensi Harian</h3>
                    <p className="text-xs text-muted-foreground">Presensi Datang & Pulang Webcam</p>
                  </div>
                </div>
                <span className="p-2 rounded-full bg-muted text-muted-foreground">
                  <Lock className="h-4 w-4" />
                </span>
              </div>
              <div className="p-4 rounded-xl bg-background/60 border border-border text-xs text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                  <span>Fitur Terkunci</span>
                </p>
                <p className="text-[11px]">
                  Absensi harian terkunci hingga tempat magang dan guru pembimbing Anda ditetapkan oleh pihak sekolah.
                </p>
              </div>
            </div>

            {/* Locked Jurnal Card */}
            <div className="relative rounded-2xl border border-dashed border-border bg-muted/20 p-6 space-y-3 overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-muted text-muted-foreground">
                    <ClipboardCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Jurnal Kegiatan</h3>
                    <p className="text-xs text-muted-foreground">Laporan Aktivitas Harian Siswa</p>
                  </div>
                </div>
                <span className="p-2 rounded-full bg-muted text-muted-foreground">
                  <Lock className="h-4 w-4" />
                </span>
              </div>
              <div className="p-4 rounded-xl bg-background/60 border border-border text-xs text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                  <span>Fitur Terkunci</span>
                </p>
                <p className="text-[11px]">
                  Pengisian jurnal kegiatan harian terkunci hingga Anda resmi ditempatkan di mitra industri (DUDI).
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* CASE 2: SEDANG MAGANG (AKTIF PENUH) */
        <div className="space-y-8">
          {/* Active Placement Card */}
          <div className="rounded-3xl border border-emerald-200/80 bg-emerald-500/5 p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                    AKTIF MAGANG
                  </span>
                  <h2 className="text-lg font-bold text-foreground mt-1">
                    {placement?.dudi?.name || "PT Telkom Indonesia"}
                  </h2>
                </div>
              </div>

              <span className="text-xs text-muted-foreground">
                Periode: {placement?.start_date || "2026-08-01"} s/d {placement?.end_date || "2026-11-30"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-emerald-200/60 text-xs">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Alamat Industri
                </p>
                <p className="font-semibold text-foreground mt-0.5">
                  {placement?.dudi?.address || "Jl. Ketintang No. 156, Surabaya"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  PIC: {placement?.dudi?.pic_name || "Rina Wijaya"} ({placement?.dudi?.pic_phone || "081234567891"})
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Guru Pembimbing
                </p>
                <p className="font-bold text-foreground text-sm mt-0.5">
                  {placement?.teacher?.name || "Dr. Budi Santoso, M.Kom"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  NIP: {placement?.teacher?.nip || "198501012010011005"}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Status Presensi Hari Ini
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      todayAbsensi?.check_in_time
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {todayAbsensi?.check_in_time
                      ? `Masuk: ${todayAbsensi.check_in_time}`
                      : "Belum Presensi Datang"}
                  </span>
                  {todayAbsensi?.check_out_time && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                      Pulang: {todayAbsensi.check_out_time}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Presensi & Jurnal */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Presensi Datang Card */}
            <div className="p-5 rounded-2xl border border-border bg-card shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600">
                  <Camera className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  Presensi Pagi
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Presensi Datang</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {todayAbsensi?.check_in_time
                    ? `Sudah presensi jam ${todayAbsensi.check_in_time}`
                    : "Wajib live camera selfie saat tiba di kantor"}
                </p>
              </div>
              <Button
                onClick={() => setCameraModal({ isOpen: true, type: "DATANG" })}
                disabled={!!todayAbsensi?.check_in_time}
                className="w-full rounded-xl text-xs font-bold gap-1.5 h-10"
              >
                <Camera className="h-3.5 w-3.5" />
                <span>
                  {todayAbsensi?.check_in_time ? "Sudah Presensi Datang" : "Presensi Datang Sekarang"}
                </span>
              </Button>
            </div>

            {/* Presensi Pulang Card */}
            <div className="p-5 rounded-2xl border border-border bg-card shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600">
                  <Clock className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  Presensi Sore
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Presensi Pulang</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {todayAbsensi?.check_out_time
                    ? `Sudah presensi pulang jam ${todayAbsensi.check_out_time}`
                    : "Ambil foto selfie saat jam kerja berakhir"}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setCameraModal({ isOpen: true, type: "PULANG" })}
                disabled={!todayAbsensi?.check_in_time || !!todayAbsensi?.check_out_time}
                className="w-full rounded-xl text-xs font-bold gap-1.5 h-10"
              >
                <Camera className="h-3.5 w-3.5" />
                <span>
                  {todayAbsensi?.check_out_time
                    ? "Sudah Presensi Pulang"
                    : "Presensi Pulang Sekarang"}
                </span>
              </Button>
            </div>

            {/* Tulis Jurnal Card */}
            <div className="p-5 rounded-2xl border border-border bg-card shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
                  <ClipboardCheck className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  Laporan Harian
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Jurnal Kegiatan</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {jurnals.length} Laporan terisi • {jurnals.filter((j) => j.status === "Pending").length} Pending
                </p>
              </div>
              <Link href="/siswa/jurnal">
                <Button className="w-full rounded-xl text-xs font-bold gap-1.5 h-10 bg-emerald-600 hover:bg-emerald-700 text-white">
                  <ClipboardCheck className="h-3.5 w-3.5" />
                  <span>Buka Jurnal Kegiatan</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={cameraModal.isOpen}
        title={cameraModal.type === "DATANG" ? "Presensi Datang (Webcam)" : "Presensi Pulang (Webcam)"}
        subtitle="Foto diambil langsung melalui kamera browser tanpa fitur upload file"
        onClose={() => setCameraModal({ isOpen: false, type: "DATANG" })}
        onCaptureConfirm={handleCameraCapture}
      />
    </div>
  );
}
