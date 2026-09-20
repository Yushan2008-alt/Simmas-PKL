import { supabase } from "./client";
import {
  Guru,
  Siswa,
  Dudi,
  Penempatan,
  Absensi,
  AbsensiStatus,
  Jurnal,
  JurnalStatus,
  Kunjungan,
  KunjunganStatus,
  PengajuanMagang,
  PengajuanStatus,
  SystemSettings,
  AuditLog,
} from "@/types/database";

const isLiveSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return url && !url.includes("placeholder") && !url.includes("simmas-preview");
};

// Helper for persistent local fallback
const getInitialData = <T>(key: string, defaultValue: T): T => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(`simmas_${key}`);
      if (stored) return JSON.parse(stored);
    } catch {}
  }
  return defaultValue;
};

const saveFallback = (key: string, data: any) => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`simmas_${key}`, JSON.stringify(data));
    } catch {}
  }
};

// Initial seed data
const initialGuru: Guru[] = [
  {
    id: "g-01",
    nip: "198501012010011005",
    name: "Dr. Budi Santoso, M.Kom",
    email: "guru@simmas.sch.id",
    phone: "081234567890",
    department: "Teknik Komputer & Jaringan",
    status: "Aktif",
    created_at: new Date().toISOString(),
  },
];

const initialSiswa: Siswa[] = [
  {
    id: "s-01",
    nis: "21221001",
    name: "Ahmad Zaki Pratama",
    email: "siswa@simmas.sch.id",
    class_name: "XII RPL 1",
    status: "Belum Magang",
    created_at: new Date().toISOString(),
  },
  {
    id: "s-02",
    nis: "21221002",
    name: "Siti Nurhaliza",
    email: "siti@smkn1-sby.sch.id",
    class_name: "XII RPL 1",
    status: "Sedang Magang",
    created_at: new Date().toISOString(),
  },
  {
    id: "s-03",
    nis: "21221003",
    name: "Rizky Ramadhan",
    email: "rizky@smkn1-sby.sch.id",
    class_name: "XII TKJ 2",
    status: "Sedang Magang",
    created_at: new Date().toISOString(),
  },
  {
    id: "s-04",
    nis: "21221004",
    name: "Maya Anggraini",
    email: "maya@smkn1-sby.sch.id",
    class_name: "XII RPL 2",
    status: "Sedang Magang",
    created_at: new Date().toISOString(),
  },
];

const initialDudi: Dudi[] = [
  {
    id: "d-01",
    name: "PT Telkom Indonesia",
    address: "Jl. Ketintang No. 156, Surabaya",
    pic_name: "Rina Wijaya",
    pic_phone: "081234567891",
    sector: "Teknologi Informasi & Jaringan",
    quota: 4,
    status: "Terverifikasi",
    created_at: new Date().toISOString(),
  },
  {
    id: "d-02",
    name: "PT Astra Motor",
    address: "Jl. Basuki Rahmat, Surabaya",
    pic_name: "Bambang",
    pic_phone: "081298765432",
    sector: "Otomotif",
    quota: 3,
    status: "Terverifikasi",
    created_at: new Date().toISOString(),
  },
];

const initialPenempatan: Penempatan[] = [
  {
    id: "p-01",
    student_id: "s-01",
    dudi_id: "d-01",
    teacher_id: "g-01",
    start_date: "2026-08-01",
    end_date: "2026-11-30",
    status: "Berlangsung",
    created_at: new Date().toISOString(),
    student: initialSiswa[0],
    dudi: initialDudi[0],
    teacher: initialGuru[0],
  },
  {
    id: "p-02",
    student_id: "s-02",
    dudi_id: "d-01",
    teacher_id: "g-01",
    start_date: "2026-08-01",
    end_date: "2026-11-30",
    status: "Berlangsung",
    created_at: new Date().toISOString(),
    student: initialSiswa[1],
    dudi: initialDudi[0],
    teacher: initialGuru[0],
  },
  {
    id: "p-03",
    student_id: "s-03",
    dudi_id: "d-02",
    teacher_id: "g-01",
    start_date: "2026-08-15",
    end_date: "2026-11-15",
    status: "Berlangsung",
    created_at: new Date().toISOString(),
    student: initialSiswa[2],
    dudi: initialDudi[1],
    teacher: initialGuru[0],
  },
  {
    id: "p-04",
    student_id: "s-04",
    dudi_id: "d-02",
    teacher_id: "g-01",
    start_date: "2026-08-15",
    end_date: "2026-11-15",
    status: "Berlangsung",
    created_at: new Date().toISOString(),
    student: initialSiswa[3],
    dudi: initialDudi[1],
    teacher: initialGuru[0],
  },
];

const initialKunjungan: Kunjungan[] = [
  {
    id: "k-01",
    teacher_id: "g-01",
    dudi_id: "d-01",
    date: "2026-09-22",
    status: "Terjadwal",
    notes: "Monitoring rutin perkembangan siswa bimbingan divisi IT dan koordinasi dengan Ibu Rina Wijaya.",
    created_at: new Date().toISOString(),
    teacher: initialGuru[0],
    dudi: initialDudi[0],
  },
  {
    id: "k-02",
    teacher_id: "g-01",
    dudi_id: "d-02",
    date: "2026-09-08",
    status: "Selesai",
    notes: "Evaluasi adaptasi siswa di bengkel perakitan. Seluruh siswa bimbingan aktif dan mematuhi SOP K3.",
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    teacher: initialGuru[0],
    dudi: initialDudi[1],
  },
];

const initialJurnal: Jurnal[] = [
  {
    id: "j-01",
    student_id: "s-01",
    date: "2026-09-16",
    activity: "Mengerjakan modul autentikasi JWT dan pengujian endpoint REST API dengan Postman.",
    status: "Pending",
    created_at: new Date().toISOString(),
    student: initialSiswa[0],
  },
  {
    id: "j-02",
    student_id: "s-02",
    date: "2026-09-16",
    activity: "Konfigurasi routing static dan dynamic pada switch access lantai 2 gedung utama.",
    status: "Pending",
    created_at: new Date().toISOString(),
    student: initialSiswa[1],
  },
  {
    id: "j-03",
    student_id: "s-03",
    date: "2026-09-15",
    activity: "Membantu inspeksi komponen rem hidrolik dan penggantian fluida rem sepeda motor matic.",
    status: "Disetujui",
    teacher_feedback: "Pekerjaan sesuai SOP bengkel. Bagus, pertahankan!",
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    student: initialSiswa[2],
  },
  {
    id: "j-04",
    student_id: "s-04",
    date: "2026-09-14",
    activity: "Pemeriksaan kabel body dan sistem pengisian baterai kendaraan roda dua.",
    status: "Disetujui",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    student: initialSiswa[3],
  },
  {
    id: "j-05",
    student_id: "s-01",
    date: "2026-09-13",
    activity: "Troubleshooting query database lambat di server staging internal.",
    status: "Perlu Revisi",
    teacher_feedback: "Mohon sertakan screenshot explain query dan metrik latensi yang dioptimasi.",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    student: initialSiswa[0],
  },
];

