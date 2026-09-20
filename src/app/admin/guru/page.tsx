"use client";

import * as React from "react";
import {
  GraduationCap,
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  X,
  Shield,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  getGuruList,
  getPenempatanList,
  createGuru,
  updateGuru,
  deleteGuru,
  generateCredentialsFromName,
} from "@/lib/supabase/services";
import { useRealtimeTable } from "@/hooks/use-realtime";
import { Guru, Penempatan } from "@/types/database";

export default function DataGuruPage() {
  const [guruList, setGuruList] = React.useState<Guru[]>([]);
  const [penempatanList, setPenempatanList] = React.useState<Penempatan[]>([]);
  const [search, setSearch] = React.useState("");
  const [filterJurusan, setFilterJurusan] = React.useState("Semua");
  const [filterStatus, setFilterStatus] = React.useState("Semua");
  const [loading, setLoading] = React.useState(true);

  // Modal states
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isStatusOpen, setIsStatusOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isCredentialOpen, setIsCredentialOpen] = React.useState(false);

  // Active target for edit/status/delete
  const [activeGuru, setActiveGuru] = React.useState<Guru | null>(null);

  // Form state for Nama, NIP, Jurusan
  const [formData, setFormData] = React.useState({
    name: "",
    nip: "",
    department: "Rekayasa Perangkat Lunak",
  });

  // Status state for separate status action
  const [statusValue, setStatusValue] = React.useState<"Aktif" | "Cuti" | "Nonaktif">("Aktif");

  // Validation errors
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [createdCredentials, setCreatedCredentials] = React.useState<{
    email: string;
    password: string;
  } | null>(null);
  const [copied, setCopied] = React.useState(false);

  // Open action dropdown
  const [openDropdownId, setOpenDropdownId] = React.useState<string | null>(null);

  const fetchGuru = React.useCallback(async () => {
    try {
      const [gData, pData] = await Promise.all([
        getGuruList(),
        getPenempatanList(),
      ]);
      setGuruList(gData);
      setPenempatanList(pData);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchGuru();
  }, [fetchGuru]);

  // Realtime subscriptions
  useRealtimeTable("guru", fetchGuru);
  useRealtimeTable("penempatan", fetchGuru);

  // Validation helper: ONLY nama, nip, jurusan
  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) {
      errs.name = "Nama guru wajib diisi";
    }
    if (!formData.nip.trim()) {
      errs.nip = "NIP wajib diisi";
    } else if (formData.nip.length < 5) {
      errs.nip = "NIP minimal 5 karakter/digit";
    }
    if (!formData.department.trim()) {
      errs.department = "Jurusan wajib dipilih";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleOpenAdd = () => {
    setFormData({
      name: "",
      nip: "",
      department: "Rekayasa Perangkat Lunak",
    });
    setErrors({});
    setIsAddOpen(true);
  };

  const handleOpenEdit = (guru: Guru) => {
    setActiveGuru(guru);
    setFormData({
      name: guru.name,
      nip: guru.nip,
      department: guru.department,
    });
    setErrors({});
    setIsEditOpen(true);
    setOpenDropdownId(null);
  };

  const handleOpenStatus = (guru: Guru) => {
    setActiveGuru(guru);
    setStatusValue(guru.status as "Aktif" | "Cuti" | "Nonaktif");
    setIsStatusOpen(true);
    setOpenDropdownId(null);
  };

  const handleOpenDelete = (guru: Guru) => {
    setActiveGuru(guru);
    setIsDeleteOpen(true);
    setOpenDropdownId(null);
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const creds = generateCredentialsFromName(formData.name);
      const newGuru = await createGuru({
        name: formData.name.trim(),
        nip: formData.nip.trim(),
        email: creds.email,
        department: formData.department,
        status: "Aktif",
      });
      setIsAddOpen(false);

      // Show credentials popup
      setCreatedCredentials({
        email: newGuru.email,
        password: creds.password,
      });
      setIsCredentialOpen(true);
      toast.success("Data guru berhasil ditambahkan", {
        description: `${newGuru.name} telah didaftarkan ke SIMMAS.`,
      });
      fetchGuru();
    } catch (e) {
      toast.error("Gagal menambahkan guru");
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGuru || !validateForm()) return;

    try {
      await updateGuru(activeGuru.id, {
        name: formData.name.trim(),
        nip: formData.nip.trim(),
        department: formData.department,
      });
      setIsEditOpen(false);
      toast.success("Perubahan data guru berhasil disimpan", {
        description: `Data ${formData.name} telah diperbarui.`,
      });
      fetchGuru();
    } catch (e) {
      toast.error("Gagal memperbarui guru");
    }
  };

  const handleSubmitStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGuru) return;

    try {
      await updateGuru(activeGuru.id, { status: statusValue });
      setIsStatusOpen(false);
      toast.success("Status guru berhasil diubah", {
        description: `${activeGuru.name} kini berstatus ${statusValue}.`,
      });
      fetchGuru();
    } catch (e) {
      toast.error("Gagal memperbarui status guru");
    }
  };

  const handleConfirmDelete = async () => {
    if (!activeGuru) return;
    try {
      await deleteGuru(activeGuru.id);
      setIsDeleteOpen(false);
      toast.success("Data guru berhasil dihapus", {
        description: `${activeGuru.name} telah dihapus dari sistem.`,
      });
      fetchGuru();
    } catch (e) {
      toast.error("Gagal menghapus data guru");
    }
  };

  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const text = `Kredensial Guru SIMMAS\nEmail: ${createdCredentials.email}\nPassword: ${createdCredentials.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Kredensial berhasil disalin ke clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  // Filtered List
  const filteredGuru = guruList.filter((g) => {
    const matchSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.nip.toLowerCase().includes(search.toLowerCase()) ||
      g.email.toLowerCase().includes(search.toLowerCase());
    const matchJurusan =
      filterJurusan === "Semua" || g.department === filterJurusan;
    const matchStatus =
      filterStatus === "Semua" || g.status === filterStatus;
    return matchSearch && matchJurusan && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
            Data Guru Pembimbing
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Kelola data guru pembimbing magang, penugasan jurusan, dan bimbingan siswa.
          </p>
        </div>
        <Button id="btn-tambah-guru" onClick={handleOpenAdd} className="gap-2 shadow-sm font-bold">
          <Plus className="h-4 w-4" />
          <span>+ Tambah Guru</span>
        </Button>
      </div>

      {/* Filter and Search Bar: Shortened search input directly beside the filters */}
      <div className="flex flex-wrap items-center gap-3 bg-card p-4 rounded-2xl border border-border">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama, NIP, atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 bg-muted/20 text-xs sm:text-sm w-full"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterJurusan}
            onChange={(e) => setFilterJurusan(e.target.value)}
            className="h-10 px-3 rounded-lg border border-border bg-background text-xs font-semibold text-foreground outline-none w-full sm:w-auto"
          >
            <option value="Semua">Semua Jurusan</option>
            <option value="Rekayasa Perangkat Lunak">Rekayasa Perangkat Lunak</option>
            <option value="Teknik Komputer & Jaringan">Teknik Komputer &amp; Jaringan</option>
            <option value="Multimedia">Multimedia / DKV</option>
            <option value="Akuntansi">Akuntansi</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-10 px-3 rounded-lg border border-border bg-background text-xs font-semibold text-foreground outline-none w-full sm:w-auto"
          >
            <option value="Semua">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Cuti">Cuti</option>
            <option value="Nonaktif">Nonaktif</option>
          </select>
        </div>
      </div>

      {/* Guru Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground">
              <tr>
                <th className="px-5 py-3.5">NIP &amp; Nama Guru</th>
                <th className="px-5 py-3.5">Jurusan</th>
                <th className="px-5 py-3.5 text-center">Bimbingan</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredGuru.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    <GraduationCap className="h-9 w-9 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="font-semibold text-sm">Belum ada data guru pembimbing</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Klik tombol &quot;+ Tambah Guru&quot; untuk mendaftarkan pembimbing pertama.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredGuru.map((g) => {
                  const bimbinganCount = penempatanList.filter(
                    (p) => p.teacher_id === g.id && p.status !== "Dibatalkan"
                  ).length;

                  return (
                    <tr key={g.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-extrabold text-xs shrink-0">
                            {g.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-xs">{g.name}</p>
                            <p className="text-[11px] text-muted-foreground font-mono">
                              NIP: {g.nip}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-semibold text-foreground">{g.department}</span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-block font-bold text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-lg">
                          {bimbinganCount} Siswa
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            g.status === "Aktif"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : g.status === "Cuti"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {g.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right relative">
                        <button
                          onClick={() =>
                            setOpenDropdownId(openDropdownId === g.id ? null : g.id)
                          }
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {openDropdownId === g.id && (
                          <div className="absolute right-5 top-12 z-20 w-40 rounded-xl border border-border bg-background shadow-xl p-1 text-left animate-in fade-in zoom-in-95">
                            <button
                              onClick={() => handleOpenEdit(g)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg hover:bg-muted text-foreground transition-colors"
                            >
                              <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>Edit Data</span>
                            </button>
                            <button
                              onClick={() => handleOpenStatus(g)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                            >
                              <UserCheck className="h-3.5 w-3.5" />
                              <span>Ubah Status</span>
                            </button>
                            <button
                              onClick={() => handleOpenDelete(g)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Hapus Guru</span>
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

      {/* MODAL 1: TAMBAH GURU (Hanya Nama, NIP, Jurusan) */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-background shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Tambah Guru Pembimbing</h3>
                <p className="text-xs text-muted-foreground">
                  Isi informasi dasar guru pembimbing baru
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
                  Nama Lengkap Guru *
                </label>
                <Input
                  id="input-guru-name"
                  placeholder="Contoh: Drs. H. Budi Santoso, M.Kom"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  NIP Guru *
                </label>
                <Input
                  id="input-guru-nip"
                  placeholder="198501012010011001"
                  value={formData.nip}
                  onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                  className={errors.nip ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {errors.nip && <p className="text-[11px] text-red-500 mt-1">{errors.nip}</p>}
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Jurusan / Program Keahlian *
                </label>
                <select
                  id="select-guru-dept"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-xs font-semibold text-foreground outline-none"
                >
                  <option value="Rekayasa Perangkat Lunak">Rekayasa Perangkat Lunak</option>
                  <option value="Teknik Komputer & Jaringan">Teknik Komputer &amp; Jaringan</option>
                  <option value="Multimedia">Multimedia / DKV</option>
                  <option value="Akuntansi">Akuntansi</option>
                </select>
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
                <Button id="btn-submit-guru" type="submit" size="sm" className="font-bold">
                  Simpan Guru
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT GURU (Hanya Nama, NIP, Jurusan) */}
      {isEditOpen && activeGuru && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-background shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Edit Data Guru</h3>
                <p className="text-xs text-muted-foreground">Perbarui data guru pembimbing</p>
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
                  Nama Lengkap Guru *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  NIP Guru *
                </label>
                <Input
                  value={formData.nip}
                  onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                  className={errors.nip ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {errors.nip && <p className="text-[11px] text-red-500 mt-1">{errors.nip}</p>}
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Jurusan / Program Keahlian *
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-xs font-semibold text-foreground outline-none"
                >
                  <option value="Rekayasa Perangkat Lunak">Rekayasa Perangkat Lunak</option>
                  <option value="Teknik Komputer & Jaringan">Teknik Komputer &amp; Jaringan</option>
                  <option value="Multimedia">Multimedia / DKV</option>
                  <option value="Akuntansi">Akuntansi</option>
                </select>
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

      {/* MODAL 3: UBAH STATUS GURU (Aksi Sendiri) */}
      {isStatusOpen && activeGuru && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-background shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Ubah Status Guru</h3>
                <p className="text-xs text-muted-foreground">{activeGuru.name}</p>
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
                  Pilih Status
                </label>
                <select
                  value={statusValue}
                  onChange={(e) =>
                    setStatusValue(e.target.value as "Aktif" | "Cuti" | "Nonaktif")
                  }
                  className="w-full h-11 px-3 rounded-xl border border-border bg-background text-xs font-semibold text-foreground outline-none"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Cuti">Cuti</option>
                  <option value="Nonaktif">Nonaktif</option>
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
      {isDeleteOpen && activeGuru && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-background shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="p-2.5 rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Hapus Guru Pembimbing</h3>
                <p className="text-xs text-muted-foreground">Konfirmasi penghapusan data</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed mb-6">
              Apakah Anda yakin ingin menghapus data <span className="font-bold text-foreground">{activeGuru.name}</span>? Tindakan ini tidak dapat dibatalkan.
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
                Hapus Guru
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: KREDENSIAL BARU SUKSES */}
      {isCredentialOpen && createdCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-background shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2.5 text-emerald-600 mb-3">
              <div className="p-2 rounded-full bg-emerald-100">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">Akun Guru Berhasil Dibuat</h3>
            </div>

            <p className="text-xs text-muted-foreground mb-4">
              Silakan salin dan berikan kredensial login berikut kepada guru yang bersangkutan:
            </p>

            <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2 mb-5 font-mono text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-bold text-foreground">{createdCredentials.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Password Awal:</span>
                <span className="font-bold text-primary">{createdCredentials.password}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyCredentials}
                className="gap-1.5 text-xs font-semibold"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? "Tersalin!" : "Salin Kredensial"}</span>
              </Button>

              <Button
                id="btn-close-credential-guru"
                size="sm"
                onClick={() => setIsCredentialOpen(false)}
                className="font-bold text-xs"
              >
                Selesai
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
