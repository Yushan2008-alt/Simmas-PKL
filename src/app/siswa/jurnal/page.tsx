"use client";

import * as React from "react";
import Link from "next/link";
import {
  ClipboardCheck,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Lock,
  Plus,
  Edit3,
  MessageSquare,
  Send,
  ChevronRight,
  Filter,
  Search,
  ShieldAlert,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  getActiveSiswa,
  getDefaultSiswa,
  getJurnalList,
  createJurnalSiswa,
  getStudentPlacement,
} from "@/lib/supabase/services";
import { Siswa, Jurnal, Penempatan } from "@/types/database";
import { EditJurnalModal } from "@/components/siswa/edit-jurnal-modal";

export default function SiswaJurnalPage() {
  const [siswa, setSiswa] = React.useState<Siswa>(() => getActiveSiswa());
  const [placement, setPlacement] = React.useState<Penempatan | null>(null);
  const [jurnals, setJurnals] = React.useState<Jurnal[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Form states
  const [date, setDate] = React.useState("");
  const [activity, setActivity] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [searchTerm, setSearchTerm] = React.useState("");

  // Edit modal
  const [editingJurnal, setEditingJurnal] = React.useState<Jurnal | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      const current = getActiveSiswa();
      setSiswa(current);

      const [place, jList] = await Promise.all([
        getStudentPlacement(current.id),
        getJurnalList({ studentId: current.id }),
      ]);

      setPlacement(place);
      setJurnals(jList);
    } catch (e) {
      console.error("Failed to load student jurnals:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
    // Default today date
    const today = new Date().toISOString().split("T")[0];
    setDate(today);

    const handleUpdate = () => loadData();
    if (typeof window !== "undefined") {
      window.addEventListener("simmas_auth_changed", handleUpdate);
      window.addEventListener("simmas_jurnal_updated", handleUpdate);
      window.addEventListener("simmas_siswa_updated", handleUpdate);
      window.addEventListener("simmas_penempatan_updated", handleUpdate);
      return () => {
        window.removeEventListener("simmas_auth_changed", handleUpdate);
        window.removeEventListener("simmas_jurnal_updated", handleUpdate);
        window.removeEventListener("simmas_siswa_updated", handleUpdate);
        window.removeEventListener("simmas_penempatan_updated", handleUpdate);
      };
    }
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!activity.trim()) {
      toast.error("Kegiatan belum diisi", {
        description: "Silakan tuliskan deskripsi kegiatan yang Anda lakukan hari ini.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createJurnalSiswa(siswa.id, date, activity.trim());
      toast.success("Jurnal Berhasil Disimpan!", {
        description: "Laporan harian telah dikirim dan berstatus 'Pending' menunggu validasi guru.",
      });
      setActivity("");
      loadData();
    } catch (err: any) {
      toast.error("Gagal menyimpan jurnal", {
        description: err?.message || "Terjadi kesalahan sistem.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBelumMagang = siswa.status === "Belum Magang" || !placement;

  const filteredJurnals = jurnals.filter((j) => {
    const matchStatus = statusFilter === "ALL" || j.status === statusFilter;
    const matchSearch =
      !searchTerm ||
      j.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.date.includes(searchTerm);
    return matchStatus && matchSearch;
  });

  const pendingCount = jurnals.filter((j) => j.status === "Pending").length;
  const approvedCount = jurnals.filter((j) => j.status === "Disetujui").length;
  const revisionCount = jurnals.filter((j) => j.status === "Perlu Revisi").length;

  return (
    <div className="space-y-6 w-full">
      {/* CASE 1: BELUM MAGANG (SESUAI GAMBAR SCREENSHOT 4) */}
      {isBelumMagang ? (
        <div className="space-y-6">
          {/* Top Warning Banner */}
          <div className="rounded-2xl border border-amber-300 bg-amber-500/10 p-5 sm:p-6 shadow-2xs">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-700 shrink-0 mt-0.5">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div className="space-y-1.5 flex-1">
                <h3 className="text-sm sm:text-base font-bold text-foreground">
                  Akses Kegiatan Magang Belum Aktif
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Anda belum memiliki tempat magang yang disetujui. Anda baru dapat mengisi absensi harian dan jurnal kegiatan setelah pengajuan tempat magang disetujui oleh Admin.
                </p>
                <div className="pt-2">
                  <Link href="/siswa/pengajuan">
                    <Button className="rounded-xl px-4 h-9 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white gap-1.5 shadow-xs">
                      <span>Ajukan Tempat Magang</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar (Search & Disabled Tulis Jurnal Button) */}
          <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                disabled
                placeholder="Cari kegiatan atau kendala..."
                className="pl-10 h-10 rounded-xl bg-muted/20 text-xs w-full"
              />
            </div>

            <Button
              disabled
              className="rounded-xl px-5 h-10 text-xs font-bold bg-blue-600/60 text-white cursor-not-allowed opacity-60 gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Tulis Jurnal</span>
            </Button>
          </div>

          {/* Jurnal Table with Book Empty State */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 border-b border-border text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3.5">TANGGAL</th>
                    <th className="px-5 py-3.5">KEGIATAN</th>
                    <th className="px-5 py-3.5 text-center">FOTO</th>
                    <th className="px-5 py-3.5 text-center">STATUS</th>
                    <th className="px-5 py-3.5 text-right">AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <BookOpen className="h-10 w-10 text-muted-foreground/50" />
                        <p className="text-xs font-bold text-foreground">
                          Belum ada jurnal kegiatan.
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Tekan tombol &quot;Tulis Jurnal&quot; untuk mulai melaporkan aktivitas.
                        </p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* UNLOCKED ACTIVE STATE */
        <div className="space-y-8">
          {/* New Journal Form Card */}
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Plus className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Tulis Jurnal Hari Ini</h3>
                <p className="text-xs text-muted-foreground">Deskripsi fleksibel tanpa batas minimal kata</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <span>Tanggal Kegiatan</span>
                  </label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-11 rounded-xl"
                    required
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span>Mitra DUDI Penempatan</span>
                  </label>
                  <div className="h-11 px-3.5 rounded-xl border border-border bg-muted/40 flex items-center text-xs font-semibold text-foreground">
                    {placement?.dudi?.name || "Belum Ditugaskan / Mitra DUDI"}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Deskripsi Kegiatan / Hasil Pekerjaan
                </label>
                <Textarea
                  placeholder="Ceritakan tugas yang Anda kerjakan, kendala yang dihadapi, atau ilmu baru yang dipelajari hari ini..."
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  rows={4}
                  className="rounded-xl resize-none"
                  required
                />
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl px-7 text-xs font-bold gap-2 h-11 bg-primary shadow-md shadow-primary/20"
                >
                  <Send className="h-4 w-4" />
                  <span>{isSubmitting ? "Mengirim..." : "Kirim Laporan Jurnal"}</span>
                </Button>
              </div>
            </form>
          </div>

          {/* Journal History & Search/Status Filter */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-foreground">
                Riwayat Jurnal Magang ({filteredJurnals.length})
              </h3>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari kegiatan atau tanggal..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10 rounded-xl bg-card text-xs"
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
                    Perlu Revisi ({revisionCount})
                  </button>
                </div>
              </div>
            </div>

            {/* List */}
            {loading ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                Memuat data jurnal...
              </div>
            ) : filteredJurnals.length === 0 ? (
              <div className="p-12 text-center rounded-3xl border border-dashed border-border bg-card">
                <ClipboardCheck className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold text-foreground">
                  Belum ada laporan jurnal dalam kategori ini.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredJurnals.map((j) => {
                  const isPending = j.status === "Pending";
                  const isApproved = j.status === "Disetujui";
                  const isRevision = j.status === "Perlu Revisi";

                  return (
                    <div
                      key={j.id}
                      className={`p-5 rounded-2xl border bg-card space-y-3 transition-all ${
                        isRevision
                          ? "border-red-300 bg-red-500/2"
                          : isPending
                          ? "border-amber-300/80"
                          : "border-border"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                          {j.date}
                        </span>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
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

                      <p className="text-xs text-foreground/90 leading-relaxed bg-muted/30 p-3 rounded-xl border border-border/60">
                        {j.activity}
                      </p>

                      {/* Feedback from teacher */}
                      {j.teacher_feedback && (
                        <div
                          className={`p-3 rounded-xl border text-xs space-y-1 ${
                            isRevision
                              ? "bg-red-50 border-red-200 text-red-900 dark:bg-red-950/20 dark:border-red-900 dark:text-red-200"
                              : "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/20 dark:border-blue-900 dark:text-blue-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold flex items-center gap-1.5 text-[11px]">
                              <MessageSquare className="h-3.5 w-3.5" />
                              Catatan dari Guru Pembimbing:
                            </span>

                            {isRevision && (
                              <Button
                                size="sm"
                                onClick={() => setEditingJurnal(j)}
                                className="h-7 text-xs font-bold rounded-lg bg-red-600 hover:bg-red-700 text-white gap-1"
                              >
                                <Edit3 className="h-3 w-3" />
                                <span>Perbaiki Jurnal</span>
                              </Button>
                            )}
                          </div>
                          <p className="text-[11px] leading-relaxed italic pl-5">
                            &ldquo;{j.teacher_feedback}&rdquo;
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Jurnal Modal */}
      <EditJurnalModal
        isOpen={!!editingJurnal}
        onClose={() => setEditingJurnal(null)}
        onSuccess={loadData}
        jurnal={editingJurnal}
      />
    </div>
  );
}