const initialAbsensi: Absensi[] = [
  { id: "a-01", student_id: "s-01", date: "2026-09-16", status: "Hadir", check_in_time: "07:55", created_at: new Date().toISOString() },
  { id: "a-02", student_id: "s-01", date: "2026-09-15", status: "Hadir", check_in_time: "07:50", created_at: new Date().toISOString() },
  { id: "a-03", student_id: "s-01", date: "2026-09-14", status: "Hadir", check_in_time: "07:58", created_at: new Date().toISOString() },
  { id: "a-04", student_id: "s-01", date: "2026-09-13", status: "Hadir", check_in_time: "08:02", created_at: new Date().toISOString() },
  { id: "a-05", student_id: "s-02", date: "2026-09-16", status: "Hadir", check_in_time: "07:45", created_at: new Date().toISOString() },
  { id: "a-06", student_id: "s-02", date: "2026-09-15", status: "Hadir", check_in_time: "07:48", created_at: new Date().toISOString() },
  { id: "a-07", student_id: "s-02", date: "2026-09-14", status: "Sakit", notes: "Demam dan flu", created_at: new Date().toISOString() },
  { id: "a-08", student_id: "s-03", date: "2026-09-16", status: "Hadir", check_in_time: "07:30", created_at: new Date().toISOString() },
  { id: "a-09", student_id: "s-03", date: "2026-09-15", status: "Izin", notes: "Urusan keluarga", created_at: new Date().toISOString() },
  { id: "a-10", student_id: "s-03", date: "2026-09-14", status: "Alfa", created_at: new Date().toISOString() },
  { id: "a-11", student_id: "s-04", date: "2026-09-16", status: "Hadir", check_in_time: "07:40", created_at: new Date().toISOString() },
  { id: "a-12", student_id: "s-04", date: "2026-09-15", status: "Hadir", check_in_time: "07:42", created_at: new Date().toISOString() },
];

const initialLogs: AuditLog[] = [
  {
    id: "log-01",
    action: "PENEMPATAN_CREATED",
    target: "Ahmad Zaki Pratama → PT Telkom Indonesia",
    actor_email: "admin@simmas.sch.id",
    actor_role: "Admin",
    level: "INFO",
    ip_address: "127.0.0.1",
    created_at: new Date().toISOString(),
  },
  {
    id: "log-02",
    action: "LOGIN_SUCCESS",
    target: "AUTH",
    actor_email: "admin@simmas.sch.id",
    actor_role: "Admin",
    level: "INFO",
    ip_address: "127.0.0.1",
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
];

const initialPengajuan: PengajuanMagang[] = [
  {
    id: "peng-01",
    student_id: "s-01",
    dudi_id: "d-01",
    position: "Mobile Developer",
    start_date: "2026-10-01",
    end_date: "2026-12-31",
    notes: "Pengajuan magang di divisi Mobile & Cloud Solutions PT Telkom Indonesia.",
    status: "Menunggu Verifikasi",
    created_at: new Date().toISOString(),
    student: initialSiswa[0],
    dudi: initialDudi[0],
  },
];

let fallbackGuru: Guru[] = getInitialData("guru", initialGuru);
let fallbackSiswa: Siswa[] = getInitialData("siswa", initialSiswa);
let fallbackDudi: Dudi[] = getInitialData("dudi", initialDudi);
let fallbackPenempatan: Penempatan[] = getInitialData("penempatan", initialPenempatan);
let fallbackKunjungan: Kunjungan[] = getInitialData("kunjungan", initialKunjungan);
let fallbackJurnal: Jurnal[] = getInitialData("jurnal", initialJurnal);
let fallbackAbsensi: Absensi[] = getInitialData("absensi", initialAbsensi);
let fallbackPengajuan: PengajuanMagang[] = getInitialData("pengajuan", initialPengajuan);
let fallbackLogs: AuditLog[] = getInitialData("audit_logs", initialLogs);
let fallbackSettings: SystemSettings = {
  general: {
    appName: "SIMMAS",
    appDescription: "Sistem Informasi Manajemen Magang Siswa",
    contactEmail: "info@simmas.sch.id",
  },
  landing: {
    heroTitle: "Magang\nlebih\nteratur.",
    heroSubtitle: "Sistem Informasi Manajemen Magang Siswa",
    heroDescription:
      "Platform manajemen magang siswa SMK yang menghubungkan sekolah, guru pembimbing, dan dunia usaha dalam satu sistem terpadu.",
  },
  school: {
    schoolName: "SMK Negeri 1 Surabaya",
    schoolAddress: "Jl. SMEA No. 4, Wonokromo, Surabaya",
    schoolPhone: "(031) 8292038",
    schoolWebsite: "www.smkn1-sby.sch.id",
    principalName: "Drs. H. Sugiyono, M.Pd.",
    principalNip: "196503151989031008",
  },
};

// Helper: Log Action
export async function logAudit(
  action: string,
  target: string,
  level: "INFO" | "WARNING" | "ERROR" = "INFO",
  details?: Record<string, any>
) {
  const newLog: AuditLog = {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    action,
    target,
    actor_email: "admin@simmas.sch.id",
    actor_role: "Admin",
    level,
    ip_address: "127.0.0.1",
    details,
    created_at: new Date().toISOString(),
  };

  if (isLiveSupabase()) {
    try {
      await supabase.from("audit_logs").insert([newLog]);
    } catch (e) {
      console.warn("Audit log insert fallback:", e);
    }
  }
  fallbackLogs.unshift(newLog);
}

// ==========================================
// GURU SERVICES
// ==========================================
export async function getGuruList(): Promise<Guru[]> {
  if (isLiveSupabase()) {
    try {
      const { data, error } = await supabase
        .from("guru")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) return data as Guru[];
    } catch (e) {
      console.warn("Fetch guru from live Supabase error:", e);
    }
  }
  return [...fallbackGuru];
}

export async function createGuru(input: Omit<Guru, "id" | "created_at">): Promise<Guru> {
  const newGuru: Guru = {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    ...input,
    created_at: new Date().toISOString(),
  };

  if (isLiveSupabase()) {
    try {
      const { data, error } = await supabase.from("guru").insert([newGuru]).select().single();
      if (!error && data) {
        await logAudit("GURU_CREATED", newGuru.name, "INFO", { nip: newGuru.nip });
        return data as Guru;
      }
    } catch (e) {
      console.warn("Create guru live error:", e);
    }
  }

  fallbackGuru.unshift(newGuru);
  await logAudit("GURU_CREATED", newGuru.name, "INFO", { nip: newGuru.nip });
  return newGuru;
}

export async function updateGuru(id: string, updates: Partial<Guru>): Promise<Guru | null> {
  if (isLiveSupabase()) {
    try {
      const { data, error } = await supabase
        .from("guru")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (!error && data) {
        await logAudit("GURU_UPDATED", updates.name || id, "INFO", updates);
        return data as Guru;
      }
    } catch (e) {
      console.warn("Update guru live error:", e);
    }
  }

  const idx = fallbackGuru.findIndex((g) => g.id === id);
  if (idx !== -1) {
    fallbackGuru[idx] = { ...fallbackGuru[idx], ...updates, updated_at: new Date().toISOString() };
    await logAudit("GURU_UPDATED", fallbackGuru[idx].name, "INFO", updates);
    return fallbackGuru[idx];
  }
  return null;
}

export async function deleteGuru(id: string): Promise<boolean> {
  let targetName = id;
  if (isLiveSupabase()) {
    try {
      const { error } = await supabase.from("guru").delete().eq("id", id);
      if (!error) {
        await logAudit("GURU_DELETED", targetName, "WARNING");
        return true;
      }
    } catch (e) {
      console.warn("Delete guru live error:", e);
    }
  }

  const found = fallbackGuru.find((g) => g.id === id);
  if (found) targetName = found.name;
  fallbackGuru = fallbackGuru.filter((g) => g.id !== id);
  await logAudit("GURU_DELETED", targetName, "WARNING");
  return true;
}

// ==========================================
// SISWA SERVICES
// ==========================================
export async function getSiswaList(): Promise<Siswa[]> {
  if (isLiveSupabase()) {
    try {
      const { data, error } = await supabase
        .from("siswa")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) return data as Siswa[];
    } catch (e) {
      console.warn("Fetch siswa live error:", e);
    }
  }
  return [...fallbackSiswa];
}

export async function createSiswa(input: Omit<Siswa, "id" | "created_at">): Promise<Siswa> {
  const newSiswa: Siswa = {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    ...input,
    created_at: new Date().toISOString(),
  };

  if (isLiveSupabase()) {
    try {
      const { data, error } = await supabase.from("siswa").insert([newSiswa]).select().single();
      if (!error && data) {
        await logAudit("SISWA_CREATED", newSiswa.name, "INFO", { nis: newSiswa.nis });
        return data as Siswa;
      }
    } catch (e) {
      console.warn("Create siswa live error:", e);
    }
  }

  fallbackSiswa.unshift(newSiswa);
  await logAudit("SISWA_CREATED", newSiswa.name, "INFO", { nis: newSiswa.nis });
  return newSiswa;
}

