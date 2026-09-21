"use client";

import * as React from "react";
import {
  BookOpen,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  MessageSquare,
  Image as ImageIcon,
  X,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  getActiveGuru,
  getJurnalList,
  getAbsensiList,
} from "@/lib/supabase/services";
import { Guru, Jurnal, Absensi } from "@/types/database";
import { ValidasiJurnalModal } from "@/components/guru/revisi-jurnal-modal";
import { ValidasiAbsensiModal } from "@/components/guru/validasi-absensi-modal";

export default function GuruJurnalPage() {
  const [guru, setGuru] = React.useState<Guru>(() => getActiveGuru());
  const [activeTab, setActiveTab] = React.useState<"jurnal" | "absensi">("jurnal");
  const [jurnals, setJurnals] = React.useState<Jurnal[]>([]);
  const [absensis, setAbsensis] = React.useState<Absensi[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Search input
  const [searchJurnal, setSearchJurnal] = React.useState("");
  const [searchAbsensi, setSearchAbsensi] = React.useState("");

  // Modals state
  const [validasiJurnal, setValidasiJurnal] = React.useState<Jurnal | null>(null);
  const [validasiAbsensi, setValidasiAbsensi] = React.useState<Absensi | null>(null);
  const [previewPhoto, setPreviewPhoto] = React.useState<{
    url: string;
    title: string;
  } | null>(null);

  const loadData = React.useCallback(async () => {
    const currentGuru = getActiveGuru();
    setGuru(currentGuru);
    if (!currentGuru || !currentGuru.id) {
      setLoading(false);
      return;
    }

    try {
      const [jList, aList] = await Promise.all([
        getJurnalList({ teacherId: currentGuru.id }),
        getAbsensiList({ teacherId: currentGuru.id }),
      ]);
      setJurnals(jList);
      setAbsensis(aList);
    } catch (e) {
      console.error("Failed to load jurnal/absensi data:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();

    const handleAuthChange = () => loadData();
    const handleJurnalUpdate = () => loadData();
    const handleAbsensiUpdate = () => loadData();
    const handlePenempatanUpdate = () => loadData();

    if (typeof window !== "undefined") {
      window.addEventListener("simmas_auth_changed", handleAuthChange);
      window.addEventListener("simmas_jurnal_updated", handleJurnalUpdate);
      window.addEventListener("simmas_absensi_updated", handleAbsensiUpdate);
      window.addEventListener("simmas_penempatan_updated", handlePenempatanUpdate);
      return () => {
        window.removeEventListener("simmas_auth_changed", handleAuthChange);
        window.removeEventListener("simmas_jurnal_updated", handleJurnalUpdate);
        window.removeEventListener("simmas_absensi_updated", handleAbsensiUpdate);
        window.removeEventListener("simmas_penempatan_updated", handlePenempatanUpdate);
      };
    }
  }, [loadData]);

  // Helper date formatter: "20 Sep 2026"
  const formatDateDisplay = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Filtered lists
  const filteredJurnals = React.useMemo(() => {
    const q = searchJurnal.toLowerCase().trim();
    if (!q) return jurnals;
    return jurnals.filter(
      (j) =>
        (j.student?.name || "").toLowerCase().includes(q) ||
        (j.activity || "").toLowerCase().includes(q)
    );
  }, [jurnals, searchJurnal]);

  const filteredAbsensis = React.useMemo(() => {
    const q = searchAbsensi.toLowerCase().trim();
    if (!q) return absensis;
    return absensis.filter(
      (a) =>
        (a.student?.name || "").toLowerCase().includes(q) ||
        (a.status || "").toLowerCase().includes(q)
    );
  }, [absensis, searchAbsensi]);

  // Jurnal counts
  const jurnalPendingCount = jurnals.filter((j) => j.status === "Pending").length;
  const jurnalApprovedCount = jurnals.filter((j) => j.status === "Disetujui").length;
  const jurnalRevisionCount = jurnals.filter((j) => j.status === "Perlu Revisi").length;

  // Absensi counts
  const absensiPendingCount = absensis.filter(
    (a) =>
      a.validation_status === "Menunggu" ||
      ((a.status === "Sakit" || a.status === "Izin") && !a.validation_status)
  ).length;
  const absensiApprovedCount = absensis.filter(
    (a) =>
      a.validation_status === "Disetujui" ||
      (a.status === "Hadir" && !a.validation_status)
  ).length;
  const absensiRevisionCount = absensis.filter(
    (a) =>
      a.validation_status === "Perlu Revisi" ||
      a.validation_status === "Ditolak" ||
      (a.status === "Alfa" && !a.validation_status)
  ).length;

  return (
    <div className="space-y-6 w-full pb-10">
      {/* Title Header (persis gambar: Icon Buku Biru Outline + Validasi Jurnal & Absensi) */}
      <div className="flex items-center gap-3">
        <div className="text-blue-600">
          <BookOpen className="h-6 w-6 stroke-[2.2]" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Validasi Jurnal & Absensi
        </h1>
      </div>

      {/* 3 Stat Cards (Dinamis sesuai Tab aktif) */}
      {activeTab === "jurnal" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Menunggu Validasi */}
          <div className="p-5 rounded-2xl border border-border bg-card shadow-2xs flex flex-col justify-between h-32">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                MENUNGGU VALIDASI
              </span>
              <div className="h-7 w-7 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-foreground leading-none">
                {jurnalPendingCount}
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">
                Butuh review segera
              </p>
            </div>
          </div>

          {/* Card 2: Jurnal Disetujui */}
          <div className="p-5 rounded-2xl border border-border bg-card shadow-2xs flex flex-col justify-between h-32">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                JURNAL DISETUJUI
              </span>
              <div className="h-7 w-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-foreground leading-none">
                {jurnalApprovedCount}
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">
                Bulan ini
              </p>
            </div>
          </div>

          {/* Card 3: Perlu Revisi */}
          <div className="p-5 rounded-2xl border border-border bg-card shadow-2xs flex flex-col justify-between h-32">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                PERLU REVISI
              </span>
              <div className="h-7 w-7 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 flex items-center justify-center">
                <AlertCircle className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-foreground leading-none">
                {jurnalRevisionCount}
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">
                Menunggu perbaikan siswa
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Menunggu Validasi Absensi */}
          <div className="p-5 rounded-2xl border border-border bg-card shadow-2xs flex flex-col justify-between h-32">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                MENUNGGU VALIDASI
              </span>
              <div className="h-7 w-7 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-foreground leading-none">
                {absensiPendingCount}
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">
                Sakit / Izin belum ditinjau
              </p>
            </div>
          </div>

          {/* Card 2: Absensi Disetujui */}
          <div className="p-5 rounded-2xl border border-border bg-card shadow-2xs flex flex-col justify-between h-32">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                ABSENSI DISETUJUI
              </span>
              <div className="h-7 w-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-foreground leading-none">
                {absensiApprovedCount}
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">
                Bulan ini
              </p>
            </div>
          </div>

          {/* Card 3: Perlu Revisi */}
          <div className="p-5 rounded-2xl border border-border bg-card shadow-2xs flex flex-col justify-between h-32">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                PERLU REVISI
              </span>
              <div className="h-7 w-7 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center">
                <AlertCircle className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-foreground leading-none">
                {absensiRevisionCount}
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">
                Menunggu revisi foto siswa
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Switcher Pills: [ Jurnal ] [ Absensi ] */}
      <div className="inline-flex items-center p-1 bg-muted/60 rounded-xl border border-border/60">
        <button
          onClick={() => setActiveTab("jurnal")}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === "jurnal"
              ? "bg-card text-foreground shadow-2xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Jurnal
        </button>
        <button
          onClick={() => setActiveTab("absensi")}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === "absensi"
              ? "bg-card text-foreground shadow-2xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Absensi
        </button>
      </div>

      {/* TAB CONTENT: JURNAL */}
      {activeTab === "jurnal" && (
        <div className="space-y-4">
          {/* Search Bar: Cari nama siswa atau kegiatan... */}
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Cari nama siswa atau kegiatan..."
              value={searchJurnal}
              onChange={(e) => setSearchJurnal(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl bg-card border-border/80"
            />
          </div>

          {/* Table Jurnal */}
          <div className="rounded-2xl border border-border bg-card shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="border-b border-border bg-muted/20 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-3.5 w-[22%]">TANGGAL & SISWA</th>
                    <th className="px-5 py-3.5 w-[44%]">KEGIATAN</th>
                    <th className="px-5 py-3.5 text-center w-[14%]">FOTO</th>
                    <th className="px-5 py-3.5 text-center w-[12%]">STATUS</th>
                    <th className="px-5 py-3.5 text-right w-[8%]">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-muted-foreground text-xs">
                        Memuat data jurnal...
                      </td>
                    </tr>
                  ) : filteredJurnals.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-muted-foreground text-xs">
                        Belum ada laporan jurnal yang sesuai.
                      </td>
                    </tr>
                  ) : (
                    filteredJurnals.map((j) => {
                      const isApproved = j.status === "Disetujui";
                      const isPending = j.status === "Pending";
                      const isRevision = j.status === "Perlu Revisi";

                      return (
                        <tr key={j.id} className="hover:bg-muted/20 transition-colors">
                          {/* 1. TANGGAL & SISWA */}
                          <td className="px-5 py-4 align-top">
                            <p className="font-semibold text-foreground text-xs">
                              {formatDateDisplay(j.date)}
                            </p>
                            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                              {j.student?.name || "Siswa"}
                            </p>
                          </td>

                          {/* 2. KEGIATAN */}
                          <td className="px-5 py-4 align-top">
                            <p className="text-xs text-foreground leading-relaxed">
                              {j.activity}
                            </p>

                            {/* Catatan Evaluasi Guru oranye jika ada */}
                            {j.teacher_feedback && (
                              <div className="flex items-start gap-1 text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-medium">
                                <MessageSquare className="h-3 w-3 shrink-0 mt-0.5" />
                                <span>Catatan: {j.teacher_feedback}</span>
                              </div>
                            )}
                          </td>

                          {/* 3. FOTO */}
                          <td className="px-5 py-4 align-middle text-center">
                            {j.photo_url ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewPhoto({
                                    url: j.photo_url!,
                                    title: `Foto Jurnal - ${j.student?.name} (${formatDateDisplay(j.date)})`,
                                  })
                                }
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-blue-600 border border-blue-200 bg-blue-50/50 hover:bg-blue-100/70 transition-colors"
                              >
                                <ImageIcon className="h-3 w-3" />
                                <span>Foto</span>
                              </button>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>

                          {/* 4. STATUS */}
                          <td className="px-5 py-4 align-middle text-center">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                                isApproved
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/30"
                                  : isRevision
                                  ? "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/30"
                                  : "bg-muted text-muted-foreground border-border"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  isApproved
                                    ? "bg-emerald-600"
                                    : isRevision
                                    ? "bg-amber-600"
                                    : "bg-muted-foreground"
                                }`}
                              />
                              {isApproved
                                ? "Disetujui"
                                : isRevision
                                ? "Perlu Revisi"
                                : "Pending"}
                            </span>
                          </td>

                          {/* 5. AKSI */}
                          <td className="px-5 py-4 align-middle text-right">
                            <button
                              type="button"
                              onClick={() => setValidasiJurnal(j)}
                              className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                            >
                              {isPending ? "Validasi" : "Ubah Validasi"}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ABSENSI */}
      {activeTab === "absensi" && (
        <div className="space-y-4">
          {/* Search Bar: Cari nama siswa... */}
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Cari nama siswa..."
              value={searchAbsensi}
              onChange={(e) => setSearchAbsensi(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl bg-card border-border/80"
            />
          </div>

          {/* Table Absensi */}
          <div className="rounded-2xl border border-border bg-card shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="border-b border-border bg-muted/20 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-3.5 w-[26%]">TANGGAL & SISWA</th>
                    <th className="px-5 py-3.5 w-[20%]">KEHADIRAN</th>
                    <th className="px-5 py-3.5 text-center w-[24%]">FOTO</th>
                    <th className="px-5 py-3.5 text-center w-[18%]">VALIDASI</th>
                    <th className="px-5 py-3.5 text-right w-[12%]">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-muted-foreground text-xs">
                        Memuat data presensi...
                      </td>
                    </tr>
                  ) : filteredAbsensis.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-muted-foreground text-xs">
                        Belum ada catatan presensi yang sesuai.
                      </td>
                    </tr>
                  ) : (
                    filteredAbsensis.map((a) => {
                      const valStatus =
                        a.validation_status ||
                        (a.status === "Sakit" || a.status === "Izin"
                          ? "Menunggu"
                          : a.status === "Alfa"
                          ? "Perlu Revisi"
                          : "Disetujui");

                      const isValApproved = valStatus === "Disetujui";
                      const isValRevision = valStatus === "Perlu Revisi" || valStatus === "Ditolak";
                      const isValPending = valStatus === "Menunggu";

                      return (
                        <tr key={a.id} className="hover:bg-muted/20 transition-colors">
                          {/* 1. TANGGAL & SISWA */}
                          <td className="px-5 py-4 align-top">
                            <p className="font-semibold text-foreground text-xs">
                              {formatDateDisplay(a.date)}
                            </p>
                            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                              {a.student?.name || "Siswa"}
                            </p>
                          </td>

                          {/* 2. KEHADIRAN */}
                          <td className="px-5 py-4 align-middle">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                                a.status === "Hadir"
                                   ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/30"
                                  : a.status === "Sakit"
                                  ? "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/30"
                                  : a.status === "Izin"
                                  ? "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/30"
                                  : "bg-red-50 text-red-700 border-red-300 dark:bg-red-950/30"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  a.status === "Hadir"
                                    ? "bg-emerald-600"
                                    : a.status === "Sakit"
                                    ? "bg-blue-600"
                                    : a.status === "Izin"
                                    ? "bg-amber-600"
                                    : "bg-red-600"
                                }`}
                              />
                              {a.status}
                            </span>
                          </td>

                          {/* 3. FOTO: [ Masuk ] [ Pulang ] */}
                          <td className="px-5 py-4 align-middle text-center">
                            <div className="inline-flex items-center gap-2">
                              {a.check_in_photo ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPreviewPhoto({
                                      url: a.check_in_photo!,
                                      title: `Foto Presensi Masuk - ${a.student?.name} (${formatDateDisplay(a.date)})`,
                                    })
                                  }
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-blue-600 border border-blue-200 bg-blue-50/50 hover:bg-blue-100/70 transition-colors"
                                >
                                  <ImageIcon className="h-3 w-3" />
                                  <span>Masuk</span>
                                </button>
                              ) : null}

                              {a.check_out_photo ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPreviewPhoto({
                                      url: a.check_out_photo!,
                                      title: `Foto Presensi Pulang - ${a.student?.name} (${formatDateDisplay(a.date)})`,
                                    })
                                  }
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-blue-600 border border-blue-200 bg-blue-50/50 hover:bg-blue-100/70 transition-colors"
                                >
                                  <ImageIcon className="h-3 w-3" />
                                  <span>Pulang</span>
                                </button>
                              ) : null}

                              {!a.check_in_photo && !a.check_out_photo && (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </div>
                          </td>

                          {/* 4. VALIDASI */}
                          <td className="px-5 py-4 align-middle text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                                  isValApproved
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/30"
                                    : isValRevision
                                    ? "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/30"
                                    : "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/30"
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    isValApproved
                                      ? "bg-emerald-600"
                                      : isValRevision
                                      ? "bg-amber-600"
                                      : "bg-blue-600"
                                  }`}
                                />
                                {valStatus === "Ditolak" ? "Perlu Revisi" : valStatus}
                              </span>
                              {a.validation_notes && isValRevision && (
                                <span
                                  className="text-[10px] text-amber-600 dark:text-amber-400 font-medium max-w-[160px] truncate"
                                  title={a.validation_notes}
                                >
                                  Catatan: {a.validation_notes}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 5. AKSI */}
                          <td className="px-5 py-4 align-middle text-right">
                            <button
                              type="button"
                              onClick={() => setValidasiAbsensi(a)}
                              className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                            >
                              {isValPending ? "Validasi" : "Ubah Validasi"}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Validasi Jurnal */}
      <ValidasiJurnalModal
        isOpen={!!validasiJurnal}
        onClose={() => setValidasiJurnal(null)}
        onSuccess={loadData}
        jurnal={validasiJurnal}
      />

      {/* Modal Validasi Absensi */}
      <ValidasiAbsensiModal
        isOpen={!!validasiAbsensi}
        onClose={() => setValidasiAbsensi(null)}
        onSuccess={loadData}
        absensi={validasiAbsensi}
      />

      {/* Modal Preview Foto */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setPreviewPhoto(null)}
        >
          <div
            className="relative max-w-xl max-h-[85vh] bg-card rounded-2xl overflow-hidden shadow-2xl border border-border animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-blue-600" />
                <span>{previewPhoto.title}</span>
              </h4>
              <button
                onClick={() => setPreviewPhoto(null)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-black/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewPhoto.url}
                alt={previewPhoto.title}
                className="max-h-[70vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
