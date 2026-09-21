"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Image as ImageIcon,
  BookOpen,
  ShieldAlert,
  ArrowRight,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getActiveSiswa,
  getJurnalList,
  getStudentPlacement,
  deleteJurnalSiswa,
} from "@/lib/supabase/services";
import { Siswa, Jurnal, Penempatan } from "@/types/database";
import { TulisJurnalModal } from "@/components/siswa/tulis-jurnal-modal";
import { EditJurnalModal } from "@/components/siswa/edit-jurnal-modal";
import { DetailJurnalModal } from "@/components/siswa/detail-jurnal-modal";

export default function SiswaJurnalPage() {
  const [siswa, setSiswa] = React.useState<Siswa>(() => getActiveSiswa());
  const [placement, setPlacement] = React.useState<Penempatan | null>(null);
  const [jurnals, setJurnals] = React.useState<Jurnal[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");

  // Modals state
  const [isTulisOpen, setIsTulisOpen] = React.useState(false);
  const [editingJurnal, setEditingJurnal] = React.useState<Jurnal | null>(null);
  const [detailJurnal, setDetailJurnal] = React.useState<Jurnal | null>(null);
  const [previewPhoto, setPreviewPhoto] = React.useState<string | null>(null);

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

  const handleDelete = async (jurnal: Jurnal) => {
    if (jurnal.status === "Perlu Revisi") {
      toast.error("Jurnal berstatus 'Revisi' tidak dapat dihapus, hanya dapat diedit.");
      return;
    }
    if (!confirm(`Hapus laporan jurnal tanggal ${jurnal.date}?`)) return;

    try {
      await deleteJurnalSiswa(jurnal.id);
      toast.success("Jurnal berhasil dihapus");
      loadData();
    } catch (e: any) {
      toast.error("Gagal menghapus jurnal", {
        description: e?.message || "Terjadi kesalahan.",
      });
    }
  };

  const isBelumMagang = siswa.status === "Belum Magang" || !placement;

  // Filter journals based on search input
  const filteredJurnals = jurnals.filter((j) => {
    if (!searchTerm.trim()) return true;
    const query = searchTerm.toLowerCase();
    return (
      j.activity.toLowerCase().includes(query) ||
      (j.kendala && j.kendala.toLowerCase().includes(query)) ||
      (j.tindak_lanjut && j.tindak_lanjut.toLowerCase().includes(query)) ||
      j.date.includes(query)
    );
  });

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* CASE 1: BELUM MAGANG */}
      {isBelumMagang && (
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
      )}

      {/* TOP ACTION BAR (SESUAI GAMBAR 2) */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            disabled={isBelumMagang}
            placeholder="Cari kegiatan atau kendala..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 rounded-xl bg-muted/20 border-border text-xs w-full focus:bg-background transition-all"
          />
        </div>

        {/* Tulis Jurnal Button */}
        <Button
          onClick={() => setIsTulisOpen(true)}
          disabled={isBelumMagang}
          className="rounded-xl px-5 h-10 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs gap-2 shrink-0 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          <span>Tulis Jurnal</span>
        </Button>
      </div>

      {/* TABEL JURNAL KEGIATAN (PERSIS GAMBAR 2) */}
      <div className="rounded-2xl border border-border bg-card shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-4 w-36">TANGGAL</th>
                <th className="px-6 py-4">KEGIATAN</th>
                <th className="px-6 py-4 w-36 text-center">FOTO</th>
                <th className="px-6 py-4 w-36 text-center">STATUS</th>
                <th className="px-6 py-4 w-28 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-muted-foreground text-xs">
                    Memuat jurnal kegiatan...
                  </td>
                </tr>
              ) : isBelumMagang || filteredJurnals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <BookOpen className="h-10 w-10 text-muted-foreground/40 mb-1" />
                      <p className="text-xs font-bold text-foreground">
                        Belum ada jurnal kegiatan.
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {isBelumMagang
                          ? "Ajukan tempat magang terlebih dahulu untuk mulai mengisi jurnal kegiatan."
                          : "Tekan tombol \"+ Tulis Jurnal\" untuk mulai mencatat aktivitas hari ini."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredJurnals.map((j) => {
                  const isPending = j.status === "Pending";
                  const isRevision = j.status === "Perlu Revisi";
                  const isApproved = j.status === "Disetujui";

                  return (
                    <tr key={j.id} className="hover:bg-muted/30 transition-colors">
                      {/* 1. TANGGAL */}
                      <td className="px-6 py-4 font-bold text-foreground whitespace-nowrap">
                        {formatDate(j.date)}
                      </td>

                      {/* 2. KEGIATAN */}
                      <td className="px-6 py-4 text-foreground/90 leading-relaxed max-w-md">
                        <p className="line-clamp-2">{j.activity}</p>
                        {isRevision && j.teacher_feedback && (
                          <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-1 italic">
                            Catatan Guru: &ldquo;{j.teacher_feedback}&rdquo;
                          </p>
                        )}
                      </td>

                      {/* 3. FOTO */}
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        {j.photo_url ? (
                          <button
                            onClick={() => setPreviewPhoto(j.photo_url || null)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 text-[11px] font-semibold dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 transition-colors cursor-pointer"
                          >
                            <ImageIcon className="h-3.5 w-3.5" />
                            <span>Foto Kegiatan</span>
                          </button>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </td>

                      {/* 4. STATUS */}
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground border border-border">
                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
                            <span>Pending</span>
                          </span>
                        )}

                        {isRevision && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            <span>Revisi</span>
                          </span>
                        )}

                        {isApproved && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            <span>Terverifikasi</span>
                          </span>
                        )}
                      </td>

                      {/* 5. AKSI (SESUAI ATURAN BISNIS) */}
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {/* Case A: Status Pending -> BISA EDIT & HAPUS */}
                          {isPending && (
                            <>
                              <button
                                onClick={() => setEditingJurnal(j)}
                                title="Edit Jurnal"
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(j)}
                                title="Hapus Jurnal"
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}

                          {/* Case B: Status Revisi -> HANYA BISA EDIT (IKON HAPUS HILANG) */}
                          {isRevision && (
                            <button
                              onClick={() => setEditingJurnal(j)}
                              title="Perbaiki Jurnal"
                              className="p-1.5 rounded-lg text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                          )}

                          {/* Case C: Status Terverifikasi -> HANYA BISA LIHAT DETAIL */}
                          {isApproved && (
                            <button
                              onClick={() => setDetailJurnal(j)}
                              title="Lihat Detail Jurnal"
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Tulis Jurnal Baru (Gambar 3) */}
      <TulisJurnalModal
        isOpen={isTulisOpen}
        onClose={() => setIsTulisOpen(false)}
        onSuccess={loadData}
        studentId={siswa.id}
      />

      {/* MODAL 2: Edit / Perbaiki Jurnal */}
      <EditJurnalModal
        isOpen={Boolean(editingJurnal)}
        onClose={() => setEditingJurnal(null)}
        onSuccess={loadData}
        jurnal={editingJurnal}
      />

      {/* MODAL 3: Detail Jurnal Terverifikasi */}
      <DetailJurnalModal
        isOpen={Boolean(detailJurnal)}
        onClose={() => setDetailJurnal(null)}
        jurnal={detailJurnal}
      />

      {/* MODAL 4: Pratinjau Foto Dokumentasi */}
      {previewPhoto && (
        <div
          onClick={() => setPreviewPhoto(null)}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in-0 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-xl max-h-[85vh] bg-card rounded-2xl overflow-hidden border border-border p-3 shadow-2xl space-y-3 cursor-default"
          >
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <ImageIcon className="h-4 w-4 text-primary" />
                Foto Dokumentasi Jurnal
              </span>
              <button
                onClick={() => setPreviewPhoto(null)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewPhoto}
              alt="Preview Dokumentasi"
              className="max-h-[70vh] rounded-xl object-contain mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
}
