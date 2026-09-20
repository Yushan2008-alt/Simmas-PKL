"use client";

import * as React from "react";
import {
  FilePlus,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Briefcase,
  Users,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  getActiveSiswa,
  getActivePengajuan,
  getDudiList,
  createPengajuan,
  cancelPengajuan,
} from "@/lib/supabase/services";
import { Siswa, Dudi, PengajuanMagang } from "@/types/database";

export default function SiswaPengajuanPage() {
  const [siswa, setSiswa] = React.useState<Siswa>(getActiveSiswa());
  const [activePengajuan, setActivePengajuan] = React.useState<PengajuanMagang | null>(null);
  const [dudiList, setDudiList] = React.useState<Dudi[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Form states
  const [dudiId, setDudiId] = React.useState("");
  const [position, setPosition] = React.useState("");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<{
    dudiId?: string;
    position?: string;
    startDate?: string;
    endDate?: string;
  }>({});

  const loadData = React.useCallback(async () => {
    try {
      const current = getActiveSiswa();
      setSiswa(current);

      const [peng, dList] = await Promise.all([
        getActivePengajuan(current.id),
        getDudiList(),
      ]);

      setActivePengajuan(peng);
      setDudiList(dList);

      if (dList.length > 0 && !dudiId) {
        setDudiId(dList[0].id);
      }
    } catch (e) {
      console.error("Failed to load pengajuan data:", e);
    } finally {
      setLoading(false);
    }
  }, [dudiId]);

  React.useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    if (typeof window !== "undefined") {
      window.addEventListener("simmas_pengajuan_updated", handleUpdate);
      window.addEventListener("simmas_siswa_updated", handleUpdate);
      return () => {
        window.removeEventListener("simmas_pengajuan_updated", handleUpdate);
        window.removeEventListener("simmas_siswa_updated", handleUpdate);
      };
    }
  }, [loadData]);

  const handleCancel = async () => {
    if (!activePengajuan) return;
    if (!confirm("Apakah Anda yakin ingin membatalkan pengajuan magang ini?")) return;

    try {
      await cancelPengajuan(activePengajuan.id);
      toast.success("Pengajuan berhasil dibatalkan", {
        description: "Anda sekarang dapat memilih DUDI dan mengajukan kembali.",
      });
      loadData();
    } catch (e: any) {
      toast.error("Gagal membatalkan pengajuan", {
        description: e?.message || "Terjadi kesalahan.",
      });
    }
  };

  const validate = () => {
    const errs: {
      dudiId?: string;
      position?: string;
      startDate?: string;
      endDate?: string;
    } = {};

    if (!dudiId) {
      errs.dudiId = "Pilih DUDI yang ingin Anda ajukan.";
    } else {
      const selectedDudi = dudiList.find((d) => d.id === dudiId);
      if (selectedDudi && selectedDudi.quota <= 0) {
        errs.dudiId = "Kuota pada industri ini sudah penuh. Silakan pilih DUDI lain.";
      }
    }

    if (!position.trim()) {
      errs.position = "Posisi atau bidang yang diajukan wajib diisi.";
    }

    if (!startDate) {
      errs.startDate = "Tanggal mulai wajib ditentukan.";
    }

    if (!endDate) {
      errs.endDate = "Tanggal selesai wajib ditentukan.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Formulir belum lengkap", {
        description: "Silakan periksa field yang ditandai merah.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createPengajuan({
        student_id: siswa.id,
        dudi_id: dudiId,
        position: position.trim(),
        start_date: startDate,
        end_date: endDate,
        notes: notes.trim(),
      });

      toast.success("Pengajuan Magang Berhasil Dikirim!", {
        description: "Pengajuan Anda telah masuk ke antrean verifikasi pihak sekolah.",
      });

      setPosition("");
      setNotes("");
      loadData();
    } catch (err: any) {
      toast.error("Gagal mengirim pengajuan", {
        description: err?.message || "Terjadi kesalahan sistem.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasPending = activePengajuan?.status === "Menunggu Verifikasi";
  const hasApproved = activePengajuan?.status === "Disetujui" || siswa.status === "Sedang Magang";

  return (
    <div className="space-y-8 w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/10 text-purple-600">
              Pendaftaran Tempat Magang
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Pengajuan Tempat Magang
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Pilih mitra industri DUDI yang bekerja sama dengan sekolah dan ajukan divisi/posisi magang.
          </p>
        </div>
      </div>

      {/* ACTIVE APPLICATION CARD */}
      {hasPending && (
        <div className="rounded-3xl border border-amber-300 bg-amber-500/5 p-6 sm:p-8 space-y-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
                  MENUNGGU VERIFIKASI
                </span>
                <h3 className="text-lg font-bold text-foreground mt-1">
                  Pengajuan Aktif Anda Sedang Ditinjau
                </h3>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="rounded-xl text-xs font-bold text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
            >
              <XCircle className="h-3.5 w-3.5 mr-1" />
              <span>Batalkan Pengajuan</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-background border border-border text-xs">
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Mitra DUDI</p>
              <p className="font-bold text-foreground mt-0.5 flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-primary" />
                {activePengajuan?.dudi?.name}
              </p>
              <p className="text-[11px] text-muted-foreground">{activePengajuan?.dudi?.sector}</p>
            </div>

            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Posisi</p>
              <p className="font-bold text-foreground mt-0.5 flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5 text-primary" />
                {activePengajuan?.position}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Rencana Periode</p>
              <p className="font-medium text-foreground mt-0.5 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                {activePengajuan?.start_date} s/d {activePengajuan?.end_date}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Waktu Pengajuan</p>
              <p className="font-medium text-foreground mt-0.5">
                {activePengajuan?.created_at
                  ? new Date(activePengajuan.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "-"}
              </p>
            </div>
          </div>

          {activePengajuan?.notes && (
            <p className="text-xs text-muted-foreground bg-amber-50/50 p-3 rounded-xl border border-amber-200/50 italic">
              &ldquo;{activePengajuan.notes}&rdquo;
            </p>
          )}

          {/* Guardrail Warning Banner */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-300 text-amber-900 dark:text-amber-200 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
            <p className="font-medium">
              Pengajuan Anda sedang ditinjau oleh pihak sekolah. Anda tidak dapat melakukan pengajuan baru saat ini hingga proses verifikasi selesai atau pengajuan dibatalkan.
            </p>
          </div>
        </div>
      )}

      {/* APPROVED PLACEMENT BANNER */}
      {hasApproved && (
        <div className="rounded-3xl border border-emerald-300 bg-emerald-500/5 p-6 sm:p-8 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                PENGAJUAN TELAH DISETUJUI
              </span>
              <h3 className="text-lg font-bold text-foreground mt-1">
                Selamat! Anda Telah Resmi Ditempatkan di Mitra Industri
              </h3>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Tempat magang dan guru pembimbing Anda telah aktif. Silakan lakukan presensi harian datang/pulang dan pengisian jurnal kegiatan secara tertib.
          </p>
        </div>
      )}

      {/* NEW APPLICATION FORM (Only active if no pending/approved application) */}
      {!hasPending && !hasApproved && (
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <FilePlus className="h-5 w-5 text-primary" />
              <span>Formulir Pengajuan Baru</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Lengkapi form di bawah ini untuk mengajukan permohonan magang ke mitra industri pilihan Anda.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* DUDI Selection with Quota */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-primary" />
                <span>Pilih Mitra Industri (DUDI)</span>
                <span className="text-red-500">*</span>
              </label>
              <select
                value={dudiId}
                onChange={(e) => {
                  setDudiId(e.target.value);
                  if (errors.dudiId) setErrors((prev) => ({ ...prev, dudiId: undefined }));
                }}
                className={`w-full h-11 px-3.5 rounded-xl border bg-background text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  errors.dudiId ? "border-red-500" : "border-border"
                }`}
              >
                <option value="">-- Pilih DUDI --</option>
                {dudiList.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.sector}) — Sisa Kuota: {d.quota} Siswa
                  </option>
                ))}
              </select>
              {errors.dudiId && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.dudiId}
                </p>
              )}
            </div>

            {/* Position */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-primary" />
                <span>Posisi / Bidang Pekerjaan yang Diminati</span>
                <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Contoh: Frontend Web Developer, Network Engineer, Staff Teknisi Otomotif..."
                value={position}
                onChange={(e) => {
                  setPosition(e.target.value);
                  if (errors.position) setErrors((prev) => ({ ...prev, position: undefined }));
                }}
                className={`h-11 rounded-xl ${errors.position ? "border-red-500" : ""}`}
              />
              {errors.position && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.position}
                </p>
              )}
            </div>

            {/* Dates Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  <span>Rencana Tanggal Mulai</span>
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (errors.startDate) setErrors((prev) => ({ ...prev, startDate: undefined }));
                  }}
                  className={`h-11 rounded-xl ${errors.startDate ? "border-red-500" : ""}`}
                />
                {errors.startDate && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.startDate}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  <span>Rencana Tanggal Selesai</span>
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    if (errors.endDate) setErrors((prev) => ({ ...prev, endDate: undefined }));
                  }}
                  className={`h-11 rounded-xl ${errors.endDate ? "border-red-500" : ""}`}
                />
                {errors.endDate && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.endDate}
                  </p>
                )}
              </div>
            </div>

            {/* Notes / Motivation */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <span>Catatan / Motivasi Pengajuan (Opsional)</span>
              </label>
              <Textarea
                placeholder="Tuliskan minat Anda atau kemampuan kejuruan yang relevan dengan DUDI ini..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="rounded-xl resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 h-11 rounded-xl font-bold text-xs gap-2 shadow-md shadow-primary/20"
              >
                <Send className="h-4 w-4" />
                <span>{isSubmitting ? "Mengirim Pengajuan..." : "Kirim Pengajuan Magang"}</span>
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
