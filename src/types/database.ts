export type GuruStatus = "Aktif" | "Cuti" | "Nonaktif";

export interface Guru {
  id: string;
  nip: string;
  name: string;
  email: string;
  phone?: string;
  department: string;
  status: GuruStatus;
  created_at: string;
  updated_at?: string;
}

export type SiswaStatus = "Belum Magang" | "Sedang Magang" | "Selesai Magang" | "Bermasalah";

export interface Siswa {
  id: string;
  nis: string;
  name: string;
  email: string;
  class_name: string;
  status: SiswaStatus;
  created_at: string;
  updated_at?: string;
}

export type DudiStatus = "Terverifikasi" | "Menunggu Validasi" | "Nonaktif";

export interface Dudi {
  id: string;
  name: string;
  address: string;
  pic_name: string;
  pic_phone: string;
  sector: string;
  quota: number;
  status: DudiStatus;
  created_at: string;
  updated_at?: string;
}

export type PenempatanStatus = "Berlangsung" | "Selesai" | "Dibatalkan";

export interface Penempatan {
  id: string;
  student_id: string;
  dudi_id: string;
  teacher_id: string;
  start_date: string;
  end_date: string;
  status: PenempatanStatus;
  created_at: string;
  updated_at?: string;
  // Joined relation fields for easy rendering
  student?: Siswa;
  dudi?: Dudi;
  teacher?: Guru;
}

export type AbsensiStatus = "Hadir" | "Sakit" | "Izin" | "Alfa";
export type AbsensiValidationStatus = "Menunggu" | "Disetujui" | "Perlu Revisi" | "Ditolak";

export interface Absensi {
  id: string;
  student_id: string;
  date: string;
  status: AbsensiStatus;
  check_in_time?: string;
  check_in_photo?: string;
  check_out_time?: string;
  check_out_photo?: string;
  notes?: string;
  validation_status?: AbsensiValidationStatus;
  validation_notes?: string;
  validated_at?: string;
  created_at: string;
  student?: Siswa;
}

export type PengajuanStatus = "Menunggu Verifikasi" | "Disetujui" | "Ditolak" | "Dibatalkan";

export interface PengajuanMagang {
  id: string;
  student_id: string;
  dudi_id: string;
  position: string;
  start_date: string;
  end_date: string;
  notes?: string;
  status: PengajuanStatus;
  verified_at?: string;
  created_at: string;
  updated_at?: string;
  student?: Siswa;
  dudi?: Dudi;
}

export type JurnalStatus = "Pending" | "Disetujui" | "Perlu Revisi" | "Ditolak";

export interface Jurnal {
  id: string;
  student_id: string;
  date: string;
  activity: string;
  kendala?: string;
  tindak_lanjut?: string;
  photo_url?: string;
  status: JurnalStatus;
  teacher_feedback?: string;
  created_at: string;
  updated_at?: string;
  student?: Siswa;
}

export type KunjunganStatus = "Terjadwal" | "Selesai";

export interface Kunjungan {
  id: string;
  teacher_id: string;
  dudi_id: string;
  date: string;
  status: KunjunganStatus;
  notes: string;
  created_at: string;
  updated_at?: string;
  teacher?: Guru;
  dudi?: Dudi;
}

export interface SystemSettings {
  general: {
    appName: string;
    appDescription: string;
    contactEmail: string;
  };
  landing: {
    heroTitle: string;
    heroSubtitle: string;
    heroDescription: string;
  };
  school: {
    schoolName: string;
    schoolAddress: string;
    schoolPhone: string;
    schoolWebsite: string;
    principalName: string;
    principalNip: string;
  };
}

export type LogLevel = "INFO" | "WARNING" | "ERROR";

export interface AuditLog {
  id: string;
  action: string;
  target?: string;
  actor_email: string;
  actor_role: string;
  level: LogLevel;
  ip_address: string;
  details?: Record<string, any>;
  created_at: string;
}
