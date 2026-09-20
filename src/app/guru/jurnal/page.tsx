"use client";

import * as React from "react";
import {
  ClipboardCheck,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  MessageSquare,
  Calendar,
  User,
  Users,
  Check,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getActiveGuru,
  getDefaultGuru,
  getJurnalList,
  validateJurnal,
  getSupervisedStudentsSummary,
  SupervisedStudentSummary,
} from "@/lib/supabase/services";
import { Guru, Jurnal, JurnalStatus } from "@/types/database";
import { RevisiJurnalModal } from "@/components/guru/revisi-jurnal-modal";

export default function GuruJurnalPage() {
  const [guru, setGuru] = React.useState<Guru>(() => getActiveGuru());
  const [activeTab, setActiveTab] = React.useState<"jurnal" | "presensi">("jurnal");
  const [jurnals, setJurnals] = React.useState<Jurnal[]>([]);
  const [summaries, setSummaries] = React.useState<SupervisedStudentSummary[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");

  // Modal revisi
  const [revisiJurnal, setRevisiJurnal] = React.useState<Jurnal | null>(null);

  const loadData = React.useCallback(async () => {
    const currentGuru = getActiveGuru();
    setGuru(currentGuru);
    if (!currentGuru || !currentGuru.id) {
      setLoading(false);
      return;
    }

    try {
      const [jList, sumList] = await Promise.all([
        getJurnalList({ teacherId: currentGuru.id }),
        getSupervisedStudentsSummary(currentGuru.id),
      ]);
      setJurnals(jList);
      setSummaries(sumList);
    } catch (e) {
      console.error("Failed to load jurnal data:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();

    const handleAuthChange = () => loadData();
    const handleJurnalUpdate = () => loadData();
    const handlePenempatanUpdate = () => loadData();

    if (typeof window !== "undefined") {
      window.addEventListener("simmas_auth_changed", handleAuthChange);
      window.addEventListener("simmas_jurnal_updated", handleJurnalUpdate);
      window.addEventListener("simmas_penempatan_updated", handlePenempatanUpdate);
      return () => {
        window.removeEventListener("simmas_auth_changed", handleAuthChange);
        window.removeEventListener("simmas_jurnal_updated", handleJurnalUpdate);
        window.removeEventListener("simmas_penempatan_updated", handlePenempatanUpdate);
      };
    }
  }, [loadData]);

  const handleApprove = async (jurnal: Jurnal) => {
    try {
      await validateJurnal(jurnal.id, "Disetujui");
      toast.success("Jurnal disetujui", {
        description: `Laporan kegiatan dari ${jurnal.student?.name} telah diverifikasi.`,
      });
      loadData();
    } catch (e: any) {
      toast.error("Gagal menyetujui jurnal", {
        description: e?.message || "Terjadi kesalahan.",
      });
    }
  };

  // Filtered journals
  const filteredJurnals = jurnals.filter((j) => {
    const matchSearch =
      (j.student?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      j.activity.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "ALL" ||
      (statusFilter === "Pending" && j.status === "Pending") ||
      (statusFilter === "Disetujui" && j.status === "Disetujui") ||
      (statusFilter === "Perlu Revisi" && j.status === "Perlu Revisi");

    return matchSearch && matchStatus;
  });

  const pendingCount = jurnals.filter((j) => j.status === "Pending").length;
  const approvedCount = jurnals.filter((j) => j.status === "Disetujui").length;
  const revisionCount = jurnals.filter((j) => j.status === "Perlu Revisi").length;

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/10 text-blue-600">
              Monitoring & Evaluasi
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Jurnal & Absensi Siswa
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Verifikasi jurnal kegiatan harian serta tinjau rekapitulasi presensi siswa bimbingan.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-muted rounded-xl border border-border shrink-0">
          <button
            onClick={() => setActiveTab("jurnal")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "jurnal"
                ? "bg-card text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ClipboardCheck className="h-4 w-4" />
            <span>Jurnal Kegiatan</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("presensi")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "presensi"
                ? "bg-card text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            <span>Rekap Presensi</span>
          </button>
        </div>
      </div>

      {/* TAB 1: JURNAL KEGIATAN */}
      {activeTab === "jurnal" && (
        <div className="space-y-6">
          {/* Status Quick Filter Pills */}
          {/* Search & Filter Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari siswa atau kegiatan jurnal..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 rounded-xl bg-card text-xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setStatusFilter("ALL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === "ALL"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-card text-muted-foreground border border-border hover:bg-muted"
                }`}
              >
                Semua ({jurnals.length})
              </button>
              <button
                onClick={() => setStatusFilter("Pending")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === "Pending"
                    ? "bg-amber-500 text-white shadow-xs"
                    : "bg-card text-amber-600 border border-border hover:bg-amber-50"
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setStatusFilter("Disetujui")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === "Disetujui"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-card text-emerald-600 border border-border hover:bg-emerald-50"
                }`}
              >
                Disetujui ({approvedCount})
              </button>
              <button
                onClick={() => setStatusFilter("Perlu Revisi")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === "Perlu Revisi"
                    ? "bg-red-500 text-white shadow-xs"
                    : "bg-card text-red-600 border border-border hover:bg-red-50"
                }`}
              >
                Revisi ({revisionCount})
              </button>
            </div>
          </div>

          {/* Journal List */}
          {loading ? (
            <div className="p-12 text-center text-xs text-muted-foreground">
              Memuat data jurnal...
            </div>
          ) : jurnals.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card">
              <ClipboardCheck className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm font-bold text-foreground">
                Belum Ada Laporan Jurnal
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-sm mx-auto">
                Belum ada jurnal kegiatan dari siswa bimbingan Anda. Siswa yang telah ditempatkan akan mengirimkan laporan harian mereka ke sini.
              </p>
            </div>
          ) : filteredJurnals.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card">
              <ClipboardCheck className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm font-bold text-foreground">
                Tidak ada jurnal yang sesuai
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Coba sesuaikan kata kunci pencarian atau filter status Anda.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJurnals.map((j) => {
                const isPending = j.status === "Pending";
                const isApproved = j.status === "Disetujui";
                const isRevision = j.status === "Perlu Revisi";

                return (
                  <div
                    key={j.id}
                    className={`p-5 rounded-2xl border bg-card transition-all space-y-3 ${
                      isPending
                        ? "border-amber-300/80 shadow-xs bg-amber-500/2"
                        : "border-border"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                          {j.student?.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-foreground">
                              {j.student?.name}
                            </h3>
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-muted text-foreground border border-border">
                              {j.student?.class_name}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            NIS: {j.student?.nis}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {j.date}
                        </span>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
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
                    </div>

                    {/* Activity Body */}
                    <div className="p-3.5 rounded-xl bg-muted/30 border border-border/80">
                      <p className="text-xs text-foreground leading-relaxed">
                        {j.activity}
                      </p>
                    </div>

                    {/* Existing Feedback Note */}
                    {j.teacher_feedback && (
                      <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-200 text-xs text-blue-900 dark:bg-blue-950/20 dark:border-blue-900 dark:text-blue-200 space-y-0.5">
                        <p className="font-bold text-[11px] flex items-center gap-1.5">
                          <MessageSquare className="h-3.5 w-3.5 text-blue-600" />
                          <span>Catatan Evaluasi Guru:</span>
                        </p>
                        <p className="pl-5 text-muted-foreground text-[11px]">
                          {j.teacher_feedback}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/60">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setRevisiJurnal(j)}
                        className="h-8 text-xs font-semibold rounded-xl text-amber-700 hover:bg-amber-50 border-amber-300"
                      >
                        <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                        <span>Beri Catatan Revisi</span>
                      </Button>

                      {!isApproved && (
                        <Button
                          size="sm"
                          onClick={() => handleApprove(j)}
                          className="h-8 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                          <span>Setujui Jurnal</span>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: REKAP PRESENSI */}
      {activeTab === "presensi" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                    <th className="px-6 py-4">Siswa Bimbingan</th>
                    <th className="px-4 py-4">Kelas</th>
                    <th className="px-4 py-4">Mitra DUDI</th>
                    <th className="px-4 py-4 text-center">Hadir</th>
                    <th className="px-4 py-4 text-center">Sakit</th>
                    <th className="px-4 py-4 text-center">Izin</th>
                    <th className="px-4 py-4 text-center">Alfa</th>
                    <th className="px-6 py-4 text-center">Persentase</th>
                    <th className="px-6 py-4 text-center">Kategori</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {summaries.map((s) => {
                    const rate = s.attendanceRate;
                    const category =
                      rate >= 95
                        ? "Sangat Baik"
                        : rate >= 85
                        ? "Baik"
                        : rate >= 75
                        ? "Cukup"
                        : "Perlu Bimbingan";

                    return (
                      <tr key={s.student.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-foreground text-sm">
                            {s.student.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            NIS: {s.student.nis}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-muted text-foreground border border-border">
                            {s.student.class_name}
                          </span>
                        </td>

                        <td className="px-4 py-4 font-medium text-foreground">
                          {s.dudi.name}
                        </td>

                        <td className="px-4 py-4 text-center font-bold text-emerald-600">
                          {s.hadirCount}
                        </td>

                        <td className="px-4 py-4 text-center font-semibold text-blue-600">
                          {s.sakitCount}
                        </td>

                        <td className="px-4 py-4 text-center font-semibold text-amber-600">
                          {s.izinCount}
                        </td>

                        <td className="px-4 py-4 text-center font-bold text-red-600">
                          {s.alfaCount}
                        </td>

                        <td className="px-6 py-4 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                              rate >= 90
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : rate >= 80
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                          >
                            {rate}%
                          </span>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <span className="text-xs font-semibold text-muted-foreground">
                            {category}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Revisi */}
      <RevisiJurnalModal
        isOpen={!!revisiJurnal}
        onClose={() => setRevisiJurnal(null)}
        onSuccess={loadData}
        jurnal={revisiJurnal}
      />
    </div>
  );
}
