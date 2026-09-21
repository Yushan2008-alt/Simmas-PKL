"use client";

import * as React from "react";
import { X, CheckCircle2, XCircle, Clock, Calendar, User, FileText, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Absensi, AbsensiValidationStatus } from "@/types/database";
import { validateAbsensi } from "@/lib/supabase/services";

interface ValidasiAbsensiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  absensi: Absensi | null;
}

export function ValidasiAbsensiModal({
  isOpen,
  onClose,
  onSuccess,
  absensi,
}: ValidasiAbsensiModalProps) {
  const [status, setStatus] = React.useState<"Disetujui" | "Perlu Revisi">("Disetujui");
  const [notes, setNotes] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && absensi) {
      if (absensi.validation_status === "Perlu Revisi" || absensi.validation_status === "Ditolak") {
        setStatus("Perlu Revisi");
      } else {
        setStatus("Disetujui");
      }
      setNotes(absensi.validation_notes || "");
      setError(null);
    }
  }, [isOpen, absensi]);

  if (!isOpen || !absensi) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (status === "Perlu Revisi" && !notes.trim()) {
      setError("Catatan revisi wajib diisi agar siswa mengetahui hal yang harus diperbaiki (misal: foto kurang jelas).");
      return;
    }

    setIsSubmitting(true);
    try {
      await validateAbsensi(absensi.id, status, notes.trim() || undefined);
      toast.success(
        status === "Disetujui"
          ? "Presensi Berhasil Disetujui!"
          : "Permintaan Revisi Terkirim!",
        {
          description:
            status === "Disetujui"
              ? `Presensi ${absensi.student?.name || "siswa"} ditandai sebagai 'Disetujui'.`
              : `Status presensi diubah menjadi 'Perlu Revisi'. Siswa dapat mengambil ulang foto presensi.`,
        }
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error("Gagal memvalidasi presensi", {
        description: err?.message || "Terjadi kesalahan sistem.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Validasi Presensi Siswa
              </h3>
              <p className="text-xs text-muted-foreground">
                Tinjau dan tetapkan status verifikasi kehadiran
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Siswa & Attendance Info */}
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-blue-600" />
                {absensi.student?.name || "Siswa"}
              </span>
              <span className="text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {absensi.date}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50">
              <span className="text-muted-foreground">Jenis Presensi:</span>
              <span className="font-bold px-2 py-0.5 rounded-full text-[11px] bg-blue-50 text-blue-700 border border-blue-200">
                {absensi.status}
              </span>
            </div>

            {absensi.notes && (
              <div className="text-[11px] text-muted-foreground italic bg-background/60 p-2 rounded-lg border border-border/40">
                &ldquo;{absensi.notes}&rdquo;
              </div>
            )}
          </div>

          {/* Status Choice */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              Tindakan Validasi <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setStatus("Disetujui");
                  setError(null);
                }}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                  status === "Disetujui"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-400 shadow-xs dark:bg-emerald-950/40"
                    : "bg-card text-muted-foreground border-border hover:bg-muted"
                }`}
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Disetujui</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatus("Perlu Revisi");
                  setError(null);
                }}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                  status === "Perlu Revisi"
                    ? "bg-amber-50 text-amber-700 border-amber-400 shadow-xs dark:bg-amber-950/40"
                    : "bg-card text-muted-foreground border-border hover:bg-muted"
                }`}
              >
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <span>Perlu Revisi</span>
              </button>
            </div>
          </div>

          {/* Catatan / Keterangan Evaluasi */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Catatan / Alasan {status === "Perlu Revisi" ? "(Wajib)" : "(Opsional)"}</span>
              </span>
              {status === "Perlu Revisi" && (
                <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">
                  Wajib Beri Catatan
                </span>
              )}
            </label>
            <Textarea
              placeholder={
                status === "Disetujui"
                  ? "Contoh: Surat izin / presensi valid dan terverifikasi."
                  : "Contoh: Foto bukti selfie kurang jelas / buram. Mohon ambil ulang foto selfie yang terang."
              }
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                if (error) setError(null);
              }}
              rows={3}
              className={`rounded-xl resize-none text-xs ${error ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            />
            {error && (
              <p className="text-[11px] text-red-500 flex items-center gap-1 mt-1 font-medium">
                <AlertCircle className="h-3 w-3 shrink-0" />
                <span>{error}</span>
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl px-4 text-xs font-semibold h-9"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className={`rounded-xl px-5 text-xs font-bold h-9 shadow-xs text-white ${
                status === "Disetujui"
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                  : "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20"
              }`}
            >
              {isSubmitting
                ? "Menyimpan..."
                : status === "Disetujui"
                ? "Simpan Validasi"
                : "Minta Revisi Presensi"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