export async function updateSiswa(id: string, updates: Partial<Siswa>): Promise<Siswa | null> {
  if (isLiveSupabase()) {
    try {
      const { data, error } = await supabase
        .from("siswa")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (!error && data) {
        await logAudit("SISWA_UPDATED", updates.name || id, "INFO", updates);
        return data as Siswa;
      }
    } catch (e) {
      console.warn("Update siswa live error:", e);
    }
  }

  const idx = fallbackSiswa.findIndex((s) => s.id === id);
  if (idx !== -1) {
    fallbackSiswa[idx] = { ...fallbackSiswa[idx], ...updates, updated_at: new Date().toISOString() };
    await logAudit("SISWA_UPDATED", fallbackSiswa[idx].name, "INFO", updates);
    return fallbackSiswa[idx];
  }
  return null;
}

export async function deleteSiswa(id: string): Promise<boolean> {
  let targetName = id;
  if (isLiveSupabase()) {
    try {
      const { error } = await supabase.from("siswa").delete().eq("id", id);
      if (!error) {
        await logAudit("SISWA_DELETED", targetName, "WARNING");
        return true;
      }
    } catch (e) {
      console.warn("Delete siswa live error:", e);
    }
  }

  const found = fallbackSiswa.find((s) => s.id === id);
  if (found) targetName = found.name;
  fallbackSiswa = fallbackSiswa.filter((s) => s.id !== id);
  await logAudit("SISWA_DELETED", targetName, "WARNING");
  return true;
}

// ==========================================
// DUDI SERVICES
// ==========================================
export async function getDudiList(): Promise<Dudi[]> {
  if (isLiveSupabase()) {
    try {
      const { data, error } = await supabase
        .from("dudi")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) return data as Dudi[];
    } catch (e) {
      console.warn("Fetch dudi live error:", e);
    }
  }
  return [...fallbackDudi];
}

export async function createDudi(input: Omit<Dudi, "id" | "created_at">): Promise<Dudi> {
  const newDudi: Dudi = {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    ...input,
    created_at: new Date().toISOString(),
  };

  if (isLiveSupabase()) {
    try {
      const { data, error } = await supabase.from("dudi").insert([newDudi]).select().single();
      if (!error && data) {
        await logAudit("DUDI_CREATED", newDudi.name, "INFO", { sector: newDudi.sector });
        return data as Dudi;
      }
    } catch (e) {
      console.warn("Create dudi live error:", e);
    }
  }

  fallbackDudi.unshift(newDudi);
  await logAudit("DUDI_CREATED", newDudi.name, "INFO", { sector: newDudi.sector });
  return newDudi;
}

export async function updateDudi(id: string, updates: Partial<Dudi>): Promise<Dudi | null> {
  if (isLiveSupabase()) {
    try {
      const { data, error } = await supabase
        .from("dudi")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (!error && data) {
        await logAudit("DUDI_UPDATED", updates.name || id, "INFO", updates);
        return data as Dudi;
      }
    } catch (e) {
      console.warn("Update dudi live error:", e);
    }
  }

  const idx = fallbackDudi.findIndex((d) => d.id === id);
  if (idx !== -1) {
    fallbackDudi[idx] = { ...fallbackDudi[idx], ...updates, updated_at: new Date().toISOString() };
    await logAudit("DUDI_UPDATED", fallbackDudi[idx].name, "INFO", updates);
    return fallbackDudi[idx];
  }
  return null;
}

export async function deleteDudi(id: string): Promise<boolean> {
  let targetName = id;
  if (isLiveSupabase()) {
    try {
      const { error } = await supabase.from("dudi").delete().eq("id", id);
      if (!error) {
        await logAudit("DUDI_DELETED", targetName, "WARNING");
        return true;
      }
    } catch (e) {
      console.warn("Delete dudi live error:", e);
    }
  }

  const found = fallbackDudi.find((d) => d.id === id);
  if (found) targetName = found.name;
  fallbackDudi = fallbackDudi.filter((d) => d.id !== id);
  await logAudit("DUDI_DELETED", targetName, "WARNING");
  return true;
}

// ==========================================
// PENEMPATAN SERVICES
// ==========================================
export async function getPenempatanList(): Promise<Penempatan[]> {
  if (isLiveSupabase()) {
    try {
      const { data, error } = await supabase
        .from("penempatan")
        .select(`
          *,
          student:siswa(*),
          dudi:dudi(*),
          teacher:guru(*)
        `)
        .order("created_at", { ascending: false });
      if (!error && data) return data as Penempatan[];
    } catch (e) {
      console.warn("Fetch penempatan live error:", e);
    }
  }
  return [...fallbackPenempatan];
}

export async function createPenempatan(
  input: Omit<Penempatan, "id" | "created_at" | "student" | "dudi" | "teacher">
): Promise<Penempatan> {
  const newPenempatan: Penempatan = {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    ...input,
    created_at: new Date().toISOString(),
  };

  if (isLiveSupabase()) {
    try {
      const { data, error } = await supabase
        .from("penempatan")
        .insert([newPenempatan])
        .select(`
          *,
          student:siswa(*),
          dudi:dudi(*),
          teacher:guru(*)
        `)
        .single();
      if (!error && data) {
        // Automatically update student status to 'Sedang Magang'
        await updateSiswa(input.student_id, { status: "Sedang Magang" });
        await logAudit("PENEMPATAN_CREATED", input.student_id, "INFO");
        return data as Penempatan;
      }
    } catch (e) {
      console.warn("Create penempatan live error:", e);
    }
  }

  // Populate relations in fallback
  const student = fallbackSiswa.find((s) => s.id === input.student_id);
  const dudi = fallbackDudi.find((d) => d.id === input.dudi_id);
  const teacher = fallbackGuru.find((g) => g.id === input.teacher_id);
  newPenempatan.student = student;
  newPenempatan.dudi = dudi;
  newPenempatan.teacher = teacher;

  if (student) {
    student.status = "Sedang Magang";
  }

  fallbackPenempatan.unshift(newPenempatan);
  await logAudit("PENEMPATAN_CREATED", student?.name || input.student_id, "INFO");
  return newPenempatan;
}

export async function deletePenempatan(id: string): Promise<boolean> {
  const item = fallbackPenempatan.find((p) => p.id === id);
  if (item?.student_id) {
    await updateSiswa(item.student_id, { status: "Belum Magang" });
  }

  if (isLiveSupabase()) {
    try {
      await supabase.from("penempatan").delete().eq("id", id);
      await logAudit("PENEMPATAN_DELETED", id, "WARNING");
      return true;
    } catch (e) {
      console.warn("Delete penempatan live error:", e);
    }
  }

  fallbackPenempatan = fallbackPenempatan.filter((p) => p.id !== id);
  await logAudit("PENEMPATAN_DELETED", id, "WARNING");
  return true;
}

