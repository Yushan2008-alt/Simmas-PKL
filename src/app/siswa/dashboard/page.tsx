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
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  getActiveSiswa,
  getDefaultSiswa,
  getActivePengajuan,
  getStudentPlacement,
  getTodayAbsensi,
  getJurnalList,
  verifyPengajuan,
  resetSiswaDemo,
  checkInSiswa,
  checkOutSiswa,
  revisiAbsensiSiswa,
} from "@/lib/supabase/services";
import { Siswa, PengajuanMagang, Penempatan, Absensi, Jurnal } from "@/types/database";
import { CameraCaptureModal } from "@/components/siswa/camera-capture-modal";

export default function SiswaDashboardPage() {
  const [siswa, setSiswa] = React.useState<Siswa>(() => getActiveSiswa());
  const [pengajuan, setPengajuan] = React.useState<PengajuanMagang | null>(null);
  const [placement, setPlacement] = React.useState<Penempatan | null>(null);
  const [todayAbsensi, setTodayAbsensi] = React.useState<Absensi | null>(null);
  const [jurnals, setJurnals] = React.useState<Jurnal[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Camera modal state
  const [cameraModal, setCameraModal] = React.useState<{
    isOpen: boolean;
    type: "DATANG" | "PULANG" | "REVISI_DATANG" | "REVISI_PULANG";
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
      window.addEventListener("simmas_auth_changed", handleUpdate);
      window.addEventListener("simmas_pengajuan_updated", handleUpdate);
      window.addEventListener("simmas_siswa_updated", handleUpdate);
      window.addEventListener("simmas_absensi_updated", handleUpdate);
      window.addEventListener("simmas_jurnal_updated", handleUpdate);
      window.addEventListener("simmas_penempatan_updated", handleUpdate);
      return () => {
        window.removeEventListener("simmas_auth_changed", handleUpdate);
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


  const handleCameraCapture = async (photoBase64: string) => {
    try {
      if (cameraModal.type === "DATANG") {
        await checkInSiswa(siswa.id, photoBase64, "Hadir");
        toast.success("Presensi Datang Berhasil Disimpan!", {
          description: "Foto bukti kehadiran webcam dan jam masuk telah tercatat.",
        });
      } else if (cameraModal.type === "PULANG") {
        await checkOutSiswa(siswa.id, photoBase64);
        toast.success("Presensi Pulang Berhasil Disimpan!", {
          description: "Foto bukti kepulangan webcam dan jam pulang telah tercatat.",
        });
      } else if (cameraModal.type === "REVISI_DATANG" || cameraModal.type === "REVISI_PULANG") {
        if (!todayAbsensi?.id) throw new Error("ID presensi tidak ditemukan");
        await revisiAbsensiSiswa(
          todayAbsensi.id,
          photoBase64,
          cameraModal.type === "REVISI_DATANG" ? "DATANG" : "PULANG"
        );
        toast.success("Foto Presensi Berhasil Direvisi!", {
          description: "Foto baru telah dikirim dan menunggu validasi ulang oleh guru pembimbing.",
        });
      }
      loadData();
    } catch (e: any) {
      toast.error("Gagal menyimpan presensi", {
        description: e?.message || "Terjadi kesalahan.",
      });
    }
  };

  const isDatangNeedRevision =
    (todayAbsensi?.validation_status === "Perlu Revisi" ||
      todayAbsensi?.validation_status === "Ditolak") &&
    (!todayAbsensi?.validation_target ||
      todayAbsensi?.validation_target === "DATANG" ||
      todayAbsensi?.validation_target === "SEMUA");

  const isPulangNeedRevision =
    (todayAbsensi?.validation_status === "Perlu Revisi" ||
      todayAbsensi?.validation_status === "Ditolak") &&
    (todayAbsensi?.validation_target === "PULANG" ||
      todayAbsensi?.validation_target === "SEMUA");

  const isBelumMagang = siswa.status === "Belum Magang" || !placement;

  return (
    <div className="space-y-6 w-full">
      {/* CASE 1: BELUM MAGANG (SESUAI GAMBAR SCREENSHOT 2) */}
      {isBelumMagang ? (
        <div className="w-full rounded-2xl sm:rounded-3xl border border-border bg-card p-12 sm:p-20 text-center shadow-xs flex flex-col items-center justify-center min-h-[420px]">
          <div className="h-16 w-16 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mb-5">
            <Send className="h-7 w-7 -rotate-45 ml-1 text-blue-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Belum Mengajukan Magang
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto mt-2 mb-7 leading-relaxed">
            Anda belum mengajukan tempat magang atau pengajuan Anda masih dalam tahap verifikasi oleh Admin.
          </p>
          <Link href="/siswa/pengajuan">
            <Button className="rounded-xl px-7 h-11 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs">
              Ajukan Tempat Magang Sekarang
            </Button>
          </Link>

          {/* Subtle simulation helper for developer/demo test */}
          <div className="pt-10">
            <button
              onClick={handleSimulateVerify}
              className="text-[11px] text-muted-foreground/60 hover:text-primary transition-colors flex items-center gap-1 mx-auto"
            >
              <Sparkles className="h-3 w-3" />
              <span>Simulasi Cepat: Langsung Verifikasi &amp; Masuk ke Magang Aktif</span>
            </button>
          </div>
        </div>
      ) : (
        /* CASE 2: SEDANG MAGANG (AKTIF PENUH) */
        <div className="space-y-8">
          {/* Top Banner / Student Greeting */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/60">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/10 text-purple-600">
                  Portal Siswa Magang
                </span>
                <span className="text-xs text-muted-foreground">•</span>
                <span suppressHydrationWarning className="text-xs text-muted-foreground">NIS: {siswa.nis}</span>
                <span className="text-xs text-muted-foreground">•</span>
                <span suppressHydrationWarning className="text-xs text-muted-foreground">{siswa.class_name}</span>
              </div>
              <h1 suppressHydrationWarning className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Halo, {siswa.name}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Kelola pengajuan tempat magang, presensi harian webcam, dan jurnal kegiatan harian.
              </p>
            </div>
          </div>

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
                    {placement?.dudi?.name || "Mitra Industri DUDI"}
                  </h2>
                </div>
              </div>

              <span className="text-xs text-muted-foreground">
                Periode: {placement?.start_date || "-"} s/d {placement?.end_date || "-"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-emerald-200/60 text-xs">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Alamat Industri
                </p>
                <p className="font-semibold text-foreground mt-0.5">
                  {placement?.dudi?.address || "-"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  PIC: {placement?.dudi?.pic_name || "-"} ({placement?.dudi?.pic_phone || "-"})
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Guru Pembimbing
                </p>
                <p className="font-bold text-foreground text-sm mt-0.5">
                  {placement?.teacher?.name || "Belum Ditugaskan"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  NIP: {placement?.teacher?.nip || "-"}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Status Presensi Hari Ini
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      todayAbsensi?.validation_status === "Perlu Revisi" ||
                      todayAbsensi?.validation_status === "Ditolak"
                        ? "bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950 dark:text-amber-300"
                        : todayAbsensi?.check_in_time
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {todayAbsensi?.validation_status === "Perlu Revisi" ||
                    todayAbsensi?.validation_status === "Ditolak"
                      ? todayAbsensi.validation_target === "PULANG"
                        ? "Foto Pulang Perlu Revisi"
                        : todayAbsensi.validation_target === "DATANG"
                        ? "Foto Masuk Perlu Revisi"
                        : "Foto Masuk & Pulang Perlu Revisi"
                      : todayAbsensi?.check_in_time
                      ? `Masuk: ${todayAbsensi.check_in_time}`
                      : "Belum Presensi Datang"}
                  </span>
                  {todayAbsensi?.check_out_time && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        (todayAbsensi?.validation_status === "Perlu Revisi" ||
                          todayAbsensi?.validation_status === "Ditolak") &&
                        (todayAbsensi.validation_target === "PULANG" ||
                          todayAbsensi.validation_target === "SEMUA")
                          ? "bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
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
                <div className="p-5 rounded-2xl border border-border bg-card shadow-2xs flex flex-col justify-between h-full">
                  <div className="space-y-3 mb-4">
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
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {isDatangNeedRevision
                          ? todayAbsensi?.validation_notes
                            ? `Catatan Guru: "${todayAbsensi.validation_notes}"`
                            : "Foto selfie masuk ditolak/kurang jelas, silakan ambil foto selfie ulang."
                          : todayAbsensi?.check_in_time
                          ? `Sudah presensi jam ${todayAbsensi.check_in_time}`
                          : "Wajib live camera selfie saat tiba di kantor"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-auto pt-2">
                    {isDatangNeedRevision ? (
                      <Button
                        onClick={() => setCameraModal({ isOpen: true, type: "REVISI_DATANG" })}
                        className="w-full rounded-xl text-xs font-bold gap-1.5 h-10 bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                      >
                        <Camera className="h-3.5 w-3.5" />
                        <span>Ambil Ulang Foto Masuk (Revisi)</span>
                      </Button>
                    ) : (
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
                    )}
                  </div>
                </div>

                {/* Presensi Pulang Card */}
                <div className="p-5 rounded-2xl border border-border bg-card shadow-2xs flex flex-col justify-between h-full">
                  <div className="space-y-3 mb-4">
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
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {isPulangNeedRevision
                          ? todayAbsensi?.validation_notes
                            ? `Catatan Guru: "${todayAbsensi.validation_notes}"`
                            : "Foto selfie pulang ditolak/kurang jelas, silakan ambil foto selfie ulang."
                          : todayAbsensi?.check_out_time
                          ? `Sudah presensi pulang jam ${todayAbsensi.check_out_time}`
                          : "Ambil foto selfie saat jam kerja berakhir"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-auto pt-2">
                    {isPulangNeedRevision ? (
                      <Button
                        onClick={() => setCameraModal({ isOpen: true, type: "REVISI_PULANG" })}
                        className="w-full rounded-xl text-xs font-bold gap-1.5 h-10 bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                      >
                        <Camera className="h-3.5 w-3.5" />
                        <span>Ambil Ulang Foto Pulang (Revisi)</span>
                      </Button>
                    ) : (
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
                    )}
                  </div>
                </div>

            {/* Tulis Jurnal Card */}
            <div className="p-5 rounded-2xl border border-border bg-card shadow-2xs flex flex-col justify-between h-full">
              <div className="space-y-3 mb-4">
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
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {jurnals.length} Laporan terisi • {jurnals.filter((j) => j.status === "Pending").length} Pending
                  </p>
                </div>
              </div>
              <div className="mt-auto pt-2">
                <Link href="/siswa/jurnal" className="block w-full">
                  <Button className="w-full rounded-xl text-xs font-bold gap-1.5 h-10 bg-emerald-600 hover:bg-emerald-700 text-white">
                    <ClipboardCheck className="h-3.5 w-3.5" />
                    <span>Buka Jurnal Kegiatan</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={cameraModal.isOpen}
        title={
          cameraModal.type === "REVISI_DATANG"
            ? "Revisi Foto Presensi Datang"
            : cameraModal.type === "REVISI_PULANG"
            ? "Revisi Foto Presensi Pulang"
            : cameraModal.type === "DATANG"
            ? "Presensi Datang (Webcam)"
            : "Presensi Pulang (Webcam)"
        }
        subtitle={
          cameraModal.type === "REVISI_DATANG" || cameraModal.type === "REVISI_PULANG"
            ? "Ambil ulang foto selfie bukti kehadiran yang jelas sesuai arahan guru pembimbing"
            : "Foto diambil langsung melalui kamera browser tanpa fitur upload file"
        }
        onClose={() => setCameraModal({ isOpen: false, type: "DATANG" })}
        onCaptureConfirm={handleCameraCapture}
      />
    </div>
  );
}
