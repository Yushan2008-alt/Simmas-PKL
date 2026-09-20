"use client";

import * as React from "react";
import { X, Calendar, Building2, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dudi, KunjunganStatus } from "@/types/database";
import { createKunjungan, getActiveGuru } from "@/lib/supabase/services";

interface TambahKunjunganModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  availableDudis: Dudi[];
}

export function TambahKunjunganModal({
  isOpen,
  onClose,
  onSuccess,
  availableDudis,
}: TambahKunjunganModalProps) {
  const [dudiId, setDudiId] = React.useState("");
  const [date, setDate] = React.useState("");
  const [status, setStatus] = React.useState<KunjunganStatus>("Terjadwal");
  const [notes, setNotes] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Validation errors state
  const [errors, setErrors] = React.useState<{
    dudiId?: string;
    date?: string;
    notes?: string;
  }>({});

  React.useEffect(() => {
    if (isOpen) {
      // Set default today's date formatted YYYY-MM-DD
      const today = new Date().toISOString().split("T")[0];
      setDate(today);
      if (availableDudis.length > 0) {
        setDudiId(availableDudis[0].id);
      } else {
        setDudiId("");
      }
      setStatus("Terjadwal");
      setNotes("");
      setErrors({});
    }
  }, [isOpen, availableDudis]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: { dudiId?: string; date?: string; notes?: string } = {};

    if (!dudiId) {
      errs.dudiId = "Pilih DUDI tujuan kunjungan.";
    }
    if (!date) {
      errs.date = "Tanggal kunjungan wajib diisi.";
    }
    if (!notes.trim()) {
      errs.notes = "Catatan atau agenda kunjungan wajib diisi.";
    } else if (notes.trim().length < 5) {
      errs.notes = "Catatan kunjungan minimal 5 karakter.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Formulir belum lengkap", {
        description: "Silakan periksa dan lengkapi kolom yang ditandai merah.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const guru = getActiveGuru();
      await createKunjungan({
        teacher_id: guru.id,
        dudi_id: dudiId,
        date,
        status,
        notes: notes.trim(),
      });

      toast.success("Jadwal kunjungan berhasil disimpan!", {
        description: `Kunjungan ke DUDI telah ditambahkan dengan status "${status}".`,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error("Gagal menyimpan kunjungan", {
        description: err?.message || "Terjadi kesalahan sistem.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/10 text-blue-600">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Tambah Kunjungan Lapangan
              </h3>
              <p className="text-xs text-muted-foreground">
                Jadwalkan atau catat agenda monitoring magang ke DUDI
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
          {/* DUDI Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-primary" />
              <span>DUDI Tujuan</span>
              <span className="text-red-500">*</span>
            </label>
            <select
              value={dudiId}
              onChange={(e) => {
                setDudiId(e.target.value);
                if (errors.dudiId) setErrors((prev) => ({ ...prev, dudiId: undefined }));
              }}
              disabled={availableDudis.length === 0}
              className={`w-full h-11 px-3.5 rounded-xl border bg-background text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                errors.dudiId ? "border-red-500 focus:border-red-500" : "border-border focus:border-primary"
              }`}
            >
              <option value="">{availableDudis.length === 0 ? "-- Belum ada DUDI siswa bimbingan --" : "-- Pilih DUDI --"}</option>
              {availableDudis.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.sector})
                </option>
              ))}
            </select>
            {availableDudis.length === 0 && (
              <p className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-500/10 p-2.5 rounded-lg border border-amber-300/40">
                Belum ada DUDI tempat siswa bimbingan Anda magang. Kunjungan monitoring hanya dapat dijadwalkan ke DUDI mitra yang ditempati oleh siswa bimbingan Anda.
              </p>
            )}
            {errors.dudiId && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {errors.dudiId}
              </p>
            )}
          </div>

          {/* Tanggal & Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                <span>Tanggal Kunjungan</span>
                <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
                }}
                className={`h-11 rounded-xl ${errors.date ? "border-red-500" : ""}`}
              />
              {errors.date && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.date}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                <span>Status Kunjungan</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as KunjunganStatus)}
                className="w-full h-11 px-3.5 rounded-xl border border-border bg-background text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="Terjadwal">Terjadwal</option>
                <option value="Selesai">Selesai (Sudah Dilakukan)</option>
              </select>
            </div>
          </div>

          {/* Notes / Hasil Evaluasi */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-primary" />
              <span>Catatan / Hasil Evaluasi</span>
              <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder="Tuliskan agenda monitoring, hasil koordinasi dengan PIC industri, atau evaluasi kendala siswa..."
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                if (errors.notes) setErrors((prev) => ({ ...prev, notes: undefined }));
              }}
              rows={4}
              className={`rounded-xl resize-none ${errors.notes ? "border-red-500" : ""}`}
            />
            {errors.notes ? (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {errors.notes}
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Catatan ini akan tersimpan dalam rekam jejak bimbingan magang sekolah.
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
              className="rounded-xl px-6 font-bold shadow-md shadow-primary/20"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Kunjungan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
