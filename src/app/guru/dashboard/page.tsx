"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  Building2,
  ClipboardCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  BookOpen,
  FileText,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  getActiveGuru,
  getDefaultGuru,
  getKunjunganList,
  getJurnalList,
  getAbsensiList,
  getSupervisedStudentsSummary,
  validateJurnal,
  SupervisedStudentSummary,
} from "@/lib/supabase/services";
import { Guru, Kunjungan, Jurnal, Absensi } from "@/types/database";
import { TambahKunjunganModal } from "@/components/guru/tambah-kunjungan-modal";
import { RevisiJurnalModal } from "@/components/guru/revisi-jurnal-modal";
import { DetailSiswaModal } from "@/components/guru/detail-siswa-modal";

export default function GuruDashboardPage() {
  const [guru, setGuru] = React.useState<Guru>(() => getActiveGuru());
  const [loading, setLoading] = React.useState(true);
  const [summaries, setSummaries] = React.useState<SupervisedStudentSummary[]>([]);
  const [kunjunganList, setKunjunganList] = React.useState<Kunjungan[]>([]);
  const [pendingJurnals, setPendingJurnals] = React.useState<Jurnal[]>([]);
  const [todayAbsensiList, setTodayAbsensiList] = React.useState<Absensi[]>([]);

  // Modals state
  const [isTambahKunjunganOpen, setIsTambahKunjunganOpen] = React.useState(false);
  const [revisiJurnal, setRevisiJurnal] = React.useState<Jurnal | null>(null);
  const [selectedStudentSummary, setSelectedStudentSummary] =
    React.useState<SupervisedStudentSummary | null>(null);

  const loadData = React.useCallback(async () => {
    const currentGuru = getActiveGuru();
    setGuru(currentGuru);
    if (!currentGuru || !currentGuru.id) {
      setLoading(false);
      return;
    }

    try {
      const [sumList, kList, jList, allAbs] = await Promise.all([
        getSupervisedStudentsSummary(currentGuru.id),
        getKunjunganList(currentGuru.id),
        getJurnalList({ teacherId: currentGuru.id, status: "Pending" }),
        getAbsensiList(),
      ]);

      setSummaries(sumList);
      setKunjunganList(kList);
      setPendingJurnals(jList);

      const todayStr = new Date().toISOString().split("T")[0];
      const todayAbs = allAbs.filter((a) => a.date === todayStr);
      setTodayAbsensiList(todayAbs);
    } catch (e) {
      console.error("Failed to load guru dashboard data:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();

    // Listen to real-time sync & auth events
    const handleAuthChange = () => loadData();
    const handleKunjunganUpdate = () => loadData();
    const handleJurnalUpdate = () => loadData();
    const handleAbsensiUpdate = () => loadData();

    if (typeof window !== "undefined") {
      window.addEventListener("simmas_auth_changed", handleAuthChange);
      window.addEventListener("simmas_kunjungan_updated", handleKunjunganUpdate);
      window.addEventListener("simmas_jurnal_updated", handleJurnalUpdate);
      window.addEventListener("simmas_absensi_updated", handleAbsensiUpdate);
      return () => {
        window.removeEventListener("simmas_auth_changed", handleAuthChange);
        window.removeEventListener("simmas_kunjungan_updated", handleKunjunganUpdate);
        window.removeEventListener("simmas_jurnal_updated", handleJurnalUpdate);
        window.removeEventListener("simmas_absensi_updated", handleAbsensiUpdate);
      };
    }
  }, [loadData]);

  // Derived metrics
  const totalSiswa = summaries.length;
  const uniqueDudis = Array.from(
    new Set(summaries.map((s) => s.dudi.id))
  ).map((id) => summaries.find((s) => s.dudi.id === id)!.dudi);

  const hadirHariIni = summaries.filter((s) =>
    todayAbsensiList.some(
      (a) => a.student_id === s.student.id && a.status === "Hadir"
    )
  ).length;

  const kehadiranPersen =
    totalSiswa > 0 ? Math.round((hadirHariIni / totalSiswa) * 100) : 0;

  const todayFormatted = new Date()
    .toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    .toUpperCase();

  const handleApproveJurnal = async (jurnal: Jurnal) => {
    try {
      await validateJurnal(jurnal.id, "Disetujui");
      toast.success("Jurnal disetujui", {
        description: `Jurnal dari ${jurnal.student?.name} telah disetujui.`,
      });
      loadData();
    } catch (e: any) {
      toast.error("Gagal menyetujui jurnal", {
        description: e?.message || "Terjadi kesalahan.",
      });
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* 1. TOP BANNER (Minimalist Vibrant Blue) */}
      <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-blue-600 via-blue-600 to-sky-500 p-6 sm:p-8 text-white relative shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <p suppressHydrationWarning className="text-[11px] sm:text-xs font-bold text-white/80 uppercase tracking-widest">
              {todayFormatted}
            </p>
            <h1 suppressHydrationWarning className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Selamat datang, {guru.name}
            </h1>
            <p className="text-xs sm:text-sm text-white/90">
              Ada{" "}
              <span className="font-bold underline decoration-white/40 underline-offset-2">
                {pendingJurnals.length} jurnal
              </span>{" "}
              siswa bimbingan yang menunggu evaluasi Anda.
            </p>
          </div>

          <div className="shrink-0">
            <Link href="/guru/jurnal">
              <Button
                variant="outline"
                className="bg-white text-blue-600 hover:bg-white/90 border-0 font-bold text-xs rounded-xl h-10 px-4 gap-2 shadow-xs transition-all"
              >
                <BookOpen className="h-4 w-4" />
                <span>Lihat Jurnal</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. THREE COMPACT METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        {/* Siswa Bimbingan */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs hover:shadow-xs transition-all space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Siswa Bimbingan
            </p>
            <div className="p-2 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-3xl font-black text-foreground">{totalSiswa}</p>
          </div>
          <Link
            href="/guru/siswa"
            className="flex items-center justify-between text-xs text-muted-foreground hover:text-primary transition-colors group pt-1"
          >
            <span>Siswa aktif magang</span>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>

        {/* Jurnal Belum Dinilai */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs hover:shadow-xs transition-all space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Jurnal Belum Dinilai
            </p>
            <div className="p-2 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-3xl font-black text-foreground">{pendingJurnals.length}</p>
          </div>
          <Link
            href="/guru/jurnal"
            className="flex items-center justify-between text-xs text-muted-foreground hover:text-amber-600 transition-colors group pt-1"
          >
            <span>Perlu evaluasi segera</span>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>

        {/* Kehadiran Hari Ini */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs hover:shadow-xs transition-all space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Kehadiran Hari Ini
            </p>
            <div className="p-2 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-3xl font-black text-foreground">
              {hadirHariIni}/{totalSiswa}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{kehadiranPersen}% siswa hadir</p>
            <div className="w-full bg-muted rounded-full h-1.5 mt-2.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${kehadiranPersen}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. TWO EQUAL BOTTOM COLUMNS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Jurnal Perlu Evaluasi */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-4 flex flex-col justify-between min-h-[220px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-border/60">
              <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                <span>Jurnal Perlu Evaluasi</span>
              </h3>
            </div>

            {pendingJurnals.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground font-medium">
                Semua jurnal bimbingan Anda sudah dievaluasi.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingJurnals.slice(0, 3).map((j) => (
                  <div
                    key={j.id}
                    className="p-3.5 rounded-xl border border-amber-200/80 bg-amber-500/5 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-foreground">
                        {j.student?.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {j.date}
                      </span>
                    </div>
                    <p className="text-xs text-foreground/80 line-clamp-2 leading-relaxed">
                      {j.activity}
                    </p>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setRevisiJurnal(j)}
                        className="h-7 text-[11px] font-semibold rounded-lg text-amber-700 hover:bg-amber-100/50 border-amber-300"
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        <span>Revisi</span>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApproveJurnal(j)}
                        className="h-7 text-[11px] font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        <span>Setujui</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 text-center border-t border-border/40">
            <Link
              href="/guru/jurnal"
              className="text-xs font-semibold text-amber-600 hover:text-amber-700 hover:underline inline-flex items-center gap-1"
            >
              <span>Lihat semua tugas ({pendingJurnals.length})</span>
              <span>&gt;</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Daftar Siswa Bimbingan */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-4 flex flex-col justify-between min-h-[220px]">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-border/60">
              <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span>Daftar Siswa Bimbingan</span>
              </h3>
              <Link
                href="/guru/siswa"
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Lihat Semua
              </Link>
            </div>

            {summaries.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground font-medium">
                Belum ada siswa bimbingan yang ditempatkan.
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {summaries.slice(0, 5).map((s) => {
                  const isHadir = todayAbsensiList.some(
                    (a) => a.student_id === s.student.id && a.status === "Hadir"
                  );

                  return (
                    <div
                      key={s.student.id}
                      onClick={() => setSelectedStudentSummary(s)}
                      className="py-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-muted/30 px-2 rounded-xl transition-colors group"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                          {s.student.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {s.dudi.name}
                        </p>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 shrink-0 ${
                          isHadir
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                            : "bg-muted text-muted-foreground border border-border"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isHadir ? "bg-emerald-600" : "bg-muted-foreground"
                          }`}
                        />
                        <span>{isHadir ? "Hadir" : "Belum Absen"}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <TambahKunjunganModal
        isOpen={isTambahKunjunganOpen}
        onClose={() => setIsTambahKunjunganOpen(false)}
        onSuccess={loadData}
        availableDudis={uniqueDudis}
      />

      <RevisiJurnalModal
        isOpen={!!revisiJurnal}
        onClose={() => setRevisiJurnal(null)}
        onSuccess={loadData}
        jurnal={revisiJurnal}
      />

      <DetailSiswaModal
        isOpen={!!selectedStudentSummary}
        onClose={() => setSelectedStudentSummary(null)}
        summary={selectedStudentSummary}
      />
    </div>
  );
}
