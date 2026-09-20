"use client";

import * as React from "react";
import {
  Building2,
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  AlertTriangle,
  X,
  Phone,
  User,
  MapPin,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getDudiList,
  getPenempatanList,
  createDudi,
  updateDudi,
  deleteDudi,
} from "@/lib/supabase/services";
import { useRealtimeTable } from "@/hooks/use-realtime";
import { Dudi, DudiStatus, Penempatan } from "@/types/database";

export default function DataDudiPage() {
  const [dudiList, setDudiList] = React.useState<Dudi[]>([]);
  const [penempatanList, setPenempatanList] = React.useState<Penempatan[]>([]);
  const [search, setSearch] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("Semua");
  const [loading, setLoading] = React.useState(true);

  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isStatusOpen, setIsStatusOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);

  const [activeDudi, setActiveDudi] = React.useState<Dudi | null>(null);

  // Form without status (status handled separately)
  const [formData, setFormData] = React.useState({
    name: "",
    address: "",
    pic_name: "",
    pic_phone: "",
    sector: "Teknologi Informasi / Software",
    quota: 2,
  });

  const [statusValue, setStatusValue] = React.useState<"Terverifikasi" | "Menunggu Validasi">(
    "Terverifikasi"
  );

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [openDropdownId, setOpenDropdownId] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      const [dData, pData] = await Promise.all([
        getDudiList(),
        getPenempatanList(),
      ]);
      setDudiList(dData);
      setPenempatanList(pData);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  useRealtimeTable("dudi", loadData);
  useRealtimeTable("penempatan", loadData);

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = "Nama industri/perusahaan wajib diisi";
    if (!formData.address.trim()) errs.address = "Alamat industri wajib diisi";
    if (!formData.pic_name.trim()) errs.pic_name = "Nama penanggung jawab (PIC) wajib diisi";
    if (!formData.pic_phone.trim()) errs.pic_phone = "Kontak PIC wajib diisi";
    if (formData.quota < 1) errs.quota = "Kuota minimal 1 siswa";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleOpenAdd = () => {
    setFormData({
      name: "",
      address: "",
      pic_name: "",
      pic_phone: "",
      sector: "Teknologi Informasi / Software",
      quota: 2,
    });
    setErrors({});
    setIsAddOpen(true);
  };

  const handleOpenEdit = (dudi: Dudi) => {
    setActiveDudi(dudi);
    setFormData({
      name: dudi.name,
      address: dudi.address,
      pic_name: dudi.pic_name,
      pic_phone: dudi.pic_phone,
      sector: dudi.sector,
      quota: dudi.quota,
    });
    setErrors({});
    setIsEditOpen(true);
    setOpenDropdownId(null);
  };

  const handleOpenStatus = (dudi: Dudi) => {
    setActiveDudi(dudi);
    setStatusValue(
      dudi.status === "Menunggu Validasi" ? "Menunggu Validasi" : "Terverifikasi"
    );
    setIsStatusOpen(true);
    setOpenDropdownId(null);
  };

  const handleOpenDelete = (dudi: Dudi) => {
    setActiveDudi(dudi);
    setIsDeleteOpen(true);
    setOpenDropdownId(null);
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const newDudi = await createDudi({
        ...formData,
        status: "Terverifikasi",
      });
      setIsAddOpen(false);
      toast.success("Mitra DUDI berhasil ditambahkan", {
        description: `${newDudi.name} telah terdaftar.`,
      });
      loadData();
    } catch (e) {
      toast.error("Gagal menambahkan DUDI");
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDudi || !validateForm()) return;

    try {
      await updateDudi(activeDudi.id, formData);
      setIsEditOpen(false);
      toast.success("Perubahan mitra DUDI berhasil disimpan");
      loadData();
    } catch (e) {
      toast.error("Gagal memperbarui DUDI");
    }
  };

  const handleSubmitStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDudi) return;

    try {
      await updateDudi(activeDudi.id, { status: statusValue });
      setIsStatusOpen(false);
      toast.success("Status verifikasi DUDI berhasil diperbarui", {
        description: `${activeDudi.name} sekarang ${statusValue}.`,
      });
      loadData();
    } catch (e) {
      toast.error("Gagal memperbarui status DUDI");
    }
  };

  const handleConfirmDelete = async () => {
    if (!activeDudi) return;
    try {
      await deleteDudi(activeDudi.id);
      setIsDeleteOpen(false);
      toast.success("Mitra DUDI berhasil dihapus", {
        description: `${activeDudi.name} telah dihapus dari sistem.`,
      });
      loadData();
    } catch (e) {
      toast.error("Gagal menghapus DUDI");
    }
  };

  const filteredDudi = dudiList.filter((d) => {
    const matchSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.address.toLowerCase().includes(search.toLowerCase()) ||
      d.sector.toLowerCase().includes(search.toLowerCase()) ||
      d.pic_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "Semua" || d.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
            Data Mitra DUDI
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Daftar dunia usaha &amp; industri mitra pelaksanaan Praktik Kerja Lapangan (PKL).
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2 shadow-sm font-bold">
          <Plus className="h-4 w-4" />
          <span>+ Tambah DUDI</span>
        </Button>
      </div>

      {/* Filters: Shortened search input directly beside the status filter */}
      <div className="flex flex-wrap items-center gap-3 bg-card p-4 rounded-2xl border border-border">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari industri, bidang, atau PIC..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 bg-muted/20 text-xs sm:text-sm w-full"
          />
        </div>
        <div className="w-full sm:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-10 px-3 rounded-lg border border-border bg-background text-xs font-semibold text-foreground outline-none w-full sm:w-auto"
          >
            <option value="Semua">Semua Status Verifikasi</option>
            <option value="Terverifikasi">Terverifikasi</option>
            <option value="Menunggu Validasi">Menunggu Validasi</option>
            <option value="Nonaktif">Nonaktif</option>
          </select>
        </div>
      </div>

      {/* Dudi Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground">
              <tr>
                <th className="px-5 py-3.5">Nama Perusahaan</th>
                <th className="px-5 py-3.5">Bidang Usaha</th>
                <th className="px-5 py-3.5">Alamat &amp; Kontak PIC</th>
                <th className="px-5 py-3.5 text-center">Siswa Aktif Magang</th>
                <th className="px-5 py-3.5 text-center">Status Verifikasi</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredDudi.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <Building2 className="h-9 w-9 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="font-semibold text-sm">Belum ada data industri mitra</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Klik tombol &quot;+ Tambah DUDI&quot; untuk mendaftarkan perusahaan mitra baru.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredDudi.map((d) => {
                  const activeCount = penempatanList.filter(
                    (p) => p.dudi_id === d.id && p.status === "Berlangsung"
                  ).length;

                  return (
                    <tr key={d.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold text-xs shrink-0">
                            {d.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-xs">{d.name}</p>
                            <p className="text-[11px] text-muted-foreground">
                              Kuota: {d.quota} Siswa
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-semibold text-foreground bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-lg text-[11px]">
                          {d.sector}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground max-w-[220px]">
                        <p className="text-foreground font-semibold flex items-center gap-1.5">
                          <User className="h-3 w-3 text-muted-foreground" /> {d.pic_name}
                        </p>
                        <p className="text-[11px] text-muted-foreground font-mono flex items-center gap-1.5 mt-0.5">
                          <Phone className="h-3 w-3 text-muted-foreground" /> {d.pic_phone}
                        </p>
                        <p className="text-[11px] text-muted-foreground/80 truncate mt-1">
                          {d.address}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-block font-extrabold text-xs bg-muted/60 text-foreground px-2.5 py-1 rounded-lg border border-border/80">
                          {activeCount} / {d.quota} Siswa
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            d.status === "Terverifikasi"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {d.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right relative">
                        <button
                          onClick={() =>
                            setOpenDropdownId(openDropdownId === d.id ? null : d.id)
                          }
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {openDropdownId === d.id && (
                          <div className="absolute right-5 top-12 z-20 w-44 rounded-xl border border-border bg-background shadow-xl p-1 text-left animate-in fade-in zoom-in-95">
                            <button
                              onClick={() => handleOpenEdit(d)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg hover:bg-muted text-foreground transition-colors"
                            >
                              <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>Edit Data</span>
                            </button>
                            <button
                              onClick={() => handleOpenStatus(d)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                            >
                              <ShieldCheck className="h-3.5 w-3.5" />
                              <span>Ubah Status</span>
                            </button>
                            <button
                              onClick={() => handleOpenDelete(d)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Hapus DUDI</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: TAMBAH DUDI */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-background shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Tambah Mitra DUDI</h3>
                <p className="text-xs text-muted-foreground">
                  Daftarkan perusahaan rekanan magang baru
                </p>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitAdd} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Nama Industri / Perusahaan *
                </label>
                <Input
                  placeholder="Contoh: PT Telkom Indonesia"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Bidang Usaha *
                </label>
                <Input
                  placeholder="Contoh: Teknologi Informasi / Jaringan / Otomotif"
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Alamat Kantor / Lokasi *
                </label>
                <Input
                  placeholder="Jl. Ketintang No. 156, Surabaya"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={errors.address ? "border-red-500" : ""}
                />
                {errors.address && <p className="text-[11px] text-red-500 mt-1">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                    Nama PIC *
                  </label>
                  <Input
                    placeholder="Bpk. Bambang"
                    value={formData.pic_name}
                    onChange={(e) => setFormData({ ...formData, pic_name: e.target.value })}
                    className={errors.pic_name ? "border-red-500" : ""}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                    Kontak PIC *
                  </label>
                  <Input
                    placeholder="08123456789"
                    value={formData.pic_phone}
                    onChange={(e) => setFormData({ ...formData, pic_phone: e.target.value })}
                    className={errors.pic_phone ? "border-red-500" : ""}
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Kuota Siswa Magang *
                </label>
                <Input
                  type="number"
                  min={1}
                  value={formData.quota}
                  onChange={(e) =>
                    setFormData({ ...formData, quota: parseInt(e.target.value) || 1 })
                  }
                  className={errors.quota ? "border-red-500" : ""}
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" size="sm" className="font-bold">
                  Simpan DUDI
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT DATA DUDI (Tanpa Edit Status) */}
      {isEditOpen && activeDudi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-background shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Edit Data Mitra DUDI</h3>
                <p className="text-xs text-muted-foreground">Perbarui informasi industri mitra</p>
              </div>
              <button
                onClick={() => setIsEditOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Nama Industri / Perusahaan *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Bidang Usaha *
                </label>
                <Input
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Alamat Kantor / Lokasi *
                </label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={errors.address ? "border-red-500" : ""}
                />
                {errors.address && <p className="text-[11px] text-red-500 mt-1">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                    Nama PIC *
                  </label>
                  <Input
                    value={formData.pic_name}
                    onChange={(e) => setFormData({ ...formData, pic_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                    Kontak PIC *
                  </label>
                  <Input
                    value={formData.pic_phone}
                    onChange={(e) => setFormData({ ...formData, pic_phone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Kuota Siswa Magang *
                </label>
                <Input
                  type="number"
                  min={1}
                  value={formData.quota}
                  onChange={(e) =>
                    setFormData({ ...formData, quota: parseInt(e.target.value) || 1 })
                  }
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" size="sm" className="font-bold">
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: UBAH STATUS DUDI (Terverifikasi & Menunggu Validasi) */}
      {isStatusOpen && activeDudi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-background shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Ubah Status Verifikasi</h3>
                <p className="text-xs text-muted-foreground">{activeDudi.name}</p>
              </div>
              <button
                onClick={() => setIsStatusOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitStatus} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Pilih Status DUDI
                </label>
                <select
                  value={statusValue}
                  onChange={(e) =>
                    setStatusValue(e.target.value as "Terverifikasi" | "Menunggu Validasi")
                  }
                  className="w-full h-11 px-3 rounded-xl border border-border bg-background text-xs font-semibold text-foreground outline-none"
                >
                  <option value="Terverifikasi">Terverifikasi</option>
                  <option value="Menunggu Validasi">Menunggu Validasi</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsStatusOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" size="sm" className="font-bold">
                  Simpan Status
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: HAPUS KONFIRMASI */}
      {isDeleteOpen && activeDudi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-background shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="p-2.5 rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Hapus Mitra DUDI</h3>
                <p className="text-xs text-muted-foreground">Konfirmasi penghapusan data</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed mb-6">
              Apakah Anda yakin ingin menghapus data mitra <span className="font-bold text-foreground">{activeDudi.name}</span>? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteOpen(false)}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleConfirmDelete}
                className="font-bold"
              >
                Hapus DUDI
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
