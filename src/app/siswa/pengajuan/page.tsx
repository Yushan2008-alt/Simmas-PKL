"use client";

import * as React from "react";
import Link from "next/link";
import {
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Briefcase,
  Send,
  PlusCircle,
  FileText,
  X,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getActiveSiswa,
  getDefaultSiswa,
  getActivePengajuan,
  getStudentPlacement,
  getDudiList,
  createPengajuan,
  cancelPengajuan,
  createDudi,
} from "@/lib/supabase/services";
import { Siswa, Dudi, PengajuanMagang, Penempatan } from "@/types/database";

export default function SiswaPengajuanPage() {
  const [siswa, setSiswa] = React.useState<Siswa>(() => getActiveSiswa());
  const [activePengajuan, setActivePengajuan] = React.useState<PengajuanMagang | null>(null);
  const [placement, setPlacement] = React.useState<Penempatan | null>(null);
  const [dudiList, setDudiList] = React.useState<Dudi[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Form states
  const [dudiId, setDudiId] = React.useState("");
  const [position, setPosition] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Custom unlisted DUDI modal
  const [isCustomDudiOpen, setIsCustomDudiOpen] = React.useState(false);
  const [customName, setCustomName] = React.useState("");
  const [customAddress, setCustomAddress] = React.useState("");
  const [customSector, setCustomSector] = React.useState("");
  const [isSavingCustomDudi, setIsSavingCustomDudi] = React.useState(false);

  const loadData = React.useCallback(async () => {
    try {
      const current = getActiveSiswa();
      setSiswa(current);

      const [peng, dList, place] = await Promise.all([
        getActivePengajuan(current.id),
        getDudiList(),
        getStudentPlacement(current.id),
      ]);

      setActivePengajuan(peng);
      setDudiList(dList);
      setPlacement(place);

      if (dList.length > 0 && !dudiId) {
        setDudiId(dList[0].id);
      }
    } catch (e) {
      console.error("Failed to load pengajuan data:", e);
    } finally {
      setLoading(false);
    }
  }, [dudiId]);

  React.useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    if (typeof window !== "undefined") {
      window.addEventListener("simmas_pengajuan_updated", handleUpdate);
      window.addEventListener("simmas_siswa_updated", handleUpdate);
      window.addEventListener("simmas_penempatan_updated", handleUpdate);
      window.addEventListener("simmas_auth_changed", handleUpdate);
      return () => {
        window.removeEventListener("simmas_pengajuan_updated", handleUpdate);
        window.removeEventListener("simmas_siswa_updated", handleUpdate);
        window.removeEventListener("simmas_penempatan_updated", handleUpdate);
        window.removeEventListener("simmas_auth_changed", handleUpdate);
      };
    }
  }, [loadData]);

  const handleCancel = async () => {
    if (!activePengajuan) return;
    if (!confirm("Apakah Anda yakin ingin membatalkan pengajuan magang ini?")) return;

    try {
      await cancelPengajuan(activePengajuan.id);
      toast.success("Pengajuan berhasil dibatalkan", {
        description: "Anda sekarang dapat memilih DUDI dan mengajukan kembali.",
      });
      loadData();
    } catch (e: any) {
      toast.error("Gagal membatalkan pengajuan", {
        description: e?.message || "Terjadi kesalahan.",
      });
    }
  };

  const handleCreateCustomDudi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) {
      toast.error("Nama tempat magang wajib diisi");
      return;
    }

    setIsSavingCustomDudi(true);
    try {
      const created = await createDudi({
        name: customName.trim(),
        address: customAddress.trim() || "Alamat dalam konfirmasi",
        sector: customSector.trim() || "Umum",
        pic_name: "PIC Tempat Magang",
        pic_phone: "-",
        quota: 5,
        status: "Menunggu Validasi",
      });

      setDudiList((prev) => [created, ...prev]);
      setDudiId(created.id);
      setIsCustomDudiOpen(false);
      setCustomName("");
      setCustomAddress("");
      setCustomSector("");

      toast.success("Tempat magang ditambahkan!", {
        description: `${created.name} telah dipilih untuk pengajuan Anda.`,
      });
    } catch (e: any) {
      toast.error("Gagal menambahkan tempat magang", {
        description: e?.message || "Terjadi kesalahan.",
      });
    } finally {
      setIsSavingCustomDudi(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dudiId) {
      toast.error("Pilih tempat magang terlebih dahulu");
      return;
    }

    if (!position.trim()) {
      toast.error("Posisi / bagian magang wajib diisi", {
        description: "Contoh: Web Developer Intern, Mekanik, Staf Administrasi...",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const now = new Date();
      const start = now.toISOString().split("T")[0];
      const endDateObj = new Date(now);
      endDateObj.setMonth(endDateObj.getMonth() + 3);
      const end = endDateObj.toISOString().split("T")[0];

      await createPengajuan({
        student_id: siswa.id,
        dudi_id: dudiId,
        position: position.trim(),
        start_date: start,
        end_date: end,
        notes: "",
      });

      toast.success("Pengajuan Magang Berhasil Dikirim!", {
        description: "Pengajuan Anda telah masuk ke antrean verifikasi pihak sekolah.",
      });

      setPosition("");
      loadData();
    } catch (err: any) {
      toast.error("Gagal mengirim pengajuan", {
        description: err?.message || "Terjadi kesalahan sistem.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Strictly mutually exclusive stages
  const isApproved =
    activePengajuan?.status === "Disetujui" ||
    siswa.status === "Sedang Magang" ||
    siswa.status === "Selesai Magang" ||
    Boolean(placement);
  const isPending = !isApproved && activePengajuan?.status === "Menunggu Verifikasi";
  const isNotSubmitted = !isApproved && !isPending;

  return (
    <div className="space-y-6 w-full">
      {/* 1. TOP STEP INDICATOR BAR DENGAN ANIMASI GARIS FLOW */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Step circles & animated connecting lines */}
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            {/* Step 1: Ajukan */}
            <div className="flex items-center gap-2.5">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center transition-all ${
                  isApproved || isPending
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-blue-600 text-white shadow-xs"
                }`}
              >
                {isApproved || isPending ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
              </div>
              <span
                className={`text-xs font-bold ${
                  isNotSubmitted ? "text-blue-600 dark:text-blue-400" : "text-foreground"
                }`}
              >
                Ajukan
              </span>
            </div>

            {/* Line 1: Ajukan -> Ditinjau (Flow Animated Line) */}
            <div className="w-8 sm:w-16 h-1 rounded-full overflow-hidden bg-muted">
              {isApproved ? (
                <div className="h-full w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 animate-flow-line" />
              ) : isPending ? (
                <div className="h-full w-full bg-gradient-to-r from-blue-500 via-amber-400 to-amber-500 animate-flow-line" />
              ) : (
                <div className="h-full w-full bg-border" />
              )}
            </div>

            {/* Step 2: Ditinjau Sekolah */}
            <div className="flex items-center gap-2.5">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center transition-all ${
                  isApproved
                    ? "bg-emerald-600 text-white shadow-xs"
                    : isPending
                    ? "bg-amber-500 text-white shadow-xs animate-pulse-glow"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isApproved ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Clock className="h-4 w-4" />
                )}
              </div>
              <span
                className={`text-xs font-bold ${
                  isPending
                    ? "text-amber-600 dark:text-amber-400"
                    : isApproved
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                Ditinjau Sekolah
              </span>
            </div>

            {/* Line 2: Ditinjau -> Disetujui (Flow Animated Line) */}
            <div className="w-8 sm:w-16 h-1 rounded-full overflow-hidden bg-muted">
              {isApproved ? (
                <div className="h-full w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 animate-flow-line" />
              ) : (
                <div className="h-full w-full bg-border" />
              )}
            </div>

            {/* Step 3: Disetujui */}
            <div className="flex items-center gap-2.5">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center transition-all ${
                  isApproved
                    ? "bg-emerald-600 text-white shadow-xs animate-pulse-glow"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <span
                className={`text-xs font-bold ${
                  isApproved
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-muted-foreground"
                }`}
              >
                Disetujui
              </span>
            </div>
          </div>

          {/* Right Status Badge */}
          <div className="shrink-0">
            {isApproved ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-border bg-muted/40 text-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Disetujui</span>
              </span>
            ) : isPending ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                <span>Menunggu Verifikasi</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold border border-border text-muted-foreground bg-muted/20">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
                <span>Belum Mengajukan</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. CASE: SUDAH MENGAJUKAN & MENUNGGU VERIFIKASI (HANYA MUNCUL JIKA SEDANG PENDING) */}
      {isPending && (
        <div className="rounded-2xl border border-amber-300 bg-amber-500/5 p-6 sm:p-8 space-y-5 shadow-xs animate-in fade-in-50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
                  MENUNGGU VERIFIKASI SEKOLAH
                </span>
                <h3 className="text-lg font-bold text-foreground mt-1">
                  Pengajuan Aktif Anda Sedang Ditinjau
                </h3>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="rounded-xl text-xs font-bold text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
            >
              <XCircle className="h-3.5 w-3.5 mr-1" />
              <span>Batalkan Pengajuan</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-background border border-border text-xs">
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Mitra DUDI</p>
              <p className="font-bold text-foreground mt-0.5 flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-primary" />
                {activePengajuan?.dudi?.name}
              </p>
              <p className="text-[11px] text-muted-foreground">{activePengajuan?.dudi?.sector}</p>
            </div>

            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Posisi</p>
              <p className="font-bold text-foreground mt-0.5 flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5 text-primary" />
                {activePengajuan?.position}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Rencana Periode</p>
              <p className="font-medium text-foreground mt-0.5 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                {activePengajuan?.start_date} s/d {activePengajuan?.end_date}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Waktu Pengajuan</p>
              <p suppressHydrationWarning className="font-medium text-foreground mt-0.5">
                {activePengajuan?.created_at
                  ? new Date(activePengajuan.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "-"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. CASE: SUDAH DISETUJUI (HANYA MUNCUL JIKA SUDAH DISETUJUI / DITEMPATKAN, WARNA NETRAL MENGIKUTI BACKGROUND) */}
      {isApproved && (
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-2xs animate-in fade-in-50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-muted text-foreground border border-border">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-muted text-foreground border border-border">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  TEMPAT MAGANG DISETUJUI
                </span>
                <h3 className="text-lg font-bold text-foreground mt-1">
                  Selamat! Anda Telah Ditempatkan
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/siswa/absensi">
                <Button className="rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs">
                  Buka Absensi Harian
                </Button>
              </Link>
              <Link href="/siswa/jurnal">
                <Button variant="outline" className="rounded-xl text-xs font-bold border-border bg-card hover:bg-muted">
                  Buka Jurnal Kegiatan
                </Button>
              </Link>
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Pengajuan magang Anda telah diverifikasi oleh sekolah. Anda sekarang aktif melaksanakan kegiatan magang di mitra industri terkait dan dapat mengisi absensi harian serta jurnal kegiatan.
          </p>

          {/* Tabel Informasi Netral Mengikuti Background */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-muted/30 border border-border text-xs">
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Mitra DUDI</p>
              <p className="font-bold text-foreground mt-0.5 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-primary" />
                {placement?.dudi?.name || activePengajuan?.dudi?.name || "Mitra Industri"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {placement?.dudi?.address || activePengajuan?.dudi?.address || placement?.dudi?.sector || activePengajuan?.dudi?.sector || "-"}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Posisi / Bagian</p>
              <p className="font-bold text-foreground mt-0.5 flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-primary" />
                {activePengajuan?.position || "Praktikan Magang"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {placement?.dudi?.sector || "Divisi Operasional"}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Guru Pembimbing</p>
              <p className="font-bold text-foreground mt-0.5 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-primary" />
                {placement?.teacher?.name || "Guru Pembimbing Sekolah"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {placement?.teacher?.phone || "-"}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Periode Magang</p>
              <p className="font-medium text-foreground mt-0.5 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                {placement?.start_date || activePengajuan?.start_date || "Agustus 2026"} s/d {placement?.end_date || activePengajuan?.end_date || "November 2026"}
              </p>
              <div className="mt-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-background border border-border text-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Aktif Berlangsung
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. CASE: FORM PENGAJUAN (HANYA MUNCUL JIKA BELUM MENGAJUKAN) */}
      {isNotSubmitted && (
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-2xs space-y-8">
          {/* Section 1: Pilih Tempat Magang */}
          <div className="space-y-4">
            <h3 className="text-sm sm:text-base font-bold text-foreground">
              1. Pilih Tempat Magang
            </h3>

            {/* Grid of DUDI cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {dudiList.map((d) => {
                const isSelected = dudiId === d.id;
                return (
                  <div
                    key={d.id}
                    onClick={() => setDudiId(d.id)}
                    className={`rounded-2xl border p-4 transition-all cursor-pointer flex items-center gap-3.5 ${
                      isSelected
                        ? "border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/10 shadow-xs"
                        : "border-border bg-card hover:border-muted-foreground/30 hover:bg-muted/10"
                    }`}
                  >
                    <div
                      className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs sm:text-sm text-foreground truncate">
                        {d.name}
                      </h4>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {d.address || d.sector}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Unlisted DUDI card */}
              <div
                onClick={() => setIsCustomDudiOpen(true)}
                className="rounded-2xl border-2 border-dashed border-border/80 hover:border-blue-500 hover:bg-blue-50/10 p-4 flex items-center justify-center gap-2 cursor-pointer transition-all min-h-[76px] group"
              >
                <PlusCircle className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 transition-colors" />
                <span className="text-xs font-semibold text-muted-foreground group-hover:text-blue-600 transition-colors">
                  Tempat magang belum terdaftar
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-border/60" />

          {/* Section 2: Posisi / Bagian */}
          <div className="space-y-4">
            <h3 className="text-sm sm:text-base font-bold text-foreground">
              2. Posisi / Bagian
            </h3>

            <div className="space-y-1.5">
              <Input
                placeholder="Cth: Web Developer Intern, Mekanik, Staf Administrasi..."
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="h-11 rounded-xl bg-muted/20 border-border text-xs sm:text-sm text-foreground focus:bg-background transition-all"
              />
              <p className="text-xs text-muted-foreground">
                Sebutkan divisi atau posisi yang akan Anda tempati selama magang.
              </p>
            </div>

            <div className="pt-2">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="rounded-xl px-6 h-10 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
              >
                <span>{isSubmitting ? "Mengirim..." : "Kirim Pengajuan"}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: TEMPAT MAGANG BELUM TERDAFTAR */}
      {isCustomDudiOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-0">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Tempat Magang Belum Terdaftar
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Tambahkan mitra tempat magang baru Anda
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCustomDudiOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomDudi} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">
                  Nama Perusahaan / Tempat Magang <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  placeholder="Contoh: PT. Inovasi Cipta Mandiri"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="h-10 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">
                  Alamat / Kota Tempat Magang
                </label>
                <Input
                  placeholder="Contoh: Jl. Diponegoro No. 12, Sidoarjo"
                  value={customAddress}
                  onChange={(e) => setCustomAddress(e.target.value)}
                  className="h-10 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">
                  Bidang Usaha / Sektor
                </label>
                <Input
                  placeholder="Contoh: Rekayasa Perangkat Lunak, Otomotif, Perhotelan..."
                  value={customSector}
                  onChange={(e) => setCustomSector(e.target.value)}
                  className="h-10 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCustomDudiOpen(false)}
                  className="rounded-xl h-10 text-xs font-semibold"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSavingCustomDudi}
                  className="rounded-xl h-10 px-5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSavingCustomDudi ? "Menyimpan..." : "Simpan & Pilih Tempat Ini"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
