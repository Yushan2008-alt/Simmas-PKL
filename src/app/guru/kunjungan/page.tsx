"use client";

import * as React from "react";
import {
  CalendarCheck,
  Plus,
  Search,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Trash2,
  FileText,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getActiveGuru,
  getKunjunganList,
  updateKunjungan,
  deleteKunjungan,
  getSupervisedStudentsSummary,
} from "@/lib/supabase/services";
import { Kunjungan, Dudi } from "@/types/database";
import { TambahKunjunganModal } from "@/components/guru/tambah-kunjungan-modal";

export default function GuruKunjunganPage() {
  const guru = getActiveGuru();
  const [kunjunganList, setKunjunganList] = React.useState<Kunjungan[]>([]);
  const [availableDudis, setAvailableDudis] = React.useState<Dudi[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const loadData = React.useCallback(async () => {
    try {
      const [kList, sumList] = await Promise.all([
        getKunjunganList(guru.id),
        getSupervisedStudentsSummary(guru.id),
      ]);
      setKunjunganList(kList);

      const uniqueDudis = Array.from(new Set(sumList.map((s) => s.dudi.id))).map(
        (id) => sumList.find((s) => s.dudi.id === id)!.dudi
      );
      setAvailableDudis(uniqueDudis);
    } catch (e) {
      console.error("Failed to load kunjungan data:", e);
    } finally {
      setLoading(false);
    }
  }, [guru.id]);

  React.useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    if (typeof window !== "undefined") {
      window.addEventListener("simmas_kunjungan_updated", handleUpdate);
      return () => {
        window.removeEventListener("simmas_kunjungan_updated", handleUpdate);
      };
    }
  }, [loadData]);

  const handleMarkComplete = async (kunjungan: Kunjungan) => {
    try {
      await updateKunjungan(kunjungan.id, { status: "Selesai" });
      toast.success("Kunjungan ditandai selesai", {
        description: `Monitoring ke ${kunjungan.dudi?.name} telah selesai dilaksanakan.`,
      });
      loadData();
    } catch (e: any) {
      toast.error("Gagal memperbarui status", {
        description: e?.message || "Terjadi kesalahan.",
      });
    }
  };

  const handleDelete = async (kunjungan: Kunjungan) => {
    if (!confirm(`Hapus data agenda kunjungan ke ${kunjungan.dudi?.name}?`)) {
      return;
    }

    try {
      await deleteKunjungan(kunjungan.id);
      toast.success("Kunjungan dihapus", {
        description: `Agenda kunjungan telah dihapus.`,
      });
      loadData();
    } catch (e: any) {
      toast.error("Gagal menghapus kunjungan", {
        description: e?.message || "Terjadi kesalahan.",
      });
    }
  };

  const filtered = kunjunganList.filter((k) => {
    const matchSearch =
      (k.dudi?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      k.notes.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "ALL" ||
      (statusFilter === "Terjadwal" && k.status === "Terjadwal") ||
      (statusFilter === "Selesai" && k.status === "Selesai");

    return matchSearch && matchStatus;
  });

  const terjadwalCount = kunjunganList.filter((k) => k.status === "Terjadwal").length;
  const selesaiCount = kunjunganList.filter((k) => k.status === "Selesai").length;

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/10 text-blue-600">
              Monitoring Industri
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Kunjungan Lapangan
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Jadwalkan monitoring berkala dan rekam jejak koordinasi evaluasi siswa di tempat magang.
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="rounded-xl h-11 px-4 gap-2 font-bold shadow-md shadow-primary/20 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>+ Tambah Kunjungan</span>
        </Button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border border-border bg-card shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Total Agenda
            </p>
            <p className="text-2xl font-black text-foreground mt-1">
              {kunjunganList.length}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600">
            <CalendarCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Terjadwal
            </p>
            <p className="text-2xl font-black text-blue-600 mt-1">
              {terjadwalCount}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Selesai Dilakukan
            </p>
            <p className="text-2xl font-black text-emerald-600 mt-1">
              {selesaiCount}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari DUDI atau isi catatan kunjungan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11 rounded-xl bg-card"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-3.5 h-11 rounded-xl text-xs font-bold transition-all ${
              statusFilter === "ALL"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-card text-muted-foreground border border-border hover:bg-muted"
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setStatusFilter("Terjadwal")}
            className={`px-3.5 h-11 rounded-xl text-xs font-bold transition-all ${
              statusFilter === "Terjadwal"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-card text-blue-600 border border-border hover:bg-blue-50"
            }`}
          >
            Terjadwal ({terjadwalCount})
          </button>
          <button
            onClick={() => setStatusFilter("Selesai")}
            className={`px-3.5 h-11 rounded-xl text-xs font-bold transition-all ${
              statusFilter === "Selesai"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-card text-emerald-600 border border-border hover:bg-emerald-50"
            }`}
          >
            Selesai ({selesaiCount})
          </button>
        </div>
      </div>

      {/* Kunjungan Table / Cards */}
      <div className="rounded-2xl border border-border bg-card shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-4">Mitra DUDI</th>
                <th className="px-4 py-4">Tanggal Kunjungan</th>
                <th className="px-4 py-4 text-center">Status</th>
                <th className="px-6 py-4">Catatan / Hasil Evaluasi</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    Memuat data kunjungan lapangan...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    Tidak ditemukan agenda kunjungan yang sesuai.
                  </td>
                </tr>
              ) : (
                filtered.map((k) => {
                  const isScheduled = k.status === "Terjadwal";

                  return (
                    <tr key={k.id} className="hover:bg-muted/30 transition-colors">
                      {/* DUDI */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 shrink-0">
                            <Building2 className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-sm">
                              {k.dudi?.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {k.dudi?.sector} • PIC: {k.dudi?.pic_name}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Tanggal */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 font-semibold text-foreground">
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                          <span>{k.date}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isScheduled
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {k.status}
                        </span>
                      </td>

                      {/* Notes */}
                      <td className="px-6 py-4 max-w-md">
                        <p className="text-xs text-foreground leading-relaxed line-clamp-2">
                          {k.notes}
                        </p>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isScheduled && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkComplete(k)}
                              className="h-8 text-xs font-bold rounded-xl text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200 gap-1"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Selesai</span>
                            </Button>
                          )}

                          <button
                            onClick={() => handleDelete(k)}
                            className="p-2 rounded-xl text-muted-foreground hover:text-red-600 hover:bg-red-500/10 transition-colors"
                            title="Hapus Kunjungan"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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

      {/* Modal Tambah Kunjungan */}
      <TambahKunjunganModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadData}
        availableDudis={availableDudis}
      />
    </div>
  );
}
