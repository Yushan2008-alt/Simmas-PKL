"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  Building2,
  ClipboardCheck,
  CalendarCheck,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  Calendar,
  Eye,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  getActiveGuru,
  getKunjunganList,
  getJurnalList,
  getSupervisedStudentsSummary,
  validateJurnal,
  updateKunjungan,
  SupervisedStudentSummary,
} from "@/lib/supabase/services";
import { Kunjungan, Jurnal, Dudi } from "@/types/database";
import { TambahKunjunganModal } from "@/components/guru/tambah-kunjungan-modal";
import { RevisiJurnalModal } from "@/components/guru/revisi-jurnal-modal";
import { DetailSiswaModal } from "@/components/guru/detail-siswa-modal";

export default function GuruDashboardPage() {
  const guru = getActiveGuru();
  const [loading, setLoading] = React.useState(true);
  const [summaries, setSummaries] = React.useState<SupervisedStudentSummary[]>([]);
  const [kunjunganList, setKunjunganList] = React.useState<Kunjungan[]>([]);
  const [pendingJurnals, setPendingJurnals] = React.useState<Jurnal[]>([]);

  // Modals state
  const [isTambahKunjunganOpen, setIsTambahKunjunganOpen] = React.useState(false);
  const [revisiJurnal, setRevisiJurnal] = React.useState<Jurnal | null>(null);
  const [selectedStudentSummary, setSelectedStudentSummary] =
    React.useState<SupervisedStudentSummary | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      const [sumList, kList, jList] = await Promise.all([
        getSupervisedStudentsSummary(guru.id),
        getKunjunganList(guru.id),
        getJurnalList({ teacherId: guru.id, status: "Pending" }),
      ]);
      setSummaries(sumList);
      setKunjunganList(kList);
      setPendingJurnals(jList);
    } catch (e) {
      console.error("Failed to load guru dashboard data:", e);
    } finally {
      setLoading(false);
    }
  }, [guru.id]);

  React.useEffect(() => {
    loadData();

    // Listen to real-time sync events
    const handleKunjunganUpdate = () => loadData();
    const handleJurnalUpdate = () => loadData();

    if (typeof window !== "undefined") {
      window.addEventListener("simmas_kunjungan_updated", handleKunjunganUpdate);
      window.addEventListener("simmas_jurnal_updated", handleJurnalUpdate);
      return () => {
        window.removeEventListener("simmas_kunjungan_updated", handleKunjunganUpdate);
        window.removeEventListener("simmas_jurnal_updated", handleJurnalUpdate);
      };
    }
  }, [loadData]);

  // Derived metrics
  const totalSiswa = summaries.length;
  const uniqueDudis = Array.from(
    new Set(summaries.map((s) => s.dudi.id))
  ).map((id) => summaries.find((s) => s.dudi.id === id)!.dudi);

  // Kunjungan bulan ini
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const kunjunganBulanIni = kunjunganList.filter((k) => {
    const d = new Date(k.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  const jadwalMendatang = kunjunganList
    .filter((k) => k.status === "Terjadwal")
    .slice(0, 4);

  const siswaPerhatian = summaries.filter(
    (s) => s.attendanceRate < 85 || s.pendingJurnal > 0 || s.revisionJurnal > 0
  );

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

  const handleMarkVisitCompleted = async (kunjungan: Kunjungan) => {
    try {
      await updateKunjungan(kunjungan.id, { status: "Selesai" });
      toast.success("Kunjungan ditandai selesai", {
        description: `Kunjungan ke ${kunjungan.dudi?.name} telah selesai.`,
      });
      loadData();
    } catch (e: any) {
      toast.error("Gagal memperbarui status", {
        description: e?.message || "Terjadi kesalahan.",
      });
    }
  };

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/10 text-blue-600">
              Portal Guru Pembimbing
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">{guru.department}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Selamat Datang, {guru.name}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pantau kehadiran, validasi jurnal harian, dan koordinasikan agenda kunjungan DUDI.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            onClick={() => setIsTambahKunjunganOpen(true)}
            className="rounded-xl h-11 px-4 gap-2 font-bold shadow-md shadow-primary/20"
          >
            <Plus className="h-4 w-4" />
            <span>+ Tambah Kunjungan</span>
          </Button>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Siswa Bimbingan */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Siswa Bimbingan
            </p>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-black text-foreground">{totalSiswa}</p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              Aktif Magang di Industri
            </p>
          </div>
        </div>

        {/* DUDI Aktif */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              DUDI Aktif
            </p>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-black text-foreground">{uniqueDudis.length}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Mitra Industri Penempatan
            </p>
          </div>
        </div>

        {/* Jurnal Menunggu Validasi */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Menunggu Validasi
            </p>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
              <ClipboardCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-black text-amber-600">{pendingJurnals.length}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Jurnal siswa perlu ditinjau
            </p>
          </div>
        </div>

        {/* Kunjungan Bulan Ini */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Kunjungan Bulan Ini
            </p>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
              <CalendarCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-black text-emerald-600">{kunjunganBulanIni}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Total jadwal & monitoring
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid (8 : 4 Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Jadwal Kunjungan & Jurnal Validasi */}
        <div className="lg:col-span-8 space-y-8">
          {/* Jadwal Kunjungan Mendatang */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4 text-primary" />
                  <span>Jadwal Kunjungan Mendatang</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Agenda monitoring guru pembimbing ke lokasi industri
                </p>
              </div>
              <Link
                href="/guru/kunjungan"
                className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1"
              >
                <span>Lihat Semua</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {jadwalMendatang.length === 0 ? (
              <div className="p-8 text-center rounded-xl border border-dashed border-border bg-muted/20">
                <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold text-foreground">
                  Tidak ada agenda kunjungan terjadwal
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Klik tombol &apos;+ Tambah Kunjungan&apos; untuk menjadwalkan kunjungan DUDI.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {jadwalMendatang.map((k) => (
                  <div
                    key={k.id}
                    className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/40 transition-colors"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground truncate">
                          {k.dudi?.name}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {k.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        <span>{k.date}</span>
                        <span>•</span>
                        <span className="truncate">{k.notes}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkVisitCompleted(k)}
                        className="h-8 text-xs font-semibold rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        <span>Tandai Selesai</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Jurnal Perlu Validasi Widget */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4 text-amber-600" />
                  <span>Jurnal Perlu Validasi ({pendingJurnals.length})</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Laporan kegiatan harian siswa magang yang menunggu verifikasi Anda
                </p>
              </div>
              <Link
                href="/guru/jurnal"
                className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1"
              >
                <span>Lihat Jurnal & Presensi</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {pendingJurnals.length === 0 ? (
              <div className="p-8 text-center rounded-xl border border-dashed border-border bg-muted/20">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-foreground">
                  Seluruh Jurnal Telah Divalidasi!
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tidak ada jurnal tertunda yang membutuhkan tindakan saat ini.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingJurnals.map((j) => (
                  <div
                    key={j.id}
                    className="p-4 rounded-xl border border-amber-200/80 bg-amber-500/5 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-sm text-foreground">
                          {j.student?.name}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({j.student?.class_name})
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {j.date}
                      </span>
                    </div>

                    <p className="text-xs text-foreground/90 leading-relaxed bg-background/80 p-3 rounded-lg border border-border/60">
                      {j.activity}
                    </p>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setRevisiJurnal(j)}
                        className="h-8 text-xs font-semibold rounded-lg text-amber-700 hover:bg-amber-100/50 border-amber-300"
                      >
                        <MessageSquare className="h-3.5 w-3.5 mr-1" />
                        <span>Beri Catatan Revisi</span>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApproveJurnal(j)}
                        className="h-8 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        <span>Setujui Jurnal</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Siswa Perlu Perhatian & Quick Nav */}
        <div className="lg:col-span-4 space-y-8">
          {/* Siswa Perlu Perhatian */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span>Siswa Perlu Perhatian</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Indikator absensi rendah atau kendala jurnal
                </p>
              </div>
            </div>

            {siswaPerhatian.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-emerald-500/5 border border-emerald-200 dark:border-emerald-900/50">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-foreground">
                  Kondisi Siswa Sangat Baik
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Seluruh siswa bimbingan memiliki presensi di atas 85% dan jurnal teratur.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {siswaPerhatian.map((s) => (
                  <div
                    key={s.student.id}
                    onClick={() => setSelectedStudentSummary(s)}
                    className="p-3.5 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                          {s.student.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {s.dudi.name}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.attendanceRate < 80
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        Presensi {s.attendanceRate}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/60">
                      <span>{s.pendingJurnal} Jurnal Pending</span>
                      <span className="text-primary font-semibold flex items-center gap-0.5 group-hover:underline">
                        Lihat Detail <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Nav Card */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
              Akses Cepat
            </h3>
            <div className="space-y-2">
              <Link
                href="/guru/siswa"
                className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-muted transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                      Daftar Siswa Bimbingan
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Kelola {totalSiswa} siswa magang
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>

              <Link
                href="/guru/jurnal"
                className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-muted transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                    <ClipboardCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                      Jurnal & Absensi
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Verifikasi & rekap kehadiran
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>

              <Link
                href="/guru/kunjungan"
                className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-muted transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                    <CalendarCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                      Kunjungan Lapangan
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Jadwal dan rekam jejak industri
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </div>
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
