"use client";

import * as React from "react";
import { X, Edit3, MessageSquare, AlertCircle, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Jurnal } from "@/types/database";
import { updateJurnalSiswa } from "@/lib/supabase/services";

interface EditJurnalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  jurnal: Jurnal | null;
}

export function EditJurnalModal({
  isOpen,
  onClose,
  onSuccess,
  jurnal,
}: EditJurnalModalProps) {
  const [activity, setActivity] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen && jurnal) {
      setActivity(jurnal.activity || "");
      setError(null);
    }
  }, [isOpen, jurnal]);

  if (!isOpen || !jurnal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!activity.trim()) {
      setError("Uraian kegiatan tidak boleh kosong.");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateJurnalSiswa(jurnal.id, activity.trim());
      toast.success("Jurnal berhasil diperbaiki!", {
        description: "Status jurnal kembali menjadi 'Pending' untuk ditinjau ulang oleh guru pembimbing.",
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error("Gagal memperbarui jurnal", {
        description: err?.message || "Terjadi kesalahan sistem.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-amber-500/5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Perbaiki Jurnal Kegiatan
              </h3>
              <p className="text-xs text-muted-foreground">
                Tanggal Kegiatan: {jurnal.date}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Catatan dari Guru */}
          {jurnal.teacher_feedback && (
            <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-900 space-y-1">
              <p className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Catatan Revisi dari Guru Pembimbing:</span>
              </p>
              <p className="text-xs text-amber-900/90 dark:text-amber-200/90 leading-relaxed italic pl-5">
                &ldquo;{jurnal.teacher_feedback}&rdquo;
              </p>
            </div>
          )}

          {/* Activity Textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-primary" />
              <span>Deskripsi Kegiatan / Hasil Pekerjaan Baru</span>
              <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={activity}
              onChange={(e) => {
                setActivity(e.target.value);
                if (error) setError(null);
              }}
              rows={5}
              placeholder="Tuliskan perbaikan laporan kegiatan magang Anda..."
              className={`rounded-xl resize-none ${error ? "border-red-500" : ""}`}
            />
            {error ? (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {error}
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Deskripsi kegiatan fleksibel, silakan lengkapi sesuai arahan guru.
              </p>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl px-5 text-xs font-semibold"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl px-6 font-bold text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20"
            >
              {isSubmitting ? "Menyimpan..." : "Kirim Perbaikan Jurnal"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
