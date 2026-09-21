"use client";

import * as React from "react";
import Link from "next/link";
import {
  Camera,
  Clock,
  Calendar,
  CheckCircle2,
  Lock,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  UserCheck,
  Image as ImageIcon,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  getActiveSiswa,
  getDefaultSiswa,
  getTodayAbsensi,
  getAbsensiList,
  checkInSiswa,
  checkOutSiswa,
  revisiAbsensiSiswa,
  getStudentPlacement,
} from "@/lib/supabase/services";
import { Siswa, Absensi, Penempatan } from "@/types/database";
import { CameraCaptureModal } from "@/components/siswa/camera-capture-modal";

export default function SiswaAbsensiPage() {
  const [siswa, setSiswa] = React.useState<Siswa>(() => getActiveSiswa());
  const [placement, setPlacement] = React.useState<Penempatan | null>(null);
  const [todayAbsensi, setTodayAbsensi] = React.useState<Absensi | null>(null);
  const [history, setHistory] = React.useState<Absensi[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Camera modal state
  const [cameraModal, setCameraModal] = React.useState<{
    isOpen: boolean;
    type: "DATANG" | "PULANG" | "REVISI_DATANG" | "REVISI_PULANG";
    targetAbsensiId?: string;
  }>({ isOpen: false, type: "DATANG" });

  const [previewPhoto, setPreviewPhoto] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      const current = getActiveSiswa();
      setSiswa(current);

      const [place, today, allAbs] = await Promise.all([
        getStudentPlacement(current.id),
        getTodayAbsensi(current.id),
        getAbsensiList([current.id]),
      ]);

      setPlacement(place);
      setTodayAbsensi(today);
      setHistory(allAbs);
    } catch (e) {
      console.error("Failed to load absensi data:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    if (typeof window !== "undefined") {
      window.addEventListener("simmas_auth_changed", handleUpdate);
      window.addEventListener("simmas_absensi_updated", handleUpdate);
      window.addEventListener("simmas_siswa_updated", handleUpdate);
      window.addEventListener("simmas_penempatan_updated", handleUpdate);
      return () => {
        window.removeEventListener("simmas_auth_changed", handleUpdate);
        window.removeEventListener("simmas_absensi_updated", handleUpdate);
        window.removeEventListener("simmas_siswa_updated", handleUpdate);
        window.removeEventListener("simmas_penempatan_updated", handleUpdate);
      };
    }
  }, [loadData]);

  const handleCameraCapture = async (photoBase64: string) => {
    try {
      if (cameraModal.type === "DATANG") {
        await checkInSiswa(siswa.id, photoBase64, "Hadir");
        toast.success("Presensi Datang Berhasil Disimpan!", {
          description: "Foto bukti kehadiran webcam dan jam masuk telah tersimpan.",
        });
      } else if (cameraModal.type === "PULANG") {
        await checkOutSiswa(siswa.id, photoBase64);
        toast.success("Presensi Pulang Berhasil Disimpan!", {
          description: "Foto bukti kepulangan webcam dan jam pulang telah tersimpan.",
        });
      } else if (cameraModal.type === "REVISI_DATANG" || cameraModal.type === "REVISI_PULANG") {
        const absId = cameraModal.targetAbsensiId || todayAbsensi?.id;
        if (!absId) throw new Error("ID presensi tidak ditemukan");
        await revisiAbsensiSiswa(
          absId,
          photoBase64,
          cameraModal.type === "REVISI_DATANG" ? "DATANG" : "PULANG"
        );
        toast.success("Foto Presensi Berhasil Direvisi!", {
          description: "Foto baru telah tersimpan dan status verifikasi direset ke 'Menunggu'.",
        });
      }
      loadData();
    } catch (e: any) {
      toast.error("Gagal mencatat atau merevisi presensi", {
        description: e?.message || "Terjadi kesalahan.",
      });
    }
  };

  const isBelumMagang = siswa.status === "Belum Magang" || !placement;
  const todayFormatted = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6 w-full">
      {/* CASE 1: BELUM MAGANG (SESUAI GAMBAR SCREENSHOT 3) */}
      {isBelumMagang ? (
        <div className="space-y-6">
          {/* Top Warning Banner */}
          <div className="rounded-2xl border border-amber-300 bg-amber-500/10 p-5 sm:p-6 shadow-2xs">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-700 shrink-0 mt-0.5">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div className="space-y-1.5 flex-1">
                <h3 className="text-sm sm:text-base font-bold text-foreground">
                  Akses Kegiatan Magang Belum Aktif
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Anda belum memiliki tempat magang yang disetujui. Anda baru dapat mengisi absensi harian dan jurnal kegiatan setelah pengajuan tempat magang disetujui oleh Admin.
                </p>
                <div className="pt-2">
                  <Link href="/siswa/pengajuan">
                    <Button className="rounded-xl px-4 h-9 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white gap-1.5 shadow-xs">
                      <span>Ajukan Tempat Magang</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Status Kehadiran Hari Ini (Disabled) */}
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300 shrink-0">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Status Kehadiran Hari Ini
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Absensi terkunci hingga tempat magang dan guru pembimbing ditetapkan
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Button
                disabled
                className="rounded-xl px-4 h-10 text-xs font-bold bg-blue-600/60 text-white cursor-not-allowed opacity-60"
              >
                <span>→ Clock In</span>
              </Button>
              <Button
                disabled
                className="rounded-xl px-4 h-10 text-xs font-bold bg-amber-500/60 text-white cursor-not-allowed opacity-60"
              >
                <span>🚪 Clock Out</span>
              </Button>
            </div>
          </div>

          {/* Riwayat Bulan Ini Table */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              RIWAYAT BULAN INI
            </h4>
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/40 border-b border-border text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3.5">TANGGAL</th>
                      <th className="px-5 py-3.5">STATUS</th>
                      <th className="px-5 py-3.5">MASUK</th>
                      <th className="px-5 py-3.5">PULANG</th>
                      <th className="px-5 py-3.5 text-center">FOTO</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-xs text-muted-foreground">
                        Belum ada riwayat absensi.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* UNLOCKED ACTIVE STATE */
        <div className="space-y-8">
          {/* Alert Banner Perlu Revisi */}
          {(todayAbsensi?.validation_status === "Perlu Revisi" || todayAbsensi?.validation_status === "Ditolak") && (() => {
            const target = todayAbsensi.validation_target || (todayAbsensi.check_out_time ? "SEMUA" : "DATANG");
            const isNeedDatang = target === "DATANG" || target === "SEMUA";
            const isNeedPulang = (target === "PULANG" || target === "SEMUA") && !!todayAbsensi.check_out_time;

            const bannerTitle =
              target === "DATANG"
                ? "Presensi Masuk Memerlukan Revisi Foto"
                : target === "PULANG"
                ? "Presensi Pulang Memerlukan Revisi Foto"
                : "Presensi Masuk & Pulang Memerlukan Revisi Foto";

            return (
              <div className="rounded-2xl border border-amber-300 bg-amber-500/10 p-5 shadow-2xs animate-in fade-in-50 duration-200">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h4 className="text-sm font-bold text-foreground">
                        {bannerTitle}
                      </h4>
                      <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full self-start border border-amber-300">
                        Status: Perlu Revisi ({target === "DATANG" ? "Masuk" : target === "PULANG" ? "Pulang" : "Semua"})
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {todayAbsensi.validation_notes ? (
                        <span>
                          <strong className="text-foreground">Catatan Guru Pembimbing:</strong> &ldquo;{todayAbsensi.validation_notes}&rdquo;
                        </span>
                      ) : (
                        <span>Foto bukti presensi Anda kurang jelas / buram. Silakan ambil ulang foto selfie Anda melalui tombol di bawah.</span>
                      )}
                    </p>
                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      {isNeedDatang && (
                        <Button
                          size="sm"
                          onClick={() =>
                            setCameraModal({
                              isOpen: true,
                              type: "REVISI_DATANG",
                              targetAbsensiId: todayAbsensi.id,
                            })
                          }
                          className="rounded-xl px-3.5 h-8 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white gap-1.5 shadow-xs"
                        >
                          <Camera className="h-3.5 w-3.5" />
                          <span>Ambil Ulang Foto Masuk</span>
                        </Button>
                      )}
                      {isNeedPulang && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setCameraModal({
                              isOpen: true,
                              type: "REVISI_PULANG",
                              targetAbsensiId: todayAbsensi.id,
                            })
                          }
                          className="rounded-xl px-3.5 h-8 text-xs font-bold border-amber-300 text-amber-800 hover:bg-amber-100 dark:text-amber-200 gap-1.5"
                        >
                          <Camera className="h-3.5 w-3.5" />
                          <span>Ambil Ulang Foto Pulang</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Today's Dual Attendance Action Card (Datang & Pulang) */}
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Camera className="h-5 w-5 text-primary" />
                  <span>Presensi Hari Ini</span>
                </h2>
                <p className="text-xs text-muted-foreground">
                  Lokasi: <span className="font-semibold text-foreground">{placement?.dudi?.name}</span> • Waktu Masuk: 07:30 WIB
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-[11px] font-bold">Verifikasi Live Kamera Aktif</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Presensi Datang (Pagi) */}
              <div className="p-5 rounded-2xl border border-border bg-muted/20 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Presensi Datang</h3>
                      <p className="text-[11px] text-muted-foreground">Jam Kerja Pagi</p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      todayAbsensi?.check_in_time
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {todayAbsensi?.check_in_time ? "SUDAH TERCATAT" : "BELUM ABSEN"}
                  </span>
                </div>

                {todayAbsensi?.check_in_time ? (
                  <div className="p-3 rounded-xl bg-background border border-border flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {todayAbsensi.check_in_photo ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={todayAbsensi.check_in_photo}
                          alt="Foto Datang"
                          title="Klik untuk memperbesar"
                          onClick={() => setPreviewPhoto(todayAbsensi.check_in_photo || null)}
                          className="h-10 w-10 rounded-lg object-cover border border-border shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                          <ImageIcon className="h-5 w-5" />
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold text-foreground">
                          Jam Masuk: {todayAbsensi.check_in_time}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Status Validasi:{" "}
                          {(() => {
                            const isDatangNeedRevision =
                              (todayAbsensi.validation_status === "Perlu Revisi" ||
                                todayAbsensi.validation_status === "Ditolak") &&
                              (!todayAbsensi.validation_target ||
                                todayAbsensi.validation_target === "DATANG" ||
                                todayAbsensi.validation_target === "SEMUA");

                            if (isDatangNeedRevision) {
                              return (
                                <span className="font-semibold text-amber-600 dark:text-amber-400">
                                  Perlu Revisi
                                </span>
                              );
                            }
                            if (todayAbsensi.validation_status === "Disetujui") {
                              return <span className="font-semibold text-emerald-600">Disetujui</span>;
                            }
                            return <span className="font-semibold text-blue-600">Menunggu</span>;
                          })()}
                        </p>
                      </div>
                    </div>

                    {(() => {
                      const isDatangNeedRevision =
                        (todayAbsensi.validation_status === "Perlu Revisi" ||
                          todayAbsensi.validation_status === "Ditolak") &&
                        (!todayAbsensi.validation_target ||
                          todayAbsensi.validation_target === "DATANG" ||
                          todayAbsensi.validation_target === "SEMUA");

                      return isDatangNeedRevision ? (
                        <Button
                          size="sm"
                          onClick={() =>
                            setCameraModal({
                              isOpen: true,
                              type: "REVISI_DATANG",
                              targetAbsensiId: todayAbsensi.id,
                            })
                          }
                          className="rounded-xl px-3 h-8 text-[11px] font-bold bg-amber-600 hover:bg-amber-700 text-white shrink-0 gap-1"
                        >
                          <Camera className="h-3 w-3" />
                          <span>Revisi Foto</span>
                        </Button>
                      ) : null;
                    })()}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Lakukan foto selfie langsung melalui webcam saat Anda telah tiba di lokasi magang.
                    </p>
                    <Button
                      onClick={() => setCameraModal({ isOpen: true, type: "DATANG" })}
                      className="w-full rounded-xl text-xs font-bold gap-2 h-11 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20"
                    >
                      <Camera className="h-4 w-4" />
                      <span>Buka Kamera & Presensi Datang</span>
                    </Button>
                  </div>
                )}
              </div>

              {/* Presensi Pulang (Sore) */}
              <div className="p-5 rounded-2xl border border-border bg-muted/20 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Presensi Pulang</h3>
                      <p className="text-[11px] text-muted-foreground">Jam Kerja Sore / Selesai</p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      todayAbsensi?.check_out_time
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {todayAbsensi?.check_out_time ? "SUDAH TERCATAT" : "BELUM ABSEN"}
                  </span>
                </div>

                {todayAbsensi?.check_out_time ? (
                  <div className="p-3 rounded-xl bg-background border border-border flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {todayAbsensi.check_out_photo ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={todayAbsensi.check_out_photo}
                          alt="Foto Pulang"
                          title="Klik untuk memperbesar"
                          onClick={() => setPreviewPhoto(todayAbsensi.check_out_photo || null)}
                          className="h-10 w-10 rounded-lg object-cover border border-border shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                          <ImageIcon className="h-5 w-5" />
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold text-foreground">
                          Jam Pulang: {todayAbsensi.check_out_time}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Status Validasi:{" "}
                          {(() => {
                            const isPulangNeedRevision =
                              (todayAbsensi.validation_status === "Perlu Revisi" ||
                                todayAbsensi.validation_status === "Ditolak") &&
                              (todayAbsensi.validation_target === "PULANG" ||
                                todayAbsensi.validation_target === "SEMUA");

                            if (isPulangNeedRevision) {
                              return (
                                <span className="font-semibold text-amber-600 dark:text-amber-400">
                                  Perlu Revisi
                                </span>
                              );
                            }
                            // If only Datang needed revision, Pulang is still valid / disetujui
                            if (
                              todayAbsensi.validation_status === "Disetujui" ||
                              todayAbsensi.validation_target === "DATANG"
                            ) {
                              return <span className="font-semibold text-emerald-600">Disetujui</span>;
                            }
                            return <span className="font-semibold text-blue-600">Menunggu</span>;
                          })()}
                        </p>
                      </div>
                    </div>

                    {(() => {
                      const isPulangNeedRevision =
                        (todayAbsensi.validation_status === "Perlu Revisi" ||
                          todayAbsensi.validation_status === "Ditolak") &&
                        (todayAbsensi.validation_target === "PULANG" ||
                          todayAbsensi.validation_target === "SEMUA");

                      return isPulangNeedRevision ? (
                        <Button
                          size="sm"
                          onClick={() =>
                            setCameraModal({
                              isOpen: true,
                              type: "REVISI_PULANG",
                              targetAbsensiId: todayAbsensi.id,
                            })
                          }
                          className="rounded-xl px-3 h-8 text-[11px] font-bold bg-amber-600 hover:bg-amber-700 text-white shrink-0 gap-1"
                        >
                          <Camera className="h-3 w-3" />
                          <span>Revisi Foto</span>
                        </Button>
                      ) : null;
                    })()}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Lakukan foto selfie langsung melalui webcam saat jam kerja magang Anda telah selesai.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setCameraModal({ isOpen: true, type: "PULANG" })}
                      disabled={!todayAbsensi?.check_in_time}
                      className="w-full rounded-xl text-xs font-bold gap-2 h-11 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                    >
                      <Camera className="h-4 w-4" />
                      <span>
                        {!todayAbsensi?.check_in_time
                          ? "Selesaikan Presensi Datang Terlebih Dahulu"
                          : "Buka Kamera & Presensi Pulang"}
                      </span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Riwayat Presensi Table */}
          <div className="rounded-3xl border border-border bg-card shadow-2xs overflow-hidden space-y-3">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">Riwayat Presensi Magang</h3>
                <p className="text-xs text-muted-foreground">Catatan kehadiran datang & pulang beserta foto bukti</p>
              </div>
              <span className="text-xs font-extrabold text-foreground">
                Total Rekaman: {history.length} Hari
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-3.5">Tanggal</th>
                    <th className="px-3 py-3.5 text-center">Status</th>
                    <th className="px-5 py-3.5">Presensi Datang</th>
                    <th className="px-5 py-3.5">Presensi Pulang</th>
                    <th className="px-4 py-3.5 text-center">Validasi</th>
                    <th className="px-4 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                        Belum ada riwayat presensi tercatat.
                      </td>
                    </tr>
                  ) : (
                    history.map((a) => {
                      const valStatus =
                        a.validation_status ||
                        (a.status === "Sakit" || a.status === "Izin"
                          ? "Menunggu"
                          : a.status === "Alfa"
                          ? "Perlu Revisi"
                          : "Disetujui");
                      const isValApproved = valStatus === "Disetujui";
                      const isValRevision = valStatus === "Perlu Revisi" || valStatus === "Ditolak";

                      return (
                        <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-5 py-3.5 font-bold text-foreground">
                            {a.date}
                          </td>

                          <td className="px-3 py-3.5 text-center">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                a.status === "Hadir"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : a.status === "Sakit"
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : a.status === "Izin"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-red-50 text-red-700 border border-red-200"
                              }`}
                            >
                              {a.status}
                            </span>
                          </td>

                          <td className="px-5 py-3.5">
                            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-muted/40 border border-border/80">
                              {a.check_in_photo ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={a.check_in_photo}
                                  alt="Foto Masuk"
                                  title="Klik untuk memperbesar"
                                  onClick={() => setPreviewPhoto(a.check_in_photo || null)}
                                  className="h-6 w-6 rounded-md object-cover border border-border cursor-pointer hover:scale-110 transition-transform shadow-2xs shrink-0"
                                />
                              ) : (
                                <div className="h-6 w-6 rounded-md bg-muted flex items-center justify-center text-muted-foreground/60 shrink-0">
                                  <ImageIcon className="h-3 w-3" />
                                </div>
                              )}
                              <span className="font-semibold text-foreground text-[11px]">
                                {a.check_in_time || "-"}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-3.5">
                            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-muted/40 border border-border/80">
                              {a.check_out_photo ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={a.check_out_photo}
                                  alt="Foto Pulang"
                                  title="Klik untuk memperbesar"
                                  onClick={() => setPreviewPhoto(a.check_out_photo || null)}
                                  className="h-6 w-6 rounded-md object-cover border border-border cursor-pointer hover:scale-110 transition-transform shadow-2xs shrink-0"
                                />
                              ) : (
                                <div className="h-6 w-6 rounded-md bg-muted flex items-center justify-center text-muted-foreground/60 shrink-0">
                                  <ImageIcon className="h-3 w-3" />
                                </div>
                              )}
                              <span className="font-semibold text-foreground text-[11px]">
                                {a.check_out_time || "-"}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-3.5 text-center">
                            <div className="flex flex-col items-center gap-0.5">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                  isValApproved
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : isValRevision
                                    ? "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40"
                                    : "bg-blue-50 text-blue-700 border-blue-200"
                                }`}
                              >
                                {isValRevision ? "Perlu Revisi" : valStatus}
                              </span>
                              {a.validation_notes && isValRevision && (
                                <span
                                  className="text-[10px] text-amber-600 dark:text-amber-400 font-medium max-w-[140px] truncate"
                                  title={a.validation_notes}
                                >
                                  {a.validation_notes}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-3.5 text-right">
                            {isValRevision ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setCameraModal({
                                    isOpen: true,
                                    type: "REVISI_DATANG",
                                    targetAbsensiId: a.id,
                                  })
                                }
                                className="h-7 px-2.5 rounded-lg text-[11px] font-bold border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700"
                              >
                                Revisi Foto
                              </Button>
                            ) : (
                              <span className="text-muted-foreground text-[11px]">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
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
            : "Ambil foto selfie langsung di depan kamera sebagai bukti absensi autentik"
        }
        onClose={() => setCameraModal({ isOpen: false, type: "DATANG" })}
        onCaptureConfirm={handleCameraCapture}
      />

      {/* Photo Preview Modal */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
          onClick={() => setPreviewPhoto(null)}
        >
          <div className="relative max-w-lg w-full bg-card rounded-3xl overflow-hidden p-4 space-y-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewPhoto}
              alt="Foto Presensi Full"
              className="w-full aspect-4/3 object-cover rounded-2xl border border-border"
            />
            <div className="text-center">
              <Button size="sm" onClick={() => setPreviewPhoto(null)} className="rounded-xl px-6">
                Tutup Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