export async function updatePenempatan(
  id: string,
  updates: Partial<Penempatan>
): Promise<Penempatan | null> {
  if (isLiveSupabase()) {
    try {
      const { data, error } = await supabase
        .from("penempatan")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select(`
          *,
          student:siswa(*),
          dudi:dudi(*),
          teacher:guru(*)
        `)
        .single();
      if (!error && data) {
        if (updates.status === "Selesai" && data.student_id) {
          await updateSiswa(data.student_id, { status: "Selesai Magang" });
        } else if (updates.status === "Berlangsung" && data.student_id) {
          await updateSiswa(data.student_id, { status: "Sedang Magang" });
        }
        await logAudit("PENEMPATAN_UPDATED", id, "INFO", updates);
        return data as Penempatan;
      }
    } catch (e) {
      console.warn("Update penempatan live error:", e);
    }
  }

  const idx = fallbackPenempatan.findIndex((p) => p.id === id);
  if (idx !== -1) {
    fallbackPenempatan[idx] = {
      ...fallbackPenempatan[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    if (updates.student_id) {
      fallbackPenempatan[idx].student =
        fallbackSiswa.find((s) => s.id === updates.student_id) || fallbackPenempatan[idx].student;
    }
    if (updates.dudi_id) {
      fallbackPenempatan[idx].dudi =
        fallbackDudi.find((d) => d.id === updates.dudi_id) || fallbackPenempatan[idx].dudi;
    }
    if (updates.teacher_id) {
      fallbackPenempatan[idx].teacher =
        fallbackGuru.find((g) => g.id === updates.teacher_id) || fallbackPenempatan[idx].teacher;
    }
    if (updates.status === "Selesai" && fallbackPenempatan[idx].student_id) {
      await updateSiswa(fallbackPenempatan[idx].student_id, { status: "Selesai Magang" });
    } else if (updates.status === "Berlangsung" && fallbackPenempatan[idx].student_id) {
      await updateSiswa(fallbackPenempatan[idx].student_id, { status: "Sedang Magang" });
    }
    await logAudit("PENEMPATAN_UPDATED", id, "INFO", updates);
    return fallbackPenempatan[idx];
  }
  return null;
}

// ==========================================
// SYSTEM SETTINGS SERVICES
// ==========================================
export async function getSystemSettings(): Promise<SystemSettings> {
  if (isLiveSupabase()) {
    try {
      const { data, error } = await supabase.from("system_settings").select("*");
      if (!error && data && data.length > 0) {
        const settingsMap: any = { ...fallbackSettings };
        data.forEach((row) => {
          if (row.key && row.value) {
            settingsMap[row.key] = row.value;
          }
        });
        return settingsMap as SystemSettings;
      }
    } catch (e) {
      console.warn("Fetch settings live error:", e);
    }
  }
  return { ...fallbackSettings };
}

export async function updateSystemSettings(
  key: keyof SystemSettings,
  value: any
): Promise<boolean> {
  fallbackSettings[key] = value;
  if (isLiveSupabase()) {
    try {
      await supabase
        .from("system_settings")
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
      await logAudit("SETTINGS_UPDATED", key, "INFO");
      return true;
    } catch (e) {
      console.warn("Update settings live error:", e);
    }
  }
  await logAudit("SETTINGS_UPDATED", key, "INFO");
  return true;
}

// ==========================================
// AUDIT LOGS SERVICES
// ==========================================
export async function getAuditLogs(): Promise<AuditLog[]> {
  if (isLiveSupabase()) {
    try {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (!error && data) return data as AuditLog[];
    } catch (e) {
      console.warn("Fetch audit logs live error:", e);
    }
  }
  return [...fallbackLogs];
}

export async function clearAuditLogs(): Promise<boolean> {
  if (isLiveSupabase()) {
    try {
      await supabase.from("audit_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    } catch (e) {
      console.warn("Clear audit logs live error:", e);
    }
  }
  fallbackLogs = [];
  return true;
}

// ==========================================
// GURU & BIMBINGAN SERVICES
// ==========================================
export function generateCredentialsFromName(name: string): { email: string; password: string } {
  // First clean compound degrees with dots like m.kom, s.pd, etc.
  let cleaned = name.replace(/(^|\s)(m\.kom|s\.kom|s\.pd|m\.pd|s\.t|m\.t|m\.sc|b\.sc|m\.si|s\.si|ph\.d)($|\s|,|\.)/gi, " ");

  // Replace punctuation
  cleaned = cleaned.replace(/[.,\-_/()]/g, " ");

  // Title tokens (single words or acronyms)
  const titles = new Set([
    "dr", "dra", "drs", "prof", "h", "hj", "ir", "se", "ak", "mm",
    "mkom", "skom", "spd", "mpd", "st", "mt", "msc", "bsc", "msi", "ssi", "phd"
  ]);

  const words = cleaned
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z0-9]/g, "").trim())
    .filter((w) => w.length > 0 && !titles.has(w.toLowerCase()));

  if (words.length === 0) {
    const fallback = name.toLowerCase().replace(/[^a-z0-9]/g, "") || "user";
    return {
      email: `${fallback}@simmas.sch.id`,
      password: fallback,
    };
  }

  const firstName = words[0].toLowerCase();
  const lastName = words.length > 1 ? words[words.length - 1].toLowerCase() : "";

  const email = lastName ? `${firstName}.${lastName}@simmas.sch.id` : `${firstName}@simmas.sch.id`;
  const password = lastName ? `${firstName}${lastName}` : firstName;

  return { email, password };
}

export function getActiveGuru(): Guru {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("simmas_current_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.role === "Guru") {
          if (parsed.rawUser) return parsed.rawUser as Guru;
          const found = fallbackGuru.find(
            (g) => g.id === parsed.id || g.email.toLowerCase() === (parsed.email || "").toLowerCase()
          );
          if (found) return found;
          return {
            id: parsed.id,
            nip: parsed.nip || "198501012010011005",
            name: parsed.name,
            email: parsed.email,
            department: parsed.department || "Rekayasa Perangkat Lunak",
            status: "Aktif",
            created_at: new Date().toISOString(),
          };
        }
      }
    } catch {}
  }

  return (
    fallbackGuru.find((g) => g.id === "g-01" || g.email === "guru@simmas.sch.id") ||
    fallbackGuru[0] || {
      id: "g-01",
      nip: "198501012010011005",
      name: "Dr. Budi Santoso, M.Kom",
      email: "guru@simmas.sch.id",
      department: "Teknik Komputer & Jaringan",
      status: "Aktif",
      created_at: new Date().toISOString(),
    }
  );
}

// ==========================================
// KUNJUNGAN LAPANGAN SERVICES
// ==========================================
export async function getKunjunganList(teacherId?: string): Promise<Kunjungan[]> {
  if (isLiveSupabase()) {
    try {
      let query = supabase
        .from("kunjungan")
        .select(`
          *,
          teacher:guru(*),
          dudi:dudi(*)
        `)
        .order("date", { ascending: false });

      if (teacherId) {
        query = query.eq("teacher_id", teacherId);
      }

      const { data, error } = await query;
      if (!error && data) return data as Kunjungan[];
    } catch (e) {
      console.warn("Fetch kunjungan live error:", e);
    }
  }

  // Fallback
  let items = [...fallbackKunjungan];
  if (teacherId) {
    items = items.filter((k) => k.teacher_id === teacherId);
  }

  // Populate relations
  return items.map((k) => ({
    ...k,
    teacher: fallbackGuru.find((g) => g.id === k.teacher_id) || k.teacher,
    dudi: fallbackDudi.find((d) => d.id === k.dudi_id) || k.dudi,
  }));
}

export async function createKunjungan(
  input: Omit<Kunjungan, "id" | "created_at" | "teacher" | "dudi">
): Promise<Kunjungan> {
  const newKunjungan: Kunjungan = {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `k-${Date.now()}`,
    ...input,
    created_at: new Date().toISOString(),
  };

  const dudi = fallbackDudi.find((d) => d.id === input.dudi_id);
  const teacher = fallbackGuru.find((g) => g.id === input.teacher_id);
  newKunjungan.dudi = dudi;
  newKunjungan.teacher = teacher;

  if (isLiveSupabase()) {
    try {
      const { data, error } = await supabase
        .from("kunjungan")
        .insert([{
          id: newKunjungan.id,
          teacher_id: input.teacher_id,
          dudi_id: input.dudi_id,
          date: input.date,
          status: input.status,
          notes: input.notes,
          created_at: newKunjungan.created_at,
        }])
        .select("*, teacher:guru(*), dudi:dudi(*)")
        .single();

      if (!error && data) {
        fallbackKunjungan.unshift(data as Kunjungan);
        saveFallback("kunjungan", fallbackKunjungan);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("simmas_kunjungan_updated"));
        }
        await logAudit("KUNJUNGAN_CREATED", dudi?.name || input.dudi_id, "INFO");
        return data as Kunjungan;
      }
    } catch (e) {
      console.warn("Create kunjungan live error:", e);
    }
  }

  fallbackKunjungan.unshift(newKunjungan);
  saveFallback("kunjungan", fallbackKunjungan);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("simmas_kunjungan_updated"));
  }
  await logAudit("KUNJUNGAN_CREATED", dudi?.name || input.dudi_id, "INFO");
  return newKunjungan;
}

