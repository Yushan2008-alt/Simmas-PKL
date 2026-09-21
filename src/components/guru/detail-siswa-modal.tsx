"use client";

import * as React from "react";
import {
  X,
  User,
  Building2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  BadgeCheck,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Jurnal, Absensi } from "@/types/database";
import { SupervisedStudentSummary, getJurnalList, getAbsensiList } from "@/lib/supabase/services";

interface DetailSiswaModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: SupervisedStudentSummary | null;
}

export function DetailSiswaModal({
  isOpen,
  onClose,
  summary,
}: DetailSiswaModalProps) {
  const [jurnals, setJurnals] = React.useState<Jurnal[]>([]);
  const [absensi, setAbsensi] = React.useState<Absensi[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && summary?.student) {
      setLoading(true);
      Promise.all([
        getJurnalList({ studentId: summary.student.id }),
        getAbsensiList([summary.student.id]),
      ])
        .then(([jList, aList]) => {
          setJurnals(jList);
          setAbsensi(aList);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, summary]);

  if (!isOpen || !summary) return null;

  const { student, dudi, penempatan } = summary;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-card rounded-2xl border border-border shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-extrabold text-sm">
              {student.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-foreground">
                  {student.name}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300">
                  {student.class_name}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                NIS: {student.nis} • {student.email}
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

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* DUDI Placement Info Card */}
          <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <Building2 className="h-4 w-4 text-primary" />
                <span>Penempatan DUDI</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {penempatan.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-muted-foreground text-[10px] uppercase tracking-wider font-semibold">
                  Perusahaan
                </p>
                <p className="font-bold text-foreground">{dudi.name}</p>
                <p className="text-muted-foreground">{dudi.sector}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px] uppercase tracking-wider font-semibold">
                  PIC Industri
                </p>
                <p className="font-bold text-foreground">{dudi.pic_name}</p>
                <p className="text-muted-foreground">{dudi.pic_phone}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-muted-foreground text-[10px] uppercase tracking-wider font-semibold">
                  Periode Magang
                </p>
                <p className="font-medium text-foreground flex items-center gap-1.5 mt-0.5">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{penempatan.start_date} s/d {penempatan.end_date}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Attendance KPI Summary */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                <span>Rekap Presensi</span>
              </h4>
              <span className="text-xs font-extrabold text-foreground">
                Tingkat Kehadiran: {summary.attendanceRate}%
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2.5 text-center">
              <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-900">
                <p className="text-lg font-extrabold text-emerald-600">{summary.hadirCount}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Hadir</p>
              </div>
              <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900">
                <p className="text-lg font-extrabold text-blue-600">{summary.sakitCount}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Sakit</p>
              </div>
              <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900">
                <p className="text-lg font-extrabold text-amber-600">{summary.izinCount}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Izin</p>
              </div>
              <div className="p-3 rounded-xl border border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900">
                <p className="text-lg font-extrabold text-red-600">{summary.alfaCount}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Alfa</p>
              </div>
            </div>
          </div>

          {/* Journal History */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-primary" />
                <span>Riwayat Jurnal Kegiatan ({jurnals.length})</span>
              </h4>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-amber-600 font-semibold">
                  {summary.pendingJurnal} Menunggu
                </span>
                <span>•</span>
                <span className="text-emerald-600 font-semibold">
                  {summary.approvedJurnal} Disetujui
                </span>
              </div>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                Memuat data jurnal...
              </div>
            ) : jurnals.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground rounded-xl border border-dashed border-border">
                Belum ada jurnal yang diisi oleh siswa.
              </div>
            ) : (
              <div className="space-y-2.5">
                {jurnals.map((j) => {
                  const isPending = j.status === "Pending";
                  const isApproved = j.status === "Disetujui";
                  const isRevision = j.status === "Perlu Revisi";

                  return (
                    <div
                      key={j.id}
                      className="p-3.5 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" />
                          {j.date}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isApproved
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : isPending
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {j.status}
                        </span>
                      </div>
                      <p className="text-xs text-foreground leading-relaxed">
                        {j.activity}
                      </p>
                      {j.teacher_feedback && (
                        <div className="mt-2 text-[11px] p-2 rounded-lg bg-muted/60 border border-border/60 text-muted-foreground">
                          <span className="font-semibold text-foreground">Catatan Guru: </span>
                          {j.teacher_feedback}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-border bg-muted/20">
          <Button
            type="button"
            onClick={onClose}
            className="rounded-xl px-6 font-bold"
          >
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}
