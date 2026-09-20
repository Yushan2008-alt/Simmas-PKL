"use client";

import * as React from "react";
import {
  Users,
  Search,
  Building2,
  Calendar,
  Eye,
  CheckCircle2,
  Clock,
  Filter,
  ArrowUpDown,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getActiveGuru,
  getSupervisedStudentsSummary,
  SupervisedStudentSummary,
} from "@/lib/supabase/services";
import { DetailSiswaModal } from "@/components/guru/detail-siswa-modal";

export default function GuruSiswaPage() {
  const guru = getActiveGuru();
  const [summaries, setSummaries] = React.useState<SupervisedStudentSummary[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [selectedDudi, setSelectedDudi] = React.useState("ALL");
  const [selectedClass, setSelectedClass] = React.useState("ALL");
  const [selectedSummary, setSelectedSummary] =
    React.useState<SupervisedStudentSummary | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      const data = await getSupervisedStudentsSummary(guru.id);
      setSummaries(data);
    } catch (e) {
      console.error("Failed to load supervised students:", e);
    } finally {
      setLoading(false);
    }
  }, [guru.id]);

  React.useEffect(() => {
    loadData();

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

  // Filters
  const uniqueDudis = Array.from(new Set(summaries.map((s) => s.dudi.id))).map(
    (id) => summaries.find((s) => s.dudi.id === id)!.dudi
  );
  const uniqueClasses = Array.from(
    new Set(summaries.map((s) => s.student.class_name))
  );

  const filtered = summaries.filter((s) => {
    const matchSearch =
      s.student.name.toLowerCase().includes(search.toLowerCase()) ||
      s.student.nis.toLowerCase().includes(search.toLowerCase()) ||
      s.dudi.name.toLowerCase().includes(search.toLowerCase());

    const matchDudi = selectedDudi === "ALL" || s.dudi.id === selectedDudi;
    const matchClass = selectedClass === "ALL" || s.student.class_name === selectedClass;

    return matchSearch && matchDudi && matchClass;
  });

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/10 text-blue-600">
              Manajemen Bimbingan
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Siswa Bimbingan
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Daftar seluruh siswa magang di bawah bimbingan Anda beserta metrik progresivitasnya.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-card">
          <Users className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold text-foreground">
            {summaries.length} Siswa Total
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari siswa berdasarkan nama, NIS, atau DUDI..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11 rounded-xl bg-card"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-2.5">
          <select
            value={selectedDudi}
            onChange={(e) => setSelectedDudi(e.target.value)}
            className="h-11 px-3.5 rounded-xl border border-border bg-card text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="ALL">Semua DUDI ({uniqueDudis.length})</option>
            {uniqueDudis.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="h-11 px-3.5 rounded-xl border border-border bg-card text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="ALL">Semua Kelas</option>
            {uniqueClasses.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="rounded-2xl border border-border bg-card shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-4">Siswa</th>
                <th className="px-4 py-4">Kelas</th>
                <th className="px-4 py-4">DUDI Penempatan</th>
                <th className="px-4 py-4 text-center">Presensi</th>
                <th className="px-4 py-4 text-center">Jurnal Kegiatan</th>
                <th className="px-4 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    Memuat data siswa bimbingan...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    Tidak ditemukan siswa yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => {
                  return (
                    <tr
                      key={s.student.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      {/* Siswa */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                            {s.student.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-sm leading-tight">
                              {s.student.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              NIS: {s.student.nis}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Kelas */}
                      <td className="px-4 py-4">
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-muted text-foreground border border-border">
                          {s.student.class_name}
                        </span>
                      </td>

                      {/* DUDI */}
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-bold text-foreground flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5 text-primary" />
                            {s.dudi.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            PIC: {s.dudi.pic_name} ({s.dudi.pic_phone})
                          </p>
                        </div>
                      </td>

                      {/* Presensi */}
                      <td className="px-4 py-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              s.attendanceRate >= 90
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : s.attendanceRate >= 80
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                          >
                            {s.attendanceRate}%
                          </span>
                          <span className="text-[10px] text-muted-foreground mt-1">
                            {s.hadirCount} Hadir • {s.sakitCount + s.izinCount + s.alfaCount} Absen
                          </span>
                        </div>
                      </td>

                      {/* Jurnal */}
                      <td className="px-4 py-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="font-bold text-foreground">
                            {s.totalJurnal} Laporan
                          </span>
                          <div className="flex items-center gap-1 mt-0.5">
                            {s.pendingJurnal > 0 ? (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                {s.pendingJurnal} Pending
                              </span>
                            ) : (
                              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                                <CheckCircle2 className="h-2.5 w-2.5" />
                                Valid
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 text-center">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {s.penempatan.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedSummary(s)}
                          className="h-8 text-xs font-bold rounded-xl gap-1.5 text-primary hover:text-primary hover:bg-primary/10 border-primary/30"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Detail Progress</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Siswa Modal */}
      <DetailSiswaModal
        isOpen={!!selectedSummary}
        onClose={() => setSelectedSummary(null)}
        summary={selectedSummary}
      />
    </div>
  );
}