export async function updateKunjungan(
  id: string,
  updates: Partial<Kunjungan>
): Promise<Kunjungan | null> {
  const index = fallbackKunjungan.findIndex((k) => k.id === id);
  if (index === -1) return null;

  const updated: Kunjungan = {
    ...fallbackKunjungan[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };

  if (isLiveSupabase()) {
    try {
      const { data, error } = await supabase
        .from("kunjungan")
        .update({
          ...updates,
          updated_at: updated.updated_at,
        })
        .eq("id", id)
        .select("*, teacher:guru(*), dudi:dudi(*)")
        .single();

      if (!error && data) {
        fallbackKunjungan[index] = data as Kunjungan;
        saveFallback("kunjungan", fallbackKunjungan);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("simmas_kunjungan_updated"));
        }
        await logAudit("KUNJUNGAN_UPDATED", id, "INFO");
        return data as Kunjungan;
      }
    } catch (e) {
      console.warn("Update kunjungan live error:", e);
    }
  }

  fallbackKunjungan[index] = updated;
  saveFallback("kunjungan", fallbackKunjungan);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("simmas_kunjungan_updated"));
  }
  await logAudit("KUNJUNGAN_UPDATED", id, "INFO");
  return updated;
}

export async function deleteKunjungan(id: string): Promise<boolean> {
  if (isLiveSupabase()) {
    try {
      await supabase.from("kunjungan").delete().eq("id", id);
      await logAudit("KUNJUNGAN_DELETED", id, "WARNING");
    } catch (e) {
      console.warn("Delete kunjungan live error:", e);
    }
  }

  fallbackKunjungan = fallbackKunjungan.filter((k) => k.id !== id);
  saveFallback("kunjungan", fallbackKunjungan);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("simmas_kunjungan_updated"));
  }
  await logAudit("KUNJUNGAN_DELETED", id, "WARNING");
  return true;
}

// ==========================================
// JURNAL SERVICES
// ==========================================
export async function getJurnalList(filter?: {
  teacherId?: string;
  studentId?: string;
  status?: JurnalStatus;
}): Promise<Jurnal[]> {
  if (isLiveSupabase()) {
    try {
      let query = supabase
        .from("jurnal")
        .select(`
          *,
          student:siswa(*)
        `)
        .order("date", { ascending: false });

      if (filter?.studentId) {
        query = query.eq("student_id", filter.studentId);
      }
      if (filter?.status) {
        query = query.eq("status", filter.status);
      }

      const { data, error } = await query;
      if (!error && data) return data as Jurnal[];
    } catch (e) {
      console.warn("Fetch jurnal live error:", e);
    }
  }

  let items = [...fallbackJurnal];

  // If teacherId provided, filter to students supervised by that teacher
  if (filter?.teacherId) {
    const supervisedStudentIds = fallbackPenempatan
      .filter((p) => p.teacher_id === filter.teacherId)
      .map((p) => p.student_id);
    items = items.filter((j) => supervisedStudentIds.includes(j.student_id));
  }

  if (filter?.studentId) {
    items = items.filter((j) => j.student_id === filter.studentId);
  }

  if (filter?.status) {
    items = items.filter((j) => j.status === filter.status);
  }

  // Populate student relation
  return items.map((j) => ({
    ...j,
    student: fallbackSiswa.find((s) => s.id === j.student_id) || j.student,
  }));
}

export async function validateJurnal(
  id: string,
  status: "Disetujui" | "Perlu Revisi",
  feedback?: string
): Promise<Jurnal | null> {
  const index = fallbackJurnal.findIndex((j) => j.id === id);
  if (index === -1) return null;

  const updated: Jurnal = {
    ...fallbackJurnal[index],
    status,
    teacher_feedback: feedback || (status === "Disetujui" ? "Jurnal disetujui oleh Guru Pembimbing." : undefined),
    updated_at: new Date().toISOString(),
  };

  if (isLiveSupabase()) {
    try {
      const { data, error } = await supabase
        .from("jurnal")
        .update({
          status,
          teacher_feedback: updated.teacher_feedback,
          updated_at: updated.updated_at,
        })
        .eq("id", id)
        .select("*, student:siswa(*)")
        .single();

      if (!error && data) {
        fallbackJurnal[index] = data as Jurnal;
        saveFallback("jurnal", fallbackJurnal);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("simmas_jurnal_updated"));
        }
        await logAudit("JURNAL_VALIDATED", `${id} → ${status}`, "INFO");
        return data as Jurnal;
      }
    } catch (e) {
      console.warn("Validate jurnal live error:", e);
    }
  }

  fallbackJurnal[index] = updated;
  saveFallback("jurnal", fallbackJurnal);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("simmas_jurnal_updated"));
  }
  await logAudit("JURNAL_VALIDATED", `${id} → ${status}`, "INFO");
  return updated;
}

// ==========================================
// ABSENSI & MONITORING SERVICES
// ==========================================
export async function getAbsensiList(studentIds?: string[]): Promise<Absensi[]> {
  if (isLiveSupabase()) {
    try {
      let query = supabase
        .from("absensi")
        .select("*, student:siswa(*)")
        .order("date", { ascending: false });

      if (studentIds && studentIds.length > 0) {
        query = query.in("student_id", studentIds);
      }

      const { data, error } = await query;
      if (!error && data) return data as Absensi[];
    } catch (e) {
      console.warn("Fetch absensi live error:", e);
    }
  }

  let items = [...fallbackAbsensi];
  if (studentIds && studentIds.length > 0) {
    items = items.filter((a) => studentIds.includes(a.student_id));
  }
  return items.map((a) => ({
    ...a,
    student: fallbackSiswa.find((s) => s.id === a.student_id) || a.student,
  }));
}

export interface SupervisedStudentSummary {
  student: Siswa;
  dudi: Dudi;
  penempatan: Penempatan;
  totalJurnal: number;
  pendingJurnal: number;
  approvedJurnal: number;
  revisionJurnal: number;
  hadirCount: number;
  sakitCount: number;
  izinCount: number;
  alfaCount: number;
  attendanceRate: number; // 0-100
}

export async function getSupervisedStudentsSummary(
  teacherId: string = "g-01"
): Promise<SupervisedStudentSummary[]> {
  // 1. Get placements for this teacher
  const placements = fallbackPenempatan.filter((p) => p.teacher_id === teacherId);

  const summaries: SupervisedStudentSummary[] = [];

  for (const p of placements) {
    const student = fallbackSiswa.find((s) => s.id === p.student_id) || p.student;
    const dudi = fallbackDudi.find((d) => d.id === p.dudi_id) || p.dudi;

    if (!student || !dudi) continue;

    // Jurnals for this student
    const studentJurnals = fallbackJurnal.filter((j) => j.student_id === student.id);
    const pendingJurnal = studentJurnals.filter((j) => j.status === "Pending").length;
    const approvedJurnal = studentJurnals.filter((j) => j.status === "Disetujui").length;
    const revisionJurnal = studentJurnals.filter((j) => j.status === "Perlu Revisi").length;

    // Absensi for this student
    const studentAbsensi = fallbackAbsensi.filter((a) => a.student_id === student.id);
    const hadirCount = studentAbsensi.filter((a) => a.status === "Hadir").length;
    const sakitCount = studentAbsensi.filter((a) => a.status === "Sakit").length;
    const izinCount = studentAbsensi.filter((a) => a.status === "Izin").length;
    const alfaCount = studentAbsensi.filter((a) => a.status === "Alfa").length;
    const totalRecorded = hadirCount + sakitCount + izinCount + alfaCount;

    const attendanceRate =
      totalRecorded > 0 ? Math.round((hadirCount / totalRecorded) * 100) : 100;

    summaries.push({
      student,
      dudi,
      penempatan: p,
      totalJurnal: studentJurnals.length,
      pendingJurnal,
      approvedJurnal,
      revisionJurnal,
      hadirCount,
      sakitCount,
      izinCount,
      alfaCount,
      attendanceRate,
    });
  }

  return summaries;
}

