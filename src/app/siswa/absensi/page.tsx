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
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  getActiveSiswa,
  getTodayAbsensi,
  getAbsensiList,
  checkInSiswa,
  checkOutSiswa,
  getStudentPlacement,
} from "@/lib/supabase/services";
import { Siswa, Absensi, Penempatan } from "@/types/database";
import { CameraCaptureModal } from "@/components/siswa/camera-capture-modal";

export default function SiswaAbsensiPage() {
  const [siswa, setSiswa] = React.useState<Siswa>(getActiveSiswa());
  const [placement, setPlacement] = React.useState<Penempatan | null>(null);
  const [todayAbsensi, setTodayAbsensi] = React.useState<Absensi | null>(null);
  const [history, setHistory] = React.useState<Absensi[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Camera modal state
  const [cameraModal, setCameraModal] = React.useState<{
    isOpen: boolean;
    type: "DATANG" | "PULANG";
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
      window.addEventListener("simmas_absensi_updated", handleUpdate);
      window.addEventListener("simmas_siswa_updated", handleUpdate);
      return () => {
        window.removeEventListener("simmas_absensi_updated", handleUpdate);
        window.removeEventListener("simmas_siswa_updated", handleUpdate);
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
      } else {
        await checkOutSiswa(siswa.id, photoBase64);
        toast.success("Presensi Pulang Berhasil Disimpan!", {
          description: "Foto bukti kepulangan webcam dan jam pulang telah tersimpan.",
        });
      }
      loadData();
    } catch (e: any) {
      toast.error("Gagal mencatat presensi", {
        description: e?.message || "Terjadi kesalahan.",
      });
    }
  };

  const isBelumMagang = siswa.status === "Belum Magang";
  const todayFormatted = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-8 w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/10 text-purple-600">
              Presensi 2x Harian
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Presensi Harian Siswa
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Presensi Datang & Pulang wajib terverifikasi dengan foto langsung webcam tanpa file upload.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-card">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold text-foreground">{todayFormatted}</span>
        </div>
      </div>

      {/* LOCKED STATE BANNER */}
      {isBelumMagang ? (
        <div className="rounded-3xl border border-dashed border-border bg-muted/20 p-8 sm:p-12 text-center space-y-4">
          <div className="p-4 rounded-3xl bg-muted text-muted-foreground inline-block">
            <Lock className="h-10 w-10 mx-auto" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h2 className="text-lg font-bold text-foreground">
              Presensi Terkunci
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Absensi harian terkunci hingga tempat magang dan guru pembimbing Anda ditetapkan oleh pihak sekolah.
            </p>
          </div>
          <div className="pt-2">
            <Link href="/siswa/pengajuan">
              <Button className="rounded-xl text-xs font-bold gap-2">
                <span>Cek Status Pengajuan Magang</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        /* UNLOCKED ACTIVE STATE */
        <div className="space-y-8">
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
                  <div className="p-3.5 rounded-xl bg-background border border-border flex items-center gap-3">
                    {todayAbsensi.check_in_photo ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={todayAbsensi.check_in_photo}
                        alt="Foto Datang"
                        onClick={() => setPreviewPhoto(todayAbsensi.check_in_photo || null)}
                        className="h-14 w-14 rounded-xl object-cover border border-border shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        Jam Masuk: {todayAbsensi.check_in_time}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Status: <span className="font-semibold text-emerald-600">Hadir Tepat Waktu</span>
                      </p>
                      <p className="text-[10px] text-primary font-medium mt-0.5">
                        Klik thumbnail foto untuk memperbesar
                      </p>
                    </div>
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
                  <div className="p-3.5 rounded-xl bg-background border border-border flex items-center gap-3">
                    {todayAbsensi.check_out_photo ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={todayAbsensi.check_out_photo}
                        alt="Foto Pulang"
                        onClick={() => setPreviewPhoto(todayAbsensi.check_out_photo || null)}
                        className="h-14 w-14 rounded-xl object-cover border border-border shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        Jam Pulang: {todayAbsensi.check_out_time}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Status: <span className="font-semibold text-blue-600">Selesai Hari Kerja</span>
                      </p>
                      <p className="text-[10px] text-primary font-medium mt-0.5">
                        Klik thumbnail foto untuk memperbesar
                      </p>
                    </div>
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
                    <th className="px-6 py-3.5">Tanggal</th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                    <th className="px-6 py-3.5">Presensi Datang</th>
                    <th className="px-6 py-3.5">Presensi Pulang</th>
                    <th className="px-6 py-3.5">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                        Belum ada riwayat presensi tercatat.
                      </td>
                    </tr>
                  ) : (
                    history.map((a) => (
                      <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-bold text-foreground">
                          {a.date}
                        </td>

                        <td className="px-4 py-4 text-center">
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

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            {a.check_in_photo && (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={a.check_in_photo}
                                alt="Foto Masuk"
                                onClick={() => setPreviewPhoto(a.check_in_photo || null)}
                                className="h-9 w-9 rounded-lg object-cover border border-border cursor-pointer hover:opacity-80"
                              />
                            )}
                            <span className="font-semibold text-foreground">
                              {a.check_in_time || "-"}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            {a.check_out_photo && (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={a.check_out_photo}
                                alt="Foto Pulang"
                                onClick={() => setPreviewPhoto(a.check_out_photo || null)}
                                className="h-9 w-9 rounded-lg object-cover border border-border cursor-pointer hover:opacity-80"
                              />
                            )}
                            <span className="font-semibold text-foreground">
                              {a.check_out_time || "-"}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-muted-foreground">
                          {a.notes || "-"}
                        </td>
                      </tr>
                    ))
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
        title={cameraModal.type === "DATANG" ? "Presensi Datang (Webcam)" : "Presensi Pulang (Webcam)"}
        subtitle="Ambil foto selfie langsung di depan kamera sebagai bukti absensi autentik"
        onClose={() => setCameraModal({ isOpen: false, type: "DATANG" })}
        onCaptureConfirm={handleCameraCapture}
      />

      {/* Photo Preview Modal */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
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
