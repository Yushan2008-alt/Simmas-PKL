"use client";

import * as React from "react";
import {
  Activity,
  Search,
  Users,
  CheckCircle2,
  AlertTriangle,
  Building2,
  GraduationCap,
  FileText,
  Clock,
  Eye,
  X,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  getSiswaList,
  getPenempatanList,
  getAbsensiList,
  getJurnalList,
} from "@/lib/supabase/services";
import { Siswa, Penempatan, Absensi, Jurnal } from "@/types/database";
import { useRealtimeTable } from "@/hooks/use-realtime";

export default function MonitoringGlobalPage() {
  const [siswa, setSiswa] = React.useState<Siswa[]>([]);
  const [penempatan, setPenempatan] = React.useState<Penempatan[]>([]);
  const [absensi, setAbsensi] = React.useState<Absensi[]>([]);
  const [jurnal, setJurnal] = React.useState<Jurnal[]>([]);
  const [search, setSearch] = React.useState("");
  const [filterKelas, setFilterKelas] = React.useState("Semua");
  const [selectedStudent, setSelectedStudent] = React.useState<{
    student: Siswa;
    placement?: Penempatan;
    hadir: number;
    sakit: number;
    izin: number;
    alfa: number;
    totalJurnal: number;
    statusPresensi: "Hadir" | "Sakit" | "Izin" | "Bermasalah";
    lastAttendanceDate?: string;
  } | null>(null);

  const loadData = React.useCallback(async () => {
    const [sData, pData, aData, jData] = await Promise.all([
      getSiswaList(),
      getPenempatanList(),
      getAbsensiList(),
      getJurnalList(),
    ]);
    setSiswa(sData);
    setPenempatan(pData);
    setAbsensi(aData);
    setJurnal(jData);
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  useRealtimeTable("siswa", loadData);
  useRealtimeTable("penempatan", loadData);
  useRealtimeTable("absensi", loadData);
  useRealtimeTable("jurnal", loadData);

  const activeSiswa = siswa.filter((s) => s.status === "Sedang Magang");

  // Get distinct classes for filter dropdown
  const classOptions = React.useMemo(() => {
    const set = new Set<string>();
    siswa.forEach((s) => {
      if (s.class_name) set.add(s.class_name);
    });
    return Array.from(set).sort();
  }, [siswa]);

  // Today's date string YYYY-MM-DD
  const todayStr = React.useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  // Compute student stats
  const studentsWithStats = React.useMemo(() => {
    return activeSiswa.map((s) => {
      const p = penempatan.find((item) => item.student_id === s.id);
      const studentAbsensi = absensi.filter((a) => a.student_id === s.id);
      const studentJurnals = jurnal.filter((j) => j.student_id === s.id);

      const hadir = studentAbsensi.filter((a) => a.status === "Hadir").length;
      const sakit = studentAbsensi.filter((a) => a.status === "Sakit").length;
      const izin = studentAbsensi.filter((a) => a.status === "Izin").length;
      let alfa = studentAbsensi.filter((a) => a.status === "Alfa").length;

      // Find attendance for today
      const todayRecord = studentAbsensi.find((a) => a.date === todayStr);

      // Determine real-time status:
      // If student has attendance today: use its status.
      // If absent today (last attendance yesterday or older): considered Alfa/Bermasalah!
      let statusPresensi: "Hadir" | "Sakit" | "Izin" | "Bermasalah" = "Bermasalah";

      if (todayRecord) {
        if (todayRecord.status === "Hadir") statusPresensi = "Hadir";
        else if (todayRecord.status === "Sakit") statusPresensi = "Sakit";
        else if (todayRecord.status === "Izin") statusPresensi = "Izin";
        else statusPresensi = "Bermasalah";
      } else {
        // No attendance recorded today -> flagged as Bermasalah (Alfa)
        statusPresensi = "Bermasalah";
        alfa += 1;
      }

      // Sort absensi to find last recorded date
      const sortedAbsensi = [...studentAbsensi].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      const lastAttendanceDate = sortedAbsensi[0]?.date;

      return {
        student: s,
        placement: p,
        hadir,
        sakit,
        izin,
        alfa,
        totalJurnal: studentJurnals.length,
        statusPresensi,
        lastAttendanceDate,
      };
    });
  }, [activeSiswa, penempatan, absensi, jurnal, todayStr]);

  const filtered = studentsWithStats.filter(({ student: s }) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.nis.toLowerCase().includes(search.toLowerCase());
    const matchKelas = filterKelas === "Semua" || s.class_name === filterKelas;
    return matchSearch && matchKelas;
  });

  const bermasalahCount = studentsWithStats.filter(
    (s) => s.statusPresensi === "Bermasalah"
  ).length;
  const totalHadir = studentsWithStats.reduce((acc, curr) => acc + curr.hadir, 0);
  const totalRecorded = studentsWithStats.reduce(
    (acc, curr) => acc + curr.hadir + curr.sakit + curr.izin + curr.alfa,
    0
  );
  const attendanceRate =
    totalRecorded > 0 ? Math.round((totalHadir / totalRecorded) * 100) : 0;
  const totalJurnal = studentsWithStats.reduce((acc, curr) => acc + curr.totalJurnal, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
          Monitoring Global Siswa Magang
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Pemantauan terpadu presensi real-time dan rekap jurnal harian siswa di seluruh mitra industri.
        </p>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border shadow-xs">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
            Siswa Aktif Magang
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {activeSiswa.length}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Dari total {siswa.length} siswa
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border shadow-xs">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
            Rata-rata Presensi
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {activeSiswa.length > 0 ? `${attendanceRate}%` : "0%"}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Rekap kehadiran kumulatif
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border shadow-xs">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
            Jurnal Terkumpul
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {totalJurnal}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Total jurnal seluruh siswa
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border shadow-xs">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
            Perlu Perhatian (Bermasalah)
          </p>
          <p
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              bermasalahCount > 0 ? "text-amber-600" : "text-emerald-600"
            }`}
          >
            {bermasalahCount}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Belum presensi / Alfa hari ini
          </p>
        </div>
      </div>

      {/* Filters: Shortened search input directly beside the class filter */}
      <div className="flex flex-wrap items-center gap-3 bg-card p-4 rounded-2xl border border-border">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari siswa magang..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 bg-muted/20 text-xs sm:text-sm w-full"
          />
        </div>
        <div className="w-full sm:w-auto">
          <select
            value={filterKelas}
            onChange={(e) => setFilterKelas(e.target.value)}
            className="h-10 px-3 rounded-lg border border-border bg-background text-xs font-semibold text-foreground outline-none w-full sm:w-auto"
          >
            <option value="Semua">Semua Kelas</option>
            {classOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground">
              <tr>
                <th className="px-5 py-3.5">Nama Siswa</th>
                <th className="px-5 py-3.5">Lokasi DUDI &amp; Pembimbing</th>
                <th className="px-5 py-3.5 text-center">Hadir (H)</th>
                <th className="px-5 py-3.5 text-center">Sakit (S)</th>
                <th className="px-5 py-3.5 text-center">Izin (I)</th>
                <th className="px-5 py-3.5 text-center">Alfa (A)</th>
                <th className="px-5 py-3.5 text-center">Status Hari Ini</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    <Activity className="h-9 w-9 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="font-semibold text-sm">Tidak ada data siswa magang aktif</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Siswa akan muncul di sini setelah ditempatkan di industri.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const { student: s, placement: p, hadir, sakit, izin, alfa, statusPresensi } = item;
                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-muted/20 transition-colors cursor-pointer"
                      onClick={() => setSelectedStudent(item)}
                    >
                      <td className="px-5 py-4">
                        <p className="font-bold text-foreground text-xs">{s.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {s.class_name} • NIS: {s.nis}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-foreground flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span>{p?.dudi?.name || "Belum ditentukan"}</span>
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Pembimbing: {p?.teacher?.name || "-"}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-center font-bold text-emerald-600">
                        {hadir}
                      </td>
                      <td className="px-5 py-4 text-center font-semibold text-foreground">
                        {sakit}
                      </td>
                      <td className="px-5 py-4 text-center font-semibold text-foreground">
                        {izin}
                      </td>
                      <td
                        className={`px-5 py-4 text-center font-bold ${
                          alfa > 0 ? "text-amber-600 font-extrabold" : "text-slate-400"
                        }`}
                      >
                        {alfa}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            statusPresensi === "Hadir"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : statusPresensi === "Sakit"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : statusPresensi === "Izin"
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {statusPresensi === "Bermasalah" ? "Bermasalah (Alfa)" : statusPresensi}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStudent(item);
                          }}
                          className="h-8 gap-1.5 text-xs text-primary font-semibold hover:bg-primary/10"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Detail</span>
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

      {/* MODAL DETAIL SISWA MAGANG */}
      {selectedStudent && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-background shadow-2xl p-6 animate-in fade-in zoom-in-95 space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-extrabold text-sm border border-blue-200 shrink-0">
                  {selectedStudent.student.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {selectedStudent.student.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    NIS: {selectedStudent.student.nis} • Kelas: {selectedStudent.student.class_name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Profile Grid Info */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-muted/20 border border-border/80 text-xs">
              <div>
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">
                  Tempat Magang (PT)
                </span>
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{selectedStudent.placement?.dudi?.name || "Belum ditentukan"}</span>
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">
                  Guru Pembimbing
                </span>
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                  <span>{selectedStudent.placement?.teacher?.name || "-"}</span>
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">
                  Total Jurnal Dibuat
                </span>
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>{selectedStudent.totalJurnal} Laporan Jurnal</span>
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">
                  Status Presensi Hari Ini
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedStudent.statusPresensi === "Hadir"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {selectedStudent.statusPresensi === "Bermasalah"
                    ? "Bermasalah (Alfa)"
                    : selectedStudent.statusPresensi}
                </span>
              </div>
            </div>

            {/* Statistik Kehadiran 4 Cards */}
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Statistik Kehadiran Siswa
              </p>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <p className="text-xl font-extrabold text-emerald-700">
                    {selectedStudent.hadir}
                  </p>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase">Hadir (H)</p>
                </div>

                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                  <p className="text-xl font-extrabold text-blue-700">
                    {selectedStudent.sakit}
                  </p>
                  <p className="text-[10px] font-bold text-blue-600 uppercase">Sakit (S)</p>
                </div>

                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200">
                  <p className="text-xl font-extrabold text-indigo-700">
                    {selectedStudent.izin}
                  </p>
                  <p className="text-[10px] font-bold text-indigo-600 uppercase">Izin (I)</p>
                </div>

                <div
                  className={`p-3 rounded-xl border ${
                    selectedStudent.alfa > 0
                      ? "bg-red-50 border-red-200"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <p
                    className={`text-xl font-extrabold ${
                      selectedStudent.alfa > 0 ? "text-red-700" : "text-slate-500"
                    }`}
                  >
                    {selectedStudent.alfa}
                  </p>
                  <p
                    className={`text-[10px] font-bold uppercase ${
                      selectedStudent.alfa > 0 ? "text-red-600" : "text-slate-400"
                    }`}
                  >
                    Alfa (A)
                  </p>
                </div>
              </div>
            </div>

            {/* Warning Alert Box for Troubled/Alfa Student */}
            {selectedStudent.statusPresensi === "Bermasalah" || selectedStudent.alfa > 0 ? (
              <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs text-amber-800">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>Peringatan Evaluasi &amp; Tindak Lanjut Siswa</span>
                </div>
                <p className="text-xs text-amber-700/90 leading-relaxed">
                  Siswa ini terindikasi <strong>Alfa / Bermasalah</strong> karena belum melakukan presensi hari ini{" "}
                  {selectedStudent.lastAttendanceDate
                    ? `(terakhir tercatat pada tanggal ${selectedStudent.lastAttendanceDate})`
                    : "(belum pernah tercatat presensi)"}.
                </p>
                <div className="pt-1 text-[11px] text-amber-800 font-semibold">
                  Tindakan yang disarankan:
                  <ul className="list-disc list-inside mt-0.5 space-y-0.5 font-normal text-amber-700">
                    <li>
                      Hubungi Guru Pembimbing (
                      <strong>{selectedStudent.placement?.teacher?.name || "Guru"}</strong>) untuk konfirmasi.
                    </li>
                    <li>
                      Koordinasikan dengan PIC mitra industri (
                      <strong>{selectedStudent.placement?.dudi?.name || "Industri"}</strong>) mengenai kehadiran siswa di lapangan.
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Status kehadiran siswa dalam kondisi tertib dan aktif.</span>
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-end pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedStudent(null)}
                className="font-semibold"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