// ==========================================
// SISWA SERVICES & AUTHENTICATION
// ==========================================
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Guru" | "Siswa";
  rawUser?: any;
}

export function getActiveSiswa(): Siswa {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("simmas_current_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.role === "Siswa") {
          if (parsed.rawUser) return parsed.rawUser as Siswa;
          const found = fallbackSiswa.find(
            (s) => s.id === parsed.id || s.email.toLowerCase() === (parsed.email || "").toLowerCase()
          );
          if (found) return found;
          return {
            id: parsed.id,
            nis: parsed.nis || "0000",
            name: parsed.name,
            email: parsed.email,
            class_name: parsed.class_name || "XII RPL 1",
            status: parsed.status || "Belum Magang",
            created_at: new Date().toISOString(),
          };
        }
      }
    } catch {}
  }

  return (
    fallbackSiswa.find((s) => s.id === "s-01" || s.email === "siswa@simmas.sch.id") ||
    fallbackSiswa[0] || {
      id: "s-01",
      nis: "21221001",
      name: "Ahmad Zaki Pratama",
      email: "siswa@simmas.sch.id",
      class_name: "XII RPL 1",
      status: "Belum Magang",
      created_at: new Date().toISOString(),
    }
  );
}

export function logoutUser(): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("simmas_current_user");
      localStorage.removeItem("simmas_user_role");
      window.dispatchEvent(new Event("simmas_auth_changed"));
    } catch {}
  }
}

export async function authenticateUser(
  emailInput: string,
  passwordInput: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  const cleanEmail = emailInput.trim().toLowerCase();
  const cleanPass = passwordInput.trim().toLowerCase();

  // 1. Check Admin
  if (
    cleanEmail === "admin@simmas.sch.id" ||
    cleanEmail === "admin" ||
    cleanEmail.startsWith("admin@")
  ) {
    const adminUser: AuthUser = {
      id: "admin-01",
      name: "Administrator SIMMAS",
      email: "admin@simmas.sch.id",
      role: "Admin",
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("simmas_current_user", JSON.stringify(adminUser));
      localStorage.setItem("simmas_user_role", "Admin");
      window.dispatchEvent(new Event("simmas_auth_changed"));
    }
    return { success: true, user: adminUser };
  }

  // 2. Check Siswa
  const siswaList = await getSiswaList();
  const foundSiswa = siswaList.find((s) => {
    const sEmail = (s.email || "").toLowerCase();
    const creds = generateCredentialsFromName(s.name);
    return (
      sEmail === cleanEmail ||
      creds.email.toLowerCase() === cleanEmail ||
      s.nis.toLowerCase() === cleanEmail ||
      s.name.toLowerCase().replace(/\s+/g, "") === cleanEmail
    );
  });

  if (foundSiswa) {
    const expectedCreds = generateCredentialsFromName(foundSiswa.name);
    const isValidPass =
      cleanPass === expectedCreds.password ||
      cleanPass === "smk12345" ||
      cleanPass === "siswa" ||
      cleanPass === foundSiswa.nis.toLowerCase() ||
      cleanPass === foundSiswa.name.toLowerCase().replace(/\s+/g, "");

    if (!isValidPass && passwordInput.length > 0) {
      return { success: false, error: "Password siswa tidak cocok." };
    }

    const authUser: AuthUser = {
      id: foundSiswa.id,
      name: foundSiswa.name,
      email: foundSiswa.email || expectedCreds.email,
      role: "Siswa",
      rawUser: foundSiswa,
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("simmas_current_user", JSON.stringify(authUser));
      localStorage.setItem("simmas_user_role", "Siswa");
      window.dispatchEvent(new Event("simmas_auth_changed"));
    }
    return { success: true, user: authUser };
  }

  // 3. Check Guru
  const guruList = await getGuruList();
  const foundGuru = guruList.find((g) => {
    const gEmail = (g.email || "").toLowerCase();
    const creds = generateCredentialsFromName(g.name);
    return (
      gEmail === cleanEmail ||
      creds.email.toLowerCase() === cleanEmail ||
      g.nip.toLowerCase() === cleanEmail ||
      g.name.toLowerCase().replace(/\s+/g, "") === cleanEmail
    );
  });

  if (foundGuru) {
    const expectedCreds = generateCredentialsFromName(foundGuru.name);
    const isValidPass =
      cleanPass === expectedCreds.password ||
      cleanPass === "smk12345" ||
      cleanPass === "guru" ||
      cleanPass === foundGuru.nip.toLowerCase() ||
      cleanPass === foundGuru.name.toLowerCase().replace(/\s+/g, "");

    if (!isValidPass && passwordInput.length > 0) {
      return { success: false, error: "Password guru tidak cocok." };
    }

    const authUser: AuthUser = {
      id: foundGuru.id,
      name: foundGuru.name,
      email: foundGuru.email || expectedCreds.email,
      role: "Guru",
      rawUser: foundGuru,
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("simmas_current_user", JSON.stringify(authUser));
      localStorage.setItem("simmas_user_role", "Guru");
      window.dispatchEvent(new Event("simmas_auth_changed"));
    }
    return { success: true, user: authUser };
  }

  return {
    success: false,
    error: "Email atau akun tidak terdaftar di sistem SIMMAS.",
  };
}

export async function getStudentPlacement(studentId: string): Promise<Penempatan | null> {
  if (isLiveSupabase()) {
    try {
      const { data, error } = await supabase
        .from("penempatan")
        .select(`
          *,
          student:siswa(*),
          dudi:dudi(*),
          teacher:guru(*)
        `)
        .eq("student_id", studentId)
        .eq("status", "Berlangsung")
        .maybeSingle();

      if (!error && data) return data as Penempatan;
    } catch (e) {
      console.warn("Fetch student placement live error:", e);
    }
  }

  const p = fallbackPenempatan.find(
    (item) => item.student_id === studentId && item.status === "Berlangsung"
  );
  if (!p) return null;

  return {
    ...p,
    student: fallbackSiswa.find((s) => s.id === p.student_id) || p.student,
    dudi: fallbackDudi.find((d) => d.id === p.dudi_id) || p.dudi,
    teacher: fallbackGuru.find((g) => g.id === p.teacher_id) || p.teacher,
  };
}

export async function getPengajuanList(studentId?: string): Promise<PengajuanMagang[]> {
  if (isLiveSupabase()) {
    try {
      let query = supabase
        .from("pengajuan_magang")
        .select("*, student:siswa(*), dudi:dudi(*)")
        .order("created_at", { ascending: false });

      if (studentId) {
        query = query.eq("student_id", studentId);
      }

      const { data, error } = await query;
      if (!error && data) return data as PengajuanMagang[];
    } catch (e) {
      console.warn("Fetch pengajuan live error:", e);
    }
  }

  let items = [...fallbackPengajuan];
  if (studentId) {
    items = items.filter((p) => p.student_id === studentId);
  }

  return items.map((p) => ({
    ...p,
    student: fallbackSiswa.find((s) => s.id === p.student_id) || p.student,
    dudi: fallbackDudi.find((d) => d.id === p.dudi_id) || p.dudi,
  }));
}

