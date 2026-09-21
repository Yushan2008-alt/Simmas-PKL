"use client";

import * as React from "react";
import {
  Users,
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
  GraduationCap,
  Building2,
  Briefcase,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getSiswaList,
  getPenempatanList,
  getDudiList,
  getGuruList,
  createSiswa,
  updateSiswa,
  deleteSiswa,
  createPenempatan,
  updatePenempatan,
  generateCredentialsFromName,
} from "@/lib/supabase/services";
import { useRealtimeTable } from "@/hooks/use-realtime";
import { Siswa, Penempatan, Dudi, Guru, SiswaStatus } from "@/types/database";

export default function DataSiswaPage() {
  const [siswaList, setSiswaList] = React.useState<Siswa[]>([]);
  const [penempatanList, setPenempatanList] = React.useState<Penempatan[]>([]);
  const [dudiList, setDudiList] = React.useState<Dudi[]>([]);
  const [guruList, setGuruList] = React.useState<Guru[]>([]);

  const [search, setSearch] = React.useState("");
  const [filterKelas, setFilterKelas] = React.useState("Semua");
  const [filterIndustri, setFilterIndustri] = React.useState("Semua");
  const [filterStatus, setFilterStatus] = React.useState("Semua");
  const [loading, setLoading] = React.useState(true);

  // Modal states
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isPlottingOpen, setIsPlottingOpen] = React.useState(false);
  const [isStatusOpen, setIsStatusOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isCredentialOpen, setIsCredentialOpen] = React.useState(false);

  const [activeSiswa, setActiveSiswa] = React.useState<Siswa | null>(null);

  // Form states: only nama, nis, kelas
  const [formData, setFormData] = React.useState({
    name: "",
    nis: "",
    class_name: "",
  });

  // Plotting form state
  const [plotData, setPlotData] = React.useState({
    teacher_id: "",
    dudi_id: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  });

  // Status magang state
  const [statusMagang, setStatusMagang] = React.useState<"Belum Magang" | "Sedang Magang" | "Lulus">(
    "Belum Magang"
  );

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [createdCredentials, setCreatedCredentials] = React.useState<{
    email: string;
    password: string;
  } | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [openDropdownId, setOpenDropdownId] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      const [sData, pData, dData, gData] = await Promise.all([
        getSiswaList(),
        getPenempatanList(),
        getDudiList(),
        getGuruList(),
      ]);
      setSiswaList(sData);
      setPenempatanList(pData);
      setDudiList(dData);
      setGuruList(gData);
    } catch (e) {
      toast.error("Gagal memuat data master");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Realtime updates
  useRealtimeTable("siswa", loadData);
  useRealtimeTable("penempatan", loadData);

  const activeTeachers = React.useMemo(() => {
    return guruList.filter((g) => g.status === "Aktif");
  }, [guruList]);

  const verifiedDudi = React.useMemo(() => {
    return dudiList.filter((d) => d.status === "Terverifikasi");
  }, [dudiList]);

  const classOptions = React.useMemo(() => {
    const set = new Set<string>();
    siswaList.forEach((s) => {
      if (s.class_name) set.add(s.class_name);
    });
    return Array.from(set).sort();
  }, [siswaList]);

  // Validation: only nama, nis, kelas
  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = "Nama siswa wajib diisi";
    if (!formData.nis.trim()) {
      errs.nis = "NIS wajib diisi";
    } else if (formData.nis.length < 4) {
      errs.nis = "NIS minimal 4 karakter/digit";
    }
    if (!formData.class_name.trim()) errs.class_name = "Kelas wajib diisi (Contoh: XII RPL 1)";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleOpenAdd = () => {
    setFormData({
      name: "",
      nis: "",
      class_name: "",
    });
    setErrors({});
    setIsAddOpen(true);
  };

  const handleOpenEdit = (siswa: Siswa) => {
    setActiveSiswa(siswa);
    setFormData({
      name: siswa.name,
      nis: siswa.nis,
      class_name: siswa.class_name,
    });
    setErrors({});
    setIsEditOpen(true);
    setOpenDropdownId(null);
  };

  const handleOpenPlotting = (siswa: Siswa) => {
    setActiveSiswa(siswa);
    const existing = penempatanList.find(
      (p) => p.student_id === siswa.id && p.status === "Berlangsung"
    );
    setPlotData({
      teacher_id: existing?.teacher_id || activeTeachers[0]?.id || "",
      dudi_id: existing?.dudi_id || verifiedDudi[0]?.id || "",
      start_date: existing?.start_date || new Date().toISOString().split("T")[0],
      end_date:
        existing?.end_date ||
        new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    });
    setIsPlottingOpen(true);
    setOpenDropdownId(null);
  };

  const handleOpenStatus = (siswa: Siswa) => {
    setActiveSiswa(siswa);
    const current =
      siswa.status === "Selesai Magang"
        ? "Lulus"
        : siswa.status === "Sedang Magang"
        ? "Sedang Magang"
        : "Belum Magang";
    setStatusMagang(current);
    setIsStatusOpen(true);
    setOpenDropdownId(null);
  };

  const handleOpenDelete = (siswa: Siswa) => {
    setActiveSiswa(siswa);
    setIsDeleteOpen(true);
    setOpenDropdownId(null);
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const creds = generateCredentialsFromName(formData.name);
      const newSiswa = await createSiswa({
        name: formData.name.trim(),
        nis: formData.nis.trim(),
        email: creds.email,
        class_name: formData.class_name,
        status: "Belum Magang",
      });
      setIsAddOpen(false);
      setCreatedCredentials({
        email: newSiswa.email,
        password: creds.password,
      });
      setIsCredentialOpen(true);
      toast.success("Data siswa berhasil ditambahkan", {
        description: `${newSiswa.name} telah didaftarkan.`,
      });
      loadData();
    } catch (e) {
      toast.error("Gagal menambahkan siswa");
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSiswa || !validateForm()) return;

    try {
      await updateSiswa(activeSiswa.id, {
        name: formData.name.trim(),
        nis: formData.nis.trim(),
        class_name: formData.class_name,
      });
      setIsEditOpen(false);
      toast.success("Perubahan data siswa berhasil disimpan");
      loadData();
    } catch (e) {
      toast.error("Gagal memperbarui siswa");
    }
  };

  const handleSubmitPlotting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSiswa) return;
    if (!plotData.teacher_id || !plotData.dudi_id) {
      toast.error("Pilih Guru Pembimbing dan Tempat Magang!");
      return;
    }

    try {
      const existing = penempatanList.find(
        (p) => p.student_id === activeSiswa.id && p.status === "Berlangsung"
      );

      if (existing) {
        await updatePenempatan(existing.id, {
          teacher_id: plotData.teacher_id,
          dudi_id: plotData.dudi_id,
          start_date: plotData.start_date,
          end_date: plotData.end_date,
          status: "Berlangsung",
        });
      } else {
        await createPenempatan({
          student_id: activeSiswa.id,
          teacher_id: plotData.teacher_id,
          dudi_id: plotData.dudi_id,
          start_date: plotData.start_date,
          end_date: plotData.end_date,
          status: "Berlangsung",
        });
      }

      await updateSiswa(activeSiswa.id, { status: "Sedang Magang" });
      setIsPlottingOpen(false);
      toast.success("Plotting pembimbing dan DUDI berhasil disimpan", {
        description: `${activeSiswa.name} kini berstatus Sedang Magang.`,
      });
      loadData();
    } catch (e) {
      toast.error("Gagal menyimpan plotting penempatan");
    }
  };

  const handleSubmitStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSiswa) return;

    try {
      const mappedDbStatus: SiswaStatus =
        statusMagang === "Lulus" ? "Selesai Magang" : statusMagang;

      await updateSiswa(activeSiswa.id, { status: mappedDbStatus });

      // If finished/lulus, update active placement to Selesai
      if (statusMagang === "Lulus") {
        const existing = penempatanList.find(
          (p) => p.student_id === activeSiswa.id && p.status === "Berlangsung"
        );
        if (existing) {
          await updatePenempatan(existing.id, { status: "Selesai" });
        }
      }

      setIsStatusOpen(false);
      toast.success("Status magang siswa berhasil diperbarui", {
        description: `${activeSiswa.name} status diubah menjadi ${statusMagang}.`,
      });
      loadData();
    } catch (e) {
      toast.error("Gagal mengubah status magang");
    }
  };

  const handleConfirmDelete = async () => {
    if (!activeSiswa) return;
    try {
      await deleteSiswa(activeSiswa.id);
      setIsDeleteOpen(false);
      toast.success("Data siswa berhasil dihapus", {
        description: `${activeSiswa.name} telah dihapus dari sistem.`,
      });
      loadData();
    } catch (e) {
      toast.error("Gagal menghapus siswa");
    }
  };

  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const text = `Kredensial Siswa SIMMAS\nEmail: ${createdCredentials.email}\nPassword: ${createdCredentials.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Kredensial siswa berhasil disalin!");
    setTimeout(() => setCopied(false), 2500);
  };

  const filteredSiswa = siswaList.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.nis.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchKelas = filterKelas === "Semua" || s.class_name === filterKelas;

    // Filter by Industri
    const placement = penempatanList.find((p) => p.student_id === s.id);
    const matchIndustri =
      filterIndustri === "Semua" || placement?.dudi_id === filterIndustri;

    // Filter by Status
    const matchStatus =
      filterStatus === "Semua" ||
      s.status === filterStatus ||
      (filterStatus === "Lulus" && s.status === "Selesai Magang");

    return matchSearch && matchKelas && matchIndustri && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
            Data Siswa
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Daftar seluruh siswa peserta program magang/PKL dan status penempatannya.
          </p>
        </div>
        <Button id="btn-tambah-siswa" onClick={handleOpenAdd} className="gap-2 shadow-sm font-bold">
          <Plus className="h-4 w-4" />
          <span>+ Tambah Siswa</span>
        </Button>
      </div>

      {/* Filters: Shortened search input directly beside the filters */}
      <div className="flex flex-wrap items-center gap-3 bg-card p-4 rounded-2xl border border-border">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau NIS siswa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 bg-muted/20 text-xs sm:text-sm w-full"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
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

          <select
            value={filterIndustri}
            onChange={(e) => setFilterIndustri(e.target.value)}
            className="h-10 px-3 rounded-lg border border-border bg-background text-xs font-semibold text-foreground outline-none w-full sm:w-auto"
          >
            <option value="Semua">Semua Industri (DUDI)</option>
            {verifiedDudi.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-10 px-3 rounded-lg border border-border bg-background text-xs font-semibold text-foreground outline-none w-full sm:w-auto"
          >
            <option value="Semua">Semua Status</option>
            <option value="Belum Magang">Belum Magang</option>
            <option value="Sedang Magang">Sedang Magang</option>
            <option value="Selesai Magang">Lulus / Selesai</option>
          </select>
        </div>
      </div>

      {/* Siswa Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground">
              <tr>
                <th className="px-5 py-3.5">NIS &amp; Nama Siswa</th>
                <th className="px-5 py-3.5">Kelas</th>
                <th className="px-5 py-3.5">Mitra DUDI &amp; Pembimbing</th>
                <th className="px-5 py-3.5 text-center">Status Magang</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredSiswa.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    <Users className="h-9 w-9 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="font-semibold text-sm">Belum ada data siswa</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Klik tombol &quot;+ Tambah Siswa&quot; untuk mendaftarkan siswa baru.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredSiswa.map((s) => {
                  const p = penempatanList.find((item) => item.student_id === s.id);
                  const displayStatus =
                    s.status === "Selesai Magang" ? "Lulus" : s.status;

                  return (
                    <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-extrabold text-xs shrink-0">
                            {s.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-xs">{s.name}</p>
                            <p className="text-[11px] text-muted-foreground font-mono">
                              NIS: {s.nis}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-semibold text-foreground">
                        {s.class_name}
                      </td>
                      <td className="px-5 py-4">
                        {p ? (
                          <div>
                            <p className="font-semibold text-foreground flex items-center gap-1">
                              <Building2 className="h-3 w-3 text-primary shrink-0" />
                              <span>{p.dudi?.name || "DUDI"}</span>
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              Pembimbing: {p.teacher?.name || "-"}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic text-[11px]">
                            Belum di-plotting
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            s.status === "Sedang Magang"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : s.status === "Selesai Magang"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {displayStatus}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right relative">
                        <button
                          onClick={() =>
                            setOpenDropdownId(openDropdownId === s.id ? null : s.id)
                          }
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {openDropdownId === s.id && (
                          <div className="absolute right-5 top-12 z-20 w-48 rounded-xl border border-border bg-background shadow-xl p-1 text-left animate-in fade-in zoom-in-95">
                            <button
                              onClick={() => handleOpenEdit(s)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg hover:bg-muted text-foreground transition-colors"
                            >
                              <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>Edit Data</span>
                            </button>
                            <button
                              onClick={() => handleOpenPlotting(s)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                            >
                              <Briefcase className="h-3.5 w-3.5" />
                              <span>Plot Guru Pembimbing</span>
                            </button>
                            <button
                              onClick={() => handleOpenStatus(s)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors"
                            >
                              <UserCheck className="h-3.5 w-3.5" />
                              <span>Ubah Status Magang</span>
                            </button>
                            <button
                              onClick={() => handleOpenDelete(s)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Hapus Siswa</span>
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

      {/* MODAL 1: TAMBAH SISWA (Hanya Nama, NIS, Kelas) */}
      {isAddOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-background shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Tambah Siswa Baru</h3>
                <p className="text-xs text-muted-foreground">
                  Isi informasi identitas siswa magang baru
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
                  Nama Lengkap Siswa *
                </label>
                <Input
                  id="input-siswa-name"
                  placeholder="Contoh: Ahmad Zaki Pratama"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  NIS *
                </label>
                <Input
                  id="input-siswa-nis"
                  placeholder="Contoh: 21221001"
                  value={formData.nis}
                  onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                  className={errors.nis ? "border-red-500" : ""}
                />
                {errors.nis && <p className="text-[11px] text-red-500 mt-1">{errors.nis}</p>}
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Kelas *
                </label>
                <Input
                  id="input-siswa-kelas"
                  placeholder="Contoh: XII RPL 1"
                  value={formData.class_name}
                  onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                  className={errors.class_name ? "border-red-500" : ""}
                />
                {errors.class_name && <p className="text-[11px] text-red-500 mt-1">{errors.class_name}</p>}
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
                <Button id="btn-submit-siswa" type="submit" size="sm" className="font-bold">
                  Simpan Siswa
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT SISWA (Hanya Nama, NIS, Kelas) */}
      {isEditOpen && activeSiswa && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-background shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Edit Data Siswa</h3>
                <p className="text-xs text-muted-foreground">Perbarui informasi siswa</p>
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
                  Nama Lengkap Siswa *
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
                  NIS *
                </label>
                <Input
                  value={formData.nis}
                  onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                  className={errors.nis ? "border-red-500" : ""}
                />
                {errors.nis && <p className="text-[11px] text-red-500 mt-1">{errors.nis}</p>}
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Kelas *
                </label>
                <Input
                  id="edit-input-siswa-kelas"
                  placeholder="Contoh: XII RPL 1"
                  value={formData.class_name}
                  onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                  className={errors.class_name ? "border-red-500" : ""}
                />
                {errors.class_name && <p className="text-[11px] text-red-500 mt-1">{errors.class_name}</p>}
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

      {/* MODAL 3: PLOT GURU PEMBIMBING & TEMPAT MAGANG TERVERIFIKASI */}
      {isPlottingOpen && activeSiswa && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-background shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Plot Guru Pembimbing &amp; DUDI</h3>
                <p className="text-xs text-muted-foreground">
                  {activeSiswa.name} ({activeSiswa.class_name})
                </p>
              </div>
              <button
                onClick={() => setIsPlottingOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitPlotting} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Guru Pembimbing Aktif *
                </label>
                <select
                  value={plotData.teacher_id}
                  onChange={(e) => setPlotData({ ...plotData, teacher_id: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-xs font-semibold text-foreground outline-none"
                >
                  <option value="">-- Pilih Guru Pembimbing --</option>
                  {activeTeachers.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Tempat Magang Terverifikasi (DUDI) *
                </label>
                <select
                  value={plotData.dudi_id}
                  onChange={(e) => setPlotData({ ...plotData, dudi_id: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-xs font-semibold text-foreground outline-none"
                >
                  <option value="">-- Pilih Mitra DUDI --</option>
                  {verifiedDudi.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.sector})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                    Tanggal Mulai
                  </label>
                  <Input
                    type="date"
                    value={plotData.start_date}
                    onChange={(e) => setPlotData({ ...plotData, start_date: e.target.value })}
                    className="h-10 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                    Tanggal Selesai
                  </label>
                  <Input
                    type="date"
                    value={plotData.end_date}
                    onChange={(e) => setPlotData({ ...plotData, end_date: e.target.value })}
                    className="h-10 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPlottingOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" size="sm" className="font-bold">
                  Simpan Plotting
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: UBAH STATUS MAGANG (Belum Magang, Sedang Magang, Lulus) */}
      {isStatusOpen && activeSiswa && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-background shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Ubah Status Magang</h3>
                <p className="text-xs text-muted-foreground">{activeSiswa.name}</p>
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
                  Pilih Status Magang Siswa
                </label>
                <select
                  value={statusMagang}
                  onChange={(e) =>
                    setStatusMagang(
                      e.target.value as "Belum Magang" | "Sedang Magang" | "Lulus"
                    )
                  }
                  className="w-full h-11 px-3 rounded-xl border border-border bg-background text-xs font-semibold text-foreground outline-none"
                >
                  <option value="Belum Magang">Belum Magang</option>
                  <option value="Sedang Magang">Sedang Magang</option>
                  <option value="Lulus">Lulus (Selesai PKL)</option>
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

      {/* MODAL 5: HAPUS KONFIRMASI */}
      {isDeleteOpen && activeSiswa && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-background shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="p-2.5 rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Hapus Data Siswa</h3>
                <p className="text-xs text-muted-foreground">Konfirmasi penghapusan data</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed mb-6">
              Apakah Anda yakin ingin menghapus data siswa <span className="font-bold text-foreground">{activeSiswa.name}</span>? Tindakan ini tidak dapat dibatalkan.
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
                Hapus Siswa
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: KREDENSIAL BARU */}
      {isCredentialOpen && createdCredentials && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-background shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2.5 text-emerald-600 mb-3">
              <div className="p-2 rounded-full bg-emerald-100">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">Akun Siswa Berhasil Dibuat</h3>
            </div>

            <p className="text-xs text-muted-foreground mb-4">
              Silakan salin kredensial login berikut untuk diberikan kepada siswa:
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
                id="btn-close-credential"
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
