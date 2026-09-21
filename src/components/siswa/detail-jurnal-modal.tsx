"use client";

import * as React from "react";
import { X, CheckCircle2, Calendar, FileText, AlertCircle, ArrowRight, MessageSquare, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Jurnal } from "@/types/database";

interface DetailJurnalModalProps {
  isOpen: boolean;
  onClose: () => void;
  jurnal: Jurnal | null;
}

export function DetailJurnalModal({
  isOpen,
  onClose,
  jurnal,
}: DetailJurnalModalProps) {
  if (!isOpen || !jurnal) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-200">
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-card rounded-2xl sm:rounded-3xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground">
                  Detail Jurnal Kegiatan
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Terverifikasi
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Tanggal: {jurnal.date}</span>
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
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
          {/* Rincian Kegiatan */}
          <div className="space-y-1.5">
            <p className="font-bold text-foreground text-[11px] uppercase tracking-wider text-muted-foreground">
              Rincian Kegiatan
            </p>
            <div className="p-3.5 rounded-xl bg-muted/30 border border-border text-foreground leading-relaxed">
              {jurnal.activity}
            </div>
          </div>

          {/* Kendala */}
          <div className="space-y-1.5">
            <p className="font-bold text-foreground text-[11px] uppercase tracking-wider text-muted-foreground">
              Kendala / Masalah
            </p>
            <div className="p-3.5 rounded-xl bg-muted/30 border border-border text-foreground leading-relaxed">
              {jurnal.kendala || "-"}
            </div>
          </div>

          {/* Tindak Lanjut */}
          <div className="space-y-1.5">
            <p className="font-bold text-foreground text-[11px] uppercase tracking-wider text-muted-foreground">
              Tindak Lanjut
            </p>
            <div className="p-3.5 rounded-xl bg-muted/30 border border-border text-foreground leading-relaxed">
              {jurnal.tindak_lanjut || "-"}
            </div>
          </div>

          {/* Foto Dokumentasi */}
          {jurnal.photo_url && (
            <div className="space-y-1.5">
              <p className="font-bold text-foreground text-[11px] uppercase tracking-wider text-muted-foreground">
                Foto Dokumentasi
              </p>
              <div className="p-2 rounded-xl bg-muted/30 border border-border flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={jurnal.photo_url}
                  alt="Dokumentasi Jurnal"
                  className="max-h-60 rounded-lg object-contain"
                />
              </div>
            </div>
          )}

          {/* Catatan Guru Pembimbing (jika ada) */}
          {jurnal.teacher_feedback && (
            <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 dark:bg-blue-950/20 dark:border-blue-900 space-y-1">
              <p className="text-xs font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Catatan Guru Pembimbing:</span>
              </p>
              <p className="text-xs text-blue-900/90 dark:text-blue-200/90 leading-relaxed italic pl-5">
                &ldquo;{jurnal.teacher_feedback}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-4 border-t border-border bg-card">
          <Button
            type="button"
            onClick={onClose}
            className="rounded-xl h-10 px-6 text-xs font-semibold"
          >
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}