export async function getActivePengajuan(studentId: string): Promise<PengajuanMagang | null> {
  const list = await getPengajuanList(studentId);
  return list.find((p) => p.status === "Menunggu Verifikasi" || p.status === "Disetujui") || null;
}

export async function createPengajuan(
  input: Omit<PengajuanMagang, "id" | "created_at" | "status" | "student" | "dudi">
): Promise<PengajuanMagang> {
  const newPengajuan: PengajuanMagang = {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `peng-${Date.now()}`,
    ...input,
    status: "Menunggu Verifikasi",
    created_at: new Date().toISOString(),
  };

  if (isLiveSupabase()) {
    try {
      const { data, error } = await supabase
        .from("pengajuan_magang")
        .insert([{
          id: newPengajuan.id,
          student_id: input.student_id,
          dudi_id: input.dudi_id,
          position: input.position,
          start_date: input.start_date,
          end_date: input.end_date,
          notes: input.notes,
          status: "Menunggu Verifikasi",
        }])
        .select("*, student:siswa(*), dudi:dudi(*)")
        .single();

      if (!error && data) {
        fallbackPengajuan.unshift(data as PengajuanMagang);
        saveFallback("pengajuan", fallbackPengajuan);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("simmas_pengajuan_updated"));
        }
        await logAudit("PENGAJUAN_CREATED", input.dudi_id, "INFO");
        return data as PengajuanMagang;
      }
    } catch (e) {
      console.warn("Create pengajuan live error:", e);
    }
  }

  const existing = fallbackPengajuan.find(
    (p) => p.student_id === input.student_id && p.status === "Menunggu Verifikasi"
  );
  if (existing) {
    throw new Error("Anda masih memiliki pengajuan yang sedang ditinjau oleh pihak sekolah.");
  }

  const dudi = fallbackDudi.find((d) => d.id === input.dudi_id);
  const student = fallbackSiswa.find((s) => s.id === input.student_id);
  newPengajuan.dudi = dudi;
  newPengajuan.student = student;

  fallbackPengajuan.unshift(newPengajuan);
  saveFallback("pengajuan", fallbackPengajuan);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("simmas_pengajuan_updated"));
  }
  await logAudit("PENGAJUAN_CREATED", dudi?.name || input.dudi_id, "INFO");
  return newPengajuan;
}

export async function cancelPengajuan(id: string): Promise<boolean> {
  if (isLiveSupabase()) {
    try {
      const { error } = await supabase
        .from("pengajuan_magang")
        .update({ status: "Dibatalkan", updated_at: new Date().toISOString() })
        .eq("id", id);

      if (!error) {
        const index = fallbackPengajuan.findIndex((p) => p.id === id);
        if (index !== -1) {
          fallbackPengajuan[index].status = "Dibatalkan";
          saveFallback("pengajuan", fallbackPengajuan);
        }
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("simmas_pengajuan_updated"));
        }
        await logAudit("PENGAJUAN_CANCELED", id, "WARNING");
        return true;
      }
    } catch (e) {
      console.warn("Cancel pengajuan live error:", e);
    }
  }

  const index = fallbackPengajuan.findIndex((p) => p.id === id);
  if (index === -1) return false;

  fallbackPengajuan[index].status = "Dibatalkan";
  fallbackPengajuan[index].updated_at = new Date().toISOString();
  saveFallback("pengajuan", fallbackPengajuan);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("simmas_pengajuan_updated"));
  }
  await logAudit("PENGAJUAN_CANCELED", id, "WARNING");
  return true;
}

export async function verifyPengajuan(id: string): Promise<boolean> {
  if (isLiveSupabase()) {
    try {
      const now = new Date().toISOString();
      const { data: peng, error } = await supabase
        .from("pengajuan_magang")
        .update({ status: "Disetujui", verified_at: now, updated_at: now })
        .eq("id", id)
        .select()
        .single();

      if (!error && peng) {
        await supabase
          .from("siswa")
          .update({ status: "Sedang Magang", updated_at: now })
          .eq("id", peng.student_id);

        await supabase.from("penempatan").insert([{
          id: `p-${Date.now()}`,
          student_id: peng.student_id,
          dudi_id: peng.dudi_id,
          teacher_id: "g-01",
          start_date: peng.start_date,
          end_date: peng.end_date,
          status: "Berlangsung",
        }]);
      }
    } catch (e) {
      console.warn("Verify pengajuan live error:", e);
    }
  }

  const pengajuanIndex = fallbackPengajuan.findIndex((p) => p.id === id);
  if (pengajuanIndex !== -1) {
    const peng = fallbackPengajuan[pengajuanIndex];
    peng.status = "Disetujui";
    peng.verified_at = new Date().toISOString();
    peng.updated_at = new Date().toISOString();

    const studentIndex = fallbackSiswa.findIndex((s) => s.id === peng.student_id);
    if (studentIndex !== -1) {
      fallbackSiswa[studentIndex].status = "Sedang Magang";
      saveFallback("siswa", fallbackSiswa);
    }

    const existingPlacementIndex = fallbackPenempatan.findIndex(
      (p) => p.student_id === peng.student_id
    );
    if (existingPlacementIndex !== -1) {
      fallbackPenempatan[existingPlacementIndex].dudi_id = peng.dudi_id;
      fallbackPenempatan[existingPlacementIndex].status = "Berlangsung";
      fallbackPenempatan[existingPlacementIndex].start_date = peng.start_date;
      fallbackPenempatan[existingPlacementIndex].end_date = peng.end_date;
    } else {
      fallbackPenempatan.unshift({
        id: `p-${Date.now()}`,
        student_id: peng.student_id,
        dudi_id: peng.dudi_id,
        teacher_id: "g-01",
        start_date: peng.start_date,
        end_date: peng.end_date,
        status: "Berlangsung",
        created_at: new Date().toISOString(),
        student: fallbackSiswa[studentIndex],
        dudi: fallbackDudi.find((d) => d.id === peng.dudi_id),
        teacher: fallbackGuru[0],
      });
    }

    saveFallback("pengajuan", fallbackPengajuan);
    saveFallback("penempatan", fallbackPenempatan);
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("simmas_pengajuan_updated"));
    window.dispatchEvent(new Event("simmas_siswa_updated"));
    window.dispatchEvent(new Event("simmas_penempatan_updated"));
  }
  await logAudit("PENGAJUAN_VERIFIED", id, "INFO");
  return true;
}

export async function resetSiswaDemo(studentId: string = "s-01"): Promise<boolean> {
  if (isLiveSupabase()) {
    try {
      await supabase
        .from("siswa")
        .update({ status: "Belum Magang", updated_at: new Date().toISOString() })
        .eq("id", studentId);

      await supabase
        .from("pengajuan_magang")
        .update({ status: "Menunggu Verifikasi", verified_at: null, updated_at: new Date().toISOString() })
        .eq("student_id", studentId);

      await supabase
        .from("penempatan")
        .delete()
        .eq("student_id", studentId);
    } catch (e) {
      console.warn("Reset siswa demo live error:", e);
    }
  }

  const sIdx = fallbackSiswa.findIndex((s) => s.id === studentId);
  if (sIdx !== -1) {
    fallbackSiswa[sIdx].status = "Belum Magang";
    saveFallback("siswa", fallbackSiswa);
  }

  const pIdx = fallbackPengajuan.findIndex((p) => p.student_id === studentId);
  if (pIdx !== -1) {
    fallbackPengajuan[pIdx].status = "Menunggu Verifikasi";
    delete fallbackPengajuan[pIdx].verified_at;
  } else {
    fallbackPengajuan.unshift({
      id: `peng-${Date.now()}`,
      student_id: studentId,
      dudi_id: "d-01",
      position: "Mobile Developer",
      start_date: "2026-10-01",
      end_date: "2026-12-31",
      notes: "Pengajuan magang divisi Mobile & Cloud Solutions.",
      status: "Menunggu Verifikasi",
      created_at: new Date().toISOString(),
    });
  }
  saveFallback("pengajuan", fallbackPengajuan);

  fallbackPenempatan = fallbackPenempatan.filter((p) => p.student_id !== studentId);
  saveFallback("penempatan", fallbackPenempatan);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("simmas_pengajuan_updated"));
    window.dispatchEvent(new Event("simmas_siswa_updated"));
    window.dispatchEvent(new Event("simmas_penempatan_updated"));
  }
  return true;
}

