"use client";

import * as React from "react";
import { X, MessageSquare, AlertCircle, FileText, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Jurnal } from "@/types/database";
import { validateJurnal } from "@/lib/supabase/services";

interface RevisiJurnalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  jurnal: Jurnal | null;
}

export function RevisiJurnalModal({
  isOpen,
  onClose,
  onSuccess,
  jurnal,
}: RevisiJurnalModalProps) {
  const [feedback, setFeedback] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && jurnal) {
      setFeedback(jurnal.teacher_feedback || "");
      setError(null);
    }
  }, [isOpen, jurnal]);

  if (!isOpen || !jurnal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!feedback.trim()) {
      setError("Catatan revisi wajib diisi untuk memberi arahan kepada siswa.");
      return;
    }

    setIsSubmitting(true);
    try {
      await validateJurnal(jurnal.id, "Perlu Revisi", feedback.trim());
      toast.success("Catatan revisi berhasil dikirim!", {
        description: `Status jurnal siswa diubah menjadi 'Perlu Revisi'.`,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error("Gagal mengirim catatan revisi", {
        description: err?.message || "Terjadi kesalahan sistem.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-amber-500/5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Beri Catatan Revisi Jurnal
              </h3>
              <p className="text-xs text-muted-foreground">
                Instruksi perbaikan untuk siswa bimbingan
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
          {/* Student & Activity Preview */}
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/80 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-primary" />
                {jurnal.student?.name || "Siswa"} ({jurnal.student?.class_name || "-"})
              </span>
              <span>{jurnal.date}</span>
            </div>
            <div className="text-xs text-muted-foreground line-clamp-2 italic bg-background/60 p-2 rounded-lg border border-border/40">
              &ldquo;{jurnal.activity}&rdquo;
            </div>
          </div>

          {/* Feedback Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-amber-600" />
              <span>Catatan / Arahan Perbaikan</span>
              <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder="Contoh: Mohon lengkapi dokumentasi foto aktivitas, rincian masalah yang dihadapi, atau hasil pengujian..."
              value={feedback}
              onChange={(e) => {
                setFeedback(e.target.value);
                if (error) setError(null);
              }}
              rows={4}
              className={`rounded-xl resize-none ${error ? "border-red-500" : ""}`}
            />
            {error ? (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {error}
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Siswa akan melihat catatan ini dan dapat memperbarui jurnal mereka.
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
              className="rounded-xl px-5"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl px-6 font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20"
            >
              {isSubmitting ? "Mengirim..." : "Kirim Catatan Revisi"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
