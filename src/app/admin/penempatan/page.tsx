"use client";

import * as React from "react";
import {
  Briefcase,
  Plus,
  Search,
  Calendar,
  Building2,
  GraduationCap,
  User,
  Trash2,
  Edit2,
  MoreVertical,
  AlertTriangle,
  X,
  CheckCircle2,
  Clock,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getPenempatanList,
  getSiswaList,
  getDudiList,
  getGuruList,
  createPenempatan,
  updatePenempatan,
  deletePenempatan,
} from "@/lib/supabase/services";
import { useRealtimeTable } from "@/hooks/use-realtime";
import { Penempatan, Siswa, Dudi, Guru } from "@/types/database";

export default function PenempatanPage() {
  const [penempatanList, setPenempatanList] = React.useState<Penempatan[]>([]);
  const [siswaList, setSiswaList] = React.useState<Siswa[]>([]);
  const [dudiList, setDudiList] = React.useState<Dudi[]>([]);
  const [guruList, setGuruList] = React.useState<Guru[]>([]);

  const [search, setSearch] = React.useState("");
  const [filterDudi, setFilterDudi] = React.useState("Semua");
  const [filterStatus, setFilterStatus] = React.useState("Semua");
  const [loading, setLoading] = React.useState(true);

  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isStatusOpen, setIsStatusOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [activePenempatan, setActivePenempatan] = React.useState<Penempatan | null>(null);

  const [formData, setFormData] = React.useState({
    student_id: "",
    dudi_id: "",
    teacher_id: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    status: "Berlangsung" as "Berlangsung" | "Selesai" | "Dibatalkan",
  });

  const [statusValue, setStatusValue] = React.useState<"Berlangsung" | "Selesai">(
    "Berlangsung"
  );

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [openDropdownId, setOpenDropdownId] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      const [pData, sData, dData, gData] = await Promise.all([
        getPenempatanList(),
        getSiswaList(),
        getDudiList(),
        getGuruList(),
      ]);
      setPenempatanList(pData);
      setSiswaList(sData);
      setDudiList(dData);
      setGuruList(gData);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  useRealtimeTable("penempatan", loadData);

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!formData.student_id) errs.student_id = "Pilih siswa magang";
    if (!formData.dudi_id) errs.dudi_id = "Pilih mitra industri DUDI";
    if (!formData.teacher_id) errs.teacher_id = "Pilih guru pembimbing";
    if (!formData.start_date) errs.start_date = "Tanggal mulai wajib diisi";
    if (!formData.end_date) errs.end_date = "Tanggal selesai wajib diisi";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleOpenAdd = () => {
    setFormData({
      student_id: siswaList[0]?.id || "",
      dudi_id: dudiList[0]?.id || "",
      teacher_id: guruList[0]?.id || "",
      start_date: new Date().toISOString().split("T")[0],
      end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "Berlangsung",
    });
    setErrors({});
    setIsAddOpen(true);
  };

  const handleOpenEdit = (p: Penempatan) => {
    setActivePenempatan(p);
    setFormData({
      student_id: p.student_id,
      dudi_id: p.dudi_id,
      teacher_id: p.teacher_id,
      start_date: p.start_date,
      end_date: p.end_date,
      status: (p.status as any) || "Berlangsung",
    });
    setErrors({});
    setIsEditOpen(true);
    setOpenDropdownId(null);
  };

  const handleOpenStatus = (p: Penempatan) => {
    setActivePenempatan(p);
    setStatusValue(p.status === "Selesai" ? "Selesai" : "Berlangsung");
    setIsStatusOpen(true);
    setOpenDropdownId(null);
  };

  const handleOpenDelete = (p: Penempatan) => {
    setActivePenempatan(p);
    setIsDeleteOpen(true);
    setOpenDropdownId(null);
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await createPenempatan(formData);
      setIsAddOpen(false);
      toast.success("Penempatan magang berhasil dibuat", {
        description: "Status siswa telah otomatis diperbarui menjadi Sedang Magang.",
      });
      loadData();
    } catch (e) {
      toast.error("Gagal membuat penempatan");
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePenempatan || !validateForm()) return;

    try {
      await updatePenempatan(activePenempatan.id, {
        student_id: formData.student_id,
        dudi_id: formData.dudi_id,
        teacher_id: formData.teacher_id,
        start_date: formData.start_date,
        end_date: formData.end_date,
      });
      setIsEditOpen(false);
      toast.success("Data penempatan berhasil diperbarui");
      loadData();
    } catch (e) {
      toast.error("Gagal memperbarui penempatan");
    }
  };

  const handleSubmitStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePenempatan) return;

    try {
      await updatePenempatan(activePenempatan.id, {
        status: statusValue,
      });
      setIsStatusOpen(false);
      toast.success("Status penempatan magang berhasil diperbarui", {
        description: `Status penempatan diubah menjadi ${statusValue}.`,
      });
      loadData();
    } catch (e) {
      toast.error("Gagal mengubah status penempatan");
    }
  };

  const handleConfirmDelete = async () => {
    if (!activePenempatan) return;
    try {
      await deletePenempatan(activePenempatan.id);
      setIsDeleteOpen(false);
      toast.success("Penempatan magang berhasil dihapus");
      loadData();
    } catch (e) {
      toast.error("Gagal menghapus penempatan");
    }
  };

  const filteredPenempatan = penempatanList.filter((p) => {
    const studentName = p.student?.name || "";
    const studentClass = p.student?.class_name || "";
    const dudiName = p.dudi?.name || "";
    const teacherName = p.teacher?.name || "";
    const matchSearch =
      studentName.toLowerCase().includes(search.toLowerCase()) ||
      studentClass.toLowerCase().includes(search.toLowerCase()) ||
      dudiName.toLowerCase().includes(search.toLowerCase()) ||
      teacherName.toLowerCase().includes(search.toLowerCase());
    const matchDudi = filterDudi === "Semua" || p.dudi_id === filterDudi;
    const matchStatus = filterStatus === "Semua" || p.status === filterStatus;
    return matchSearch && matchDudi && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
            Penempatan Magang
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Plotting penugasan siswa SMK ke mitra industri bersama guru pembimbing.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2 shadow-sm font-bold">
          <Plus className="h-4 w-4" />
          <span>+ Plotting Magang</span>
        </Button>
      </div>

      {/* Filters: Shortened search input directly beside the filters */}
      <div className="flex flex-wrap items-center gap-3 bg-card p-4 rounded-2xl border border-border">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari siswa, kelas, atau industri..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 bg-muted/20 text-xs sm:text-sm w-full"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={filterDudi}
            onChange={(e) => setFilterDudi(e.target.value)}
            className="h-10 px-3 rounded-lg border border-border bg-background text-xs font-semibold text-foreground outline-none w-full sm:w-auto"
          >
            <option value="Semua">Semua Industri Mitra</option>
            {dudiList.map((d) => (
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
            <option value="Berlangsung">Berlangsung</option>
            <option value="Selesai">Selesai</option>
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
                <th className="px-5 py-3.5">Kelas</th>
                <th className="px-5 py-3.5">Industri Mitra (DUDI)</th>
                <th className="px-5 py-3.5">Guru Pembimbing</th>
                <th className="px-5 py-3.5">Periode Magang</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPenempatan.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <Briefcase className="h-9 w-9 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="font-semibold text-sm">Belum ada data penempatan aktif</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Klik &quot;+ Plotting Magang&quot; untuk menghubungkan siswa dengan DUDI.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPenempatan.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-bold text-foreground text-xs">
                        {p.student?.name || "Siswa"}
                      </p>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        NIS: {p.student?.nis || "-"}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-foreground bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md text-[11px]">
                        {p.student?.class_name || "-"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-foreground flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>{p.dudi?.name || "DUDI"}</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {p.dudi?.sector || "-"}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-foreground flex items-center gap-1.5">
                        <GraduationCap className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                        <span>{p.teacher?.name || "-"}</span>
                      </p>
                    </td>
                    <td className="px-5 py-4 font-mono text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {p.start_date} s/d {p.end_date}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status === "Berlangsung"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : p.status === "Selesai"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right relative">
                      <button
                        onClick={() =>
                          setOpenDropdownId(openDropdownId === p.id ? null : p.id)
                        }
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {openDropdownId === p.id && (
                        <div className="absolute right-5 top-12 z-20 w-44 rounded-xl border border-border bg-background shadow-xl p-1 text-left animate-in fade-in zoom-in-95">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg hover:bg-muted text-foreground transition-colors"
                          >
                            <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>Edit Data</span>
                          </button>
                          <button
                            onClick={() => handleOpenStatus(p)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                            <span>Ubah Status</span>
                          </button>
                          <button
                            onClick={() => handleOpenDelete(p)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Hapus Penempatan</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: TAMBAH PENEMPATAN */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-background shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Plotting Penempatan Magang</h3>
                <p className="text-xs text-muted-foreground">
                  Hubungkan siswa ke mitra industri dan tentukan guru pembimbing
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
                  Pilih Siswa *
                </label>
                {siswaList.length === 0 ? (
                  <p className="text-xs text-amber-600">Belum ada data siswa.</p>
                ) : (
                  <select
                    value={formData.student_id}
                    onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                    className="w-full h-11 px-3 rounded-lg border border-border bg-background text-xs font-semibold text-foreground outline-none"
                  >
                    <option value="">-- Pilih Siswa --</option>
                    {siswaList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.class_name} - NIS: {s.nis})
                      </option>
                    ))}
                  </select>
                )}
                {errors.student_id && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.student_id}</p>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Pilih Mitra DUDI *
                </label>
                {dudiList.length === 0 ? (
                  <p className="text-xs text-amber-600">Belum ada data mitra industri.</p>
                ) : (
                  <select
                    value={formData.dudi_id}
                    onChange={(e) => setFormData({ ...formData, dudi_id: e.target.value })}
                    className="w-full h-11 px-3 rounded-lg border border-border bg-background text-xs font-semibold text-foreground outline-none"
                  >
                    <option value="">-- Pilih Mitra DUDI --</option>
                    {dudiList.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.sector} - Kuota: {d.quota})
                      </option>
                    ))}
                  </select>
                )}
                {errors.dudi_id && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.dudi_id}</p>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Pilih Guru Pembimbing *
                </label>
                {guruList.length === 0 ? (
                  <p className="text-xs text-amber-600">Belum ada data guru pembimbing.</p>
                ) : (
                  <select
                    value={formData.teacher_id}
                    onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                    className="w-full h-11 px-3 rounded-lg border border-border bg-background text-xs font-semibold text-foreground outline-none"
                  >
                    <option value="">-- Pilih Guru Pembimbing --</option>
                    {guruList.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.department})
                      </option>
                    ))}
                  </select>
                )}
                {errors.teacher_id && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.teacher_id}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                    Tanggal Mulai Magang *
                  </label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className={errors.start_date ? "border-red-500" : ""}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                    Tanggal Selesai Magang *
                  </label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className={errors.end_date ? "border-red-500" : ""}
                  />
                </div>
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
                  Simpan Penempatan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT DATA PENEMPATAN */}
      {isEditOpen && activePenempatan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-background shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Edit Data Penempatan</h3>
                <p className="text-xs text-muted-foreground">
                  Perbarui DUDI, guru pembimbing, atau tanggal penugasan
                </p>
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
                  Siswa Magang
                </label>
                <select
                  value={formData.student_id}
                  onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                  className="w-full h-11 px-3 rounded-lg border border-border bg-background text-xs font-semibold text-foreground outline-none"
                >
                  {siswaList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.class_name} - NIS: {s.nis})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Mitra Industri (DUDI) *
                </label>
                <select
                  value={formData.dudi_id}
                  onChange={(e) => setFormData({ ...formData, dudi_id: e.target.value })}
                  className="w-full h-11 px-3 rounded-lg border border-border bg-background text-xs font-semibold text-foreground outline-none"
                >
                  {dudiList.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.sector})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Guru Pembimbing *
                </label>
                <select
                  value={formData.teacher_id}
                  onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                  className="w-full h-11 px-3 rounded-lg border border-border bg-background text-xs font-semibold text-foreground outline-none"
                >
                  {guruList.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.department})
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
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                    Tanggal Selesai
                  </label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
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

      {/* MODAL 3: UBAH STATUS PENEMPATAN (Berlangsung & Selesai) */}
      {isStatusOpen && activePenempatan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-background shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Ubah Status Penempatan</h3>
                <p className="text-xs text-muted-foreground">
                  {activePenempatan.student?.name} di {activePenempatan.dudi?.name}
                </p>
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
                    setStatusValue(e.target.value as "Berlangsung" | "Selesai")
                  }
                  className="w-full h-11 px-3 rounded-xl border border-border bg-background text-xs font-semibold text-foreground outline-none"
                >
                  <option value="Berlangsung">Berlangsung</option>
                  <option value="Selesai">Selesai</option>
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
      {isDeleteOpen && activePenempatan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-background shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="p-2.5 rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Hapus Penempatan Magang</h3>
                <p className="text-xs text-muted-foreground">Konfirmasi pembatalan penempatan</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed mb-6">
              Apakah Anda yakin ingin menghapus data penempatan untuk siswa{" "}
              <span className="font-bold text-foreground">
                {activePenempatan.student?.name}
              </span>{" "}
              di mitra{" "}
              <span className="font-bold text-foreground">
                {activePenempatan.dudi?.name}
              </span>
              ? Status siswa akan dikembalikan menjadi Belum Magang.
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
                Hapus Penempatan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