export async function getTodayAbsensi(studentId: string): Promise<Absensi | null> {
  const today = new Date().toISOString().split("T")[0];

  if (isLiveSupabase()) {
    try {
      const { data, error } = await supabase
        .from("absensi")
        .select("*")
        .eq("student_id", studentId)
        .eq("date", today)
        .maybeSingle();

      if (!error && data) return data as Absensi;
    } catch (e) {
      console.warn("Fetch today absensi live error:", e);
    }
  }

  const item = fallbackAbsensi.find(
    (a) => a.student_id === studentId && a.date === today
  );
  return item ? { ...item } : null;
}

export async function checkInSiswa(
  studentId: string,
  photoBase64: string,
  status: AbsensiStatus = "Hadir",
  notes?: string
): Promise<Absensi> {
  const today = new Date().toISOString().split("T")[0];
  const nowTime = new Date().toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }) + " WIB";

  const newAbsensi: Absensi = {
    id: `abs-${Date.now()}`,
    student_id: studentId,
    date: today,
    status,
    check_in_time: nowTime,
    check_in_photo: photoBase64,
    notes,
    created_at: new Date().toISOString(),
  };

  if (isLiveSupabase()) {
    try {
      const { data: existing } = await supabase
        .from("absensi")
        .select("id")
        .eq("student_id", studentId)
        .eq("date", today)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from("absensi")
          .update({
            check_in_time: nowTime,
            check_in_photo: photoBase64,
            status,
            notes: notes || null,
          })
          .eq("id", existing.id)
          .select()
          .single();

        if (!error && data) {
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("simmas_absensi_updated"));
          }
          await logAudit("ABSENSI_CHECKIN", studentId, "INFO");
          return data as Absensi;
        }
      } else {
        const { data, error } = await supabase
          .from("absensi")
          .insert([newAbsensi])
          .select()
          .single();

        if (!error && data) {
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("simmas_absensi_updated"));
          }
          await logAudit("ABSENSI_CHECKIN", studentId, "INFO");
          return data as Absensi;
        }
      }
    } catch (e) {
      console.warn("CheckIn live error:", e);
    }
  }

  const existingIndex = fallbackAbsensi.findIndex(
    (a) => a.student_id === studentId && a.date === today
  );

  if (existingIndex !== -1) {
    fallbackAbsensi[existingIndex].check_in_time = nowTime;
    fallbackAbsensi[existingIndex].check_in_photo = photoBase64;
    fallbackAbsensi[existingIndex].status = status;
    if (notes) fallbackAbsensi[existingIndex].notes = notes;
    saveFallback("absensi", fallbackAbsensi);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("simmas_absensi_updated"));
    }
    await logAudit("ABSENSI_CHECKIN", studentId, "INFO");
    return fallbackAbsensi[existingIndex];
  }

  fallbackAbsensi.unshift(newAbsensi);
  saveFallback("absensi", fallbackAbsensi);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("simmas_absensi_updated"));
  }
  await logAudit("ABSENSI_CHECKIN", studentId, "INFO");
  return newAbsensi;
}

export async function checkOutSiswa(
  studentId: string,
  photoBase64: string
): Promise<Absensi | null> {
  const today = new Date().toISOString().split("T")[0];
  const nowTime = new Date().toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }) + " WIB";

  if (isLiveSupabase()) {
    try {
      const { data: existing } = await supabase
        .from("absensi")
        .select("id")
        .eq("student_id", studentId)
        .eq("date", today)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from("absensi")
          .update({
            check_out_time: nowTime,
            check_out_photo: photoBase64,
          })
          .eq("id", existing.id)
          .select()
          .single();

        if (!error && data) {
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("simmas_absensi_updated"));
          }
          await logAudit("ABSENSI_CHECKOUT", studentId, "INFO");
          return data as Absensi;
        }
      }
    } catch (e) {
      console.warn("CheckOut live error:", e);
    }
  }

  const index = fallbackAbsensi.findIndex(
    (a) => a.student_id === studentId && a.date === today
  );

  if (index === -1) {
    const newRecord: Absensi = {
      id: `abs-${Date.now()}`,
      student_id: studentId,
      date: today,
      status: "Hadir",
      check_out_time: nowTime,
      check_out_photo: photoBase64,
      created_at: new Date().toISOString(),
    };
    fallbackAbsensi.unshift(newRecord);
    saveFallback("absensi", fallbackAbsensi);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("simmas_absensi_updated"));
    }
    await logAudit("ABSENSI_CHECKOUT", studentId, "INFO");
    return newRecord;
  }

  fallbackAbsensi[index].check_out_time = nowTime;
  fallbackAbsensi[index].check_out_photo = photoBase64;
  saveFallback("absensi", fallbackAbsensi);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("simmas_absensi_updated"));
  }
  await logAudit("ABSENSI_CHECKOUT", studentId, "INFO");
  return fallbackAbsensi[index];
}

export async function createJurnalSiswa(
  studentId: string,
  date: string,
  activity: string
): Promise<Jurnal> {
  const student = fallbackSiswa.find((s) => s.id === studentId);
  const newJurnal: Jurnal = {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `j-${Date.now()}`,
    student_id: studentId,
    date,
    activity,
    status: "Pending",
    created_at: new Date().toISOString(),
    student,
  };

  if (isLiveSupabase()) {
    try {
      const { data, error } = await supabase
        .from("jurnal")
        .insert([{
          id: newJurnal.id,
          student_id: studentId,
          date,
          activity,
          status: "Pending",
        }])
        .select("*, student:siswa(*)")
        .single();

      if (!error && data) {
        fallbackJurnal.unshift(data as Jurnal);
        saveFallback("jurnal", fallbackJurnal);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("simmas_jurnal_updated"));
        }
        await logAudit("JURNAL_CREATED", student?.name || studentId, "INFO");
        return data as Jurnal;
      }
    } catch (e) {
      console.warn("Create jurnal live error:", e);
    }
  }

  fallbackJurnal.unshift(newJurnal);
  saveFallback("jurnal", fallbackJurnal);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("simmas_jurnal_updated"));
  }
  await logAudit("JURNAL_CREATED", student?.name || studentId, "INFO");
  return newJurnal;
}

export async function updateJurnalSiswa(
  jurnalId: string,
  activity: string
): Promise<Jurnal | null> {
  if (isLiveSupabase()) {
    try {
      const { data, error } = await supabase
        .from("jurnal")
        .update({
          activity,
          status: "Pending",
          updated_at: new Date().toISOString(),
        })
        .eq("id", jurnalId)
        .select("*, student:siswa(*)")
        .single();

      if (!error && data) {
        const idx = fallbackJurnal.findIndex((j) => j.id === jurnalId);
        if (idx !== -1) {
          fallbackJurnal[idx] = data as Jurnal;
          saveFallback("jurnal", fallbackJurnal);
        }
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("simmas_jurnal_updated"));
        }
        await logAudit("JURNAL_UPDATED", jurnalId, "INFO");
        return data as Jurnal;
      }
    } catch (e) {
      console.warn("Update jurnal live error:", e);
    }
  }

  const index = fallbackJurnal.findIndex((j) => j.id === jurnalId);
  if (index === -1) return null;

  fallbackJurnal[index].activity = activity;
  fallbackJurnal[index].status = "Pending";
  fallbackJurnal[index].updated_at = new Date().toISOString();
  saveFallback("jurnal", fallbackJurnal);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("simmas_jurnal_updated"));
  }
  await logAudit("JURNAL_UPDATED", jurnalId, "INFO");
  return fallbackJurnal[index];
}

