"use client";

import * as React from "react";
import { X, BookOpen, UploadCloud, Image as ImageIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createJurnalSiswa } from "@/lib/supabase/services";

interface TulisJurnalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  studentId: string;
}

export function TulisJurnalModal({
  isOpen,
  onClose,
  onSuccess,
  studentId,
}: TulisJurnalModalProps) {
  const [date, setDate] = React.useState("");
  const [activity, setActivity] = React.useState("");
  const [kendala, setKendala] = React.useState("");
  const [tindakLanjut, setTindakLanjut] = React.useState("");
  const [photoUrl, setPhotoUrl] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split("T")[0];
      setDate(today);
      setActivity("");
      setKendala("");
      setTindakLanjut("");
      setPhotoUrl(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar (JPG, PNG, dll)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoUrl(reader.result as string);
      toast.success("Foto dokumentasi berhasil dipilih");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!activity.trim()) {
      toast.error("Rincian kegiatan wajib diisi");
      return;
    }

    setIsSubmitting(true);
    try {
      await createJurnalSiswa(
        studentId,
        date || new Date().toISOString().split("T")[0],
        activity.trim(),
        kendala.trim(),
        tindakLanjut.trim(),
        photoUrl || undefined
      );

      toast.success("Jurnal Kegiatan Berhasil Dikirim!", {
        description: "Laporan jurnal Anda telah tersimpan dengan status 'Pending'.",
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error("Gagal mengirim jurnal", {
        description: err?.message || "Terjadi kesalahan sistem.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-200">
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-card rounded-2xl sm:rounded-3xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header (persis gambar 3) */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-300">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Tulis Jurnal Kegiatan
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Catat aktivitas yang Anda lakukan di tempat magang hari ini.
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

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* 1. Tanggal Pelaksanaan */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              Tanggal Pelaksanaan <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-11 rounded-xl bg-muted/20 border-border text-xs focus:bg-background transition-all"
            />
          </div>

          {/* 2. Rincian Kegiatan */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              Rincian Kegiatan <span className="text-red-500">*</span>
            </label>
            <Textarea
              required
              placeholder="Apa yang Anda pelajari atau kerjakan hari ini?"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              rows={3}
              className="rounded-xl resize-none bg-muted/20 border-border text-xs focus:bg-background transition-all"
            />
          </div>

          {/* 3. Kendala / Masalah (Opsional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              Kendala / Masalah <span className="text-muted-foreground font-normal">(Opsional)</span>
            </label>
            <Textarea
              placeholder="Apakah ada kesulitan yang Anda hadapi?"
              value={kendala}
              onChange={(e) => setKendala(e.target.value)}
              rows={2}
              className="rounded-xl resize-none bg-muted/20 border-border text-xs focus:bg-background transition-all"
            />
          </div>

          {/* 4. Tindak Lanjut (Opsional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              Tindak Lanjut <span className="text-muted-foreground font-normal">(Opsional)</span>
            </label>
            <Textarea
              placeholder="Bagaimana Anda mengatasi kendala tersebut?"
              value={tindakLanjut}
              onChange={(e) => setTindakLanjut(e.target.value)}
              rows={2}
              className="rounded-xl resize-none bg-muted/20 border-border text-xs focus:bg-background transition-all"
            />
          </div>

          {/* 5. Foto Dokumentasi (Opsional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              Foto Dokumentasi <span className="text-muted-foreground font-normal">(Opsional)</span>
            </label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {photoUrl ? (
              <div className="relative rounded-xl border border-border p-3 bg-muted/20 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoUrl}
                  alt="Dokumentasi"
                  className="h-16 w-16 rounded-lg object-cover border border-border shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">Foto Dokumentasi Terlampir</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Siap dikirim bersama jurnal</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setPhotoUrl(null)}
                  className="rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl border-2 border-dashed border-border/80 hover:border-primary/50 hover:bg-muted/30 p-6 flex flex-col items-center justify-center cursor-pointer transition-all group"
              >
                <UploadCloud className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors mt-2">
                  Klik untuk upload foto
                </span>
                <span className="text-[10px] text-muted-foreground/70 mt-0.5">
                  Format JPG, PNG (Maks. 5MB)
                </span>
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl h-10 px-5 text-xs font-semibold"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl h-10 px-6 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
            >
              {isSubmitting ? "Mengirim..." : "Kirim Jurnal"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
