-- ==============================================================================
-- SIMMAS — Sistem Informasi Manajemen Magang Siswa
-- Complete Database Schema, Seed Data & Realtime Publication
-- ==============================================================================

-- 0. CLEAN RESET (Hapus tabel lama untuk menghindari konflik tipe data UUID vs TEXT)
DROP TABLE IF EXISTS public.kunjungan CASCADE;
DROP TABLE IF EXISTS public.pengajuan_magang CASCADE;
DROP TABLE IF EXISTS public.jurnal CASCADE;
DROP TABLE IF EXISTS public.absensi CASCADE;
DROP TABLE IF EXISTS public.penempatan CASCADE;
DROP TABLE IF EXISTS public.dudi CASCADE;
DROP TABLE IF EXISTS public.siswa CASCADE;
DROP TABLE IF EXISTS public.guru CASCADE;
DROP TABLE IF EXISTS public.system_settings CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABEL: GURU PEMBIMBING
CREATE TABLE public.guru (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    nip VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    department VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Cuti', 'Nonaktif')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABEL: SISWA
CREATE TABLE public.siswa (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    nis VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    class_name VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'Belum Magang' CHECK (status IN ('Belum Magang', 'Sedang Magang', 'Selesai Magang', 'Bermasalah')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABEL: MITRA DUDI (DUNIA USAHA & INDUSTRI)
CREATE TABLE public.dudi (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    pic_name VARCHAR(255) NOT NULL,
    pic_phone VARCHAR(50) NOT NULL,
    sector VARCHAR(100) NOT NULL,
    quota INTEGER NOT NULL DEFAULT 2 CHECK (quota >= 0),
    status VARCHAR(50) DEFAULT 'Terverifikasi' CHECK (status IN ('Terverifikasi', 'Menunggu Validasi', 'Nonaktif')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABEL: PENEMPATAN MAGANG
CREATE TABLE public.penempatan (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    student_id TEXT NOT NULL REFERENCES public.siswa(id) ON DELETE CASCADE,
    dudi_id TEXT NOT NULL REFERENCES public.dudi(id) ON DELETE CASCADE,
    teacher_id TEXT NOT NULL REFERENCES public.guru(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Berlangsung' CHECK (status IN ('Berlangsung', 'Selesai', 'Dibatalkan')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABEL: KUNJUNGAN MONITORING GURU
CREATE TABLE public.kunjungan (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    teacher_id TEXT NOT NULL REFERENCES public.guru(id) ON DELETE CASCADE,
    dudi_id TEXT NOT NULL REFERENCES public.dudi(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Terjadwal' CHECK (status IN ('Terjadwal', 'Selesai')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABEL: ABSENSI HARIAN SISWA (WEBCAM INTEGRATION)
CREATE TABLE public.absensi (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    student_id TEXT NOT NULL REFERENCES public.siswa(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(50) NOT NULL CHECK (status IN ('Hadir', 'Sakit', 'Izin', 'Alfa')),
    check_in_time VARCHAR(50),
    check_in_photo TEXT,
    check_out_time VARCHAR(50),
    check_out_photo TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TABEL: JURNAL HARIAN MAGANG
CREATE TABLE public.jurnal (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    student_id TEXT NOT NULL REFERENCES public.siswa(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    activity TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Disetujui', 'Perlu Revisi', 'Ditolak')),
    teacher_feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TABEL: PENGAJUAN MAGANG MANDIRI
CREATE TABLE public.pengajuan_magang (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    student_id TEXT NOT NULL REFERENCES public.siswa(id) ON DELETE CASCADE,
    dudi_id TEXT NOT NULL REFERENCES public.dudi(id) ON DELETE CASCADE,
    position VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'Menunggu Verifikasi' CHECK (status IN ('Menunggu Verifikasi', 'Disetujui', 'Ditolak', 'Dibatalkan')),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. TABEL: PENGATURAN SISTEM (SYSTEM SETTINGS)
CREATE TABLE public.system_settings (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. TABEL: AUDIT LOGS
CREATE TABLE public.audit_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    action VARCHAR(100) NOT NULL,
    target VARCHAR(255),
    actor_email VARCHAR(255) NOT NULL,
    actor_role VARCHAR(50) DEFAULT 'Admin',
    level VARCHAR(20) DEFAULT 'INFO' CHECK (level IN ('INFO', 'WARNING', 'ERROR')),
    ip_address VARCHAR(50) DEFAULT '127.0.0.1',
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 12. ROW LEVEL SECURITY (RLS) & PERMISSIVE POLICIES
-- ==============================================================================
ALTER TABLE public.guru ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.siswa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dudi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.penempatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kunjungan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.absensi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jurnal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengajuan_magang ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for guru" ON public.guru;
CREATE POLICY "Allow all for guru" ON public.guru FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for siswa" ON public.siswa;
CREATE POLICY "Allow all for siswa" ON public.siswa FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for dudi" ON public.dudi;
CREATE POLICY "Allow all for dudi" ON public.dudi FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for penempatan" ON public.penempatan;
CREATE POLICY "Allow all for penempatan" ON public.penempatan FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for kunjungan" ON public.kunjungan;
CREATE POLICY "Allow all for kunjungan" ON public.kunjungan FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for absensi" ON public.absensi;
CREATE POLICY "Allow all for absensi" ON public.absensi FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for jurnal" ON public.jurnal;
CREATE POLICY "Allow all for jurnal" ON public.jurnal FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for pengajuan_magang" ON public.pengajuan_magang;
CREATE POLICY "Allow all for pengajuan_magang" ON public.pengajuan_magang FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for system_settings" ON public.system_settings;
CREATE POLICY "Allow all for system_settings" ON public.system_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for audit_logs" ON public.audit_logs;
CREATE POLICY "Allow all for audit_logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 13. ENABLE SUPABASE REALTIME PUBLICATION
-- ==============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'guru'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE 
            public.guru,
            public.siswa,
            public.dudi,
            public.penempatan,
            public.kunjungan,
            public.absensi,
            public.jurnal,
            public.pengajuan_magang,
            public.system_settings,
            public.audit_logs;
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- ==============================================================================
-- 14. SEED DATA LENGKAP SIAP PAKAI
-- ==============================================================================

-- A. GURU PEMBIMBING
INSERT INTO public.guru (id, nip, name, email, phone, department, status)
VALUES
('g-01', '198501012010011005', 'Dr. Budi Santoso, M.Kom', 'guru@simmas.sch.id', '081234567890', 'Teknik Komputer & Jaringan', 'Aktif'),
('g-02', '198803152012022003', 'Siti Rahmawati, S.Pd', 'siti@simmas.sch.id', '081298765432', 'Rekayasa Perangkat Lunak', 'Aktif'),
('g-03', '199007202015031002', 'Ahmad Fauzi, M.T', 'fauzi@simmas.sch.id', '081345678901', 'Multimedia / DKV', 'Aktif'),
('g-04', '199211052019012004', 'Dewi Sartika, S.Kom', 'dewi@simmas.sch.id', '081378901234', 'Teknik Komputer & Jaringan', 'Cuti')
ON CONFLICT (id) DO UPDATE SET
    nip = EXCLUDED.nip,
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    department = EXCLUDED.department,
    status = EXCLUDED.status;

-- B. SISWA
INSERT INTO public.siswa (id, nis, name, email, class_name, status)
VALUES
('s-01', '21221001', 'Ahmad Zaki Pratama', 'siswa@simmas.sch.id', 'XII RPL 1', 'Belum Magang'),
('s-02', '21221002', 'Siti Nurhaliza', 'siti.nur@simmas.sch.id', 'XII TKJ 2', 'Sedang Magang'),
('s-03', '21221003', 'Rizky Ramadhan', 'rizky@simmas.sch.id', 'XII TKJ 1', 'Sedang Magang'),
('s-04', '21221004', 'Putri Ayu Lestari', 'putri@simmas.sch.id', 'XII RPL 2', 'Sedang Magang'),
('s-05', '21221005', 'Bayu Pratama', 'bayu@simmas.sch.id', 'XII MM 1', 'Belum Magang')
ON CONFLICT (id) DO UPDATE SET
    nis = EXCLUDED.nis,
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    class_name = EXCLUDED.class_name,
    status = EXCLUDED.status;

-- C. MITRA DUDI
INSERT INTO public.dudi (id, name, address, pic_name, pic_phone, sector, quota, status)
VALUES
('d-01', 'PT Telkom Indonesia', 'Jl. Ketintang No. 156, Surabaya', 'Rina Wijaya', '081234567891', 'Teknologi Informasi & Jaringan', 3, 'Terverifikasi'),
('d-02', 'PT Astra Honda Motor', 'Kawasan Industri MM2100, Cikarang', 'Bambang Sudiro', '081298765430', 'Otomotif & Manufaktur', 2, 'Terverifikasi'),
('d-03', 'Bank Central Asia (BCA)', 'Jl. Basuki Rahmat No. 12, Surabaya', 'Maya Indah', '081345678902', 'Perbankan & Keuangan', 2, 'Terverifikasi'),
('d-04', 'CV Media Pratama Kreatif', 'Jl. Dharmahusada No. 45, Surabaya', 'Deni Setiawan', '081378901235', 'Desain Grafis & Multimedia', 2, 'Terverifikasi'),
('d-05', 'PT Indofood Sukses Makmur', 'Jl. Rungkut Industri I No. 10, Surabaya', 'Hadi Purnomo', '081223344556', 'Manufaktur & Logistik', 4, 'Terverifikasi')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    address = EXCLUDED.address,
    pic_name = EXCLUDED.pic_name,
    pic_phone = EXCLUDED.pic_phone,
    sector = EXCLUDED.sector,
    quota = EXCLUDED.quota,
    status = EXCLUDED.status;

-- D. PENEMPATAN MAGANG
INSERT INTO public.penempatan (id, student_id, dudi_id, teacher_id, start_date, end_date, status)
VALUES
('p-01', 's-02', 'd-01', 'g-01', '2026-07-01', '2026-12-31', 'Berlangsung'),
('p-02', 's-03', 'd-02', 'g-01', '2026-07-01', '2026-12-31', 'Berlangsung'),
('p-03', 's-04', 'd-03', 'g-02', '2026-07-15', '2026-12-31', 'Berlangsung')
ON CONFLICT (id) DO UPDATE SET
    student_id = EXCLUDED.student_id,
    dudi_id = EXCLUDED.dudi_id,
    teacher_id = EXCLUDED.teacher_id,
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date,
    status = EXCLUDED.status;

-- E. PENGAJUAN MAGANG SISWA (DEMO STATE: SISWA S-01 SEDANG MENUNGGU VERIFIKASI)
INSERT INTO public.pengajuan_magang (id, student_id, dudi_id, position, start_date, end_date, notes, status)
VALUES
('peng-01', 's-01', 'd-01', 'Mobile Developer', '2026-10-01', '2026-12-31', 'Pengajuan magang di divisi Mobile & Cloud Solutions PT Telkom Indonesia.', 'Menunggu Verifikasi')
ON CONFLICT (id) DO UPDATE SET
    student_id = EXCLUDED.student_id,
    dudi_id = EXCLUDED.dudi_id,
    position = EXCLUDED.position,
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date,
    notes = EXCLUDED.notes,
    status = EXCLUDED.status;

-- F. KUNJUNGAN MONITORING GURU
INSERT INTO public.kunjungan (id, teacher_id, dudi_id, date, status, notes)
VALUES
('k-01', 'g-01', 'd-01', '2026-09-10', 'Selesai', 'Monitoring berkala bulan ke-2. Siswa beradaptasi dengan baik di divisi network infrastructure.'),
('k-02', 'g-01', 'd-02', '2026-09-25', 'Terjadwal', 'Evaluasi implementasi SOP K3 dan performa servis berkala siswa magang di bengkel perakitan.')
ON CONFLICT (id) DO UPDATE SET
    teacher_id = EXCLUDED.teacher_id,
    dudi_id = EXCLUDED.dudi_id,
    date = EXCLUDED.date,
    status = EXCLUDED.status,
    notes = EXCLUDED.notes;

-- G. ABSENSI HARIAN
INSERT INTO public.absensi (id, student_id, date, status, check_in_time, check_out_time, notes)
VALUES
('a-01', 's-01', '2026-09-16', 'Hadir', '07:55', NULL, 'Hadir tepat waktu'),
('a-02', 's-01', '2026-09-15', 'Hadir', '07:50', '16:05', 'Hadir tepat waktu'),
('a-03', 's-01', '2026-09-14', 'Hadir', '07:58', '16:00', 'Hadir tepat waktu'),
('a-04', 's-01', '2026-09-13', 'Hadir', '08:02', '16:02', 'Hadir tepat waktu'),
('a-05', 's-02', '2026-09-16', 'Hadir', '07:45', '16:30', 'Hadir tepat waktu'),
('a-06', 's-02', '2026-09-15', 'Hadir', '07:48', '16:15', 'Hadir tepat waktu'),
('a-07', 's-02', '2026-09-14', 'Sakit', NULL, NULL, 'Demam dan flu - Surat dokter terlampir'),
('a-08', 's-03', '2026-09-16', 'Hadir', '07:30', '16:00', 'Hadir tepat waktu'),
('a-09', 's-03', '2026-09-15', 'Izin', NULL, NULL, 'Urusan keluarga')
ON CONFLICT (id) DO UPDATE SET
    student_id = EXCLUDED.student_id,
    date = EXCLUDED.date,
    status = EXCLUDED.status,
    check_in_time = EXCLUDED.check_in_time,
    check_out_time = EXCLUDED.check_out_time,
    notes = EXCLUDED.notes;

-- H. JURNAL HARIAN
INSERT INTO public.jurnal (id, student_id, date, activity, status, teacher_feedback)
VALUES
('j-01', 's-01', '2026-09-16', 'Mengerjakan modul autentikasi JWT dan pengujian endpoint REST API dengan Postman.', 'Pending', NULL),
('j-02', 's-02', '2026-09-16', 'Konfigurasi routing static dan dynamic pada switch access lantai 2 gedung utama.', 'Pending', NULL),
('j-03', 's-03', '2026-09-15', 'Membantu inspeksi komponen rem hidrolik dan penggantian fluida rem sepeda motor matic.', 'Disetujui', 'Pekerjaan sesuai SOP bengkel. Bagus, pertahankan!'),
('j-04', 's-04', '2026-09-14', 'Pemeriksaan kabel body dan sistem pengisian baterai kendaraan roda dua.', 'Disetujui', 'Laporan lengkap dan rapi.'),
('j-05', 's-01', '2026-09-13', 'Troubleshooting query database lambat di server staging internal.', 'Perlu Revisi', 'Mohon sertakan screenshot explain query dan metrik latensi yang dioptimasi.')
ON CONFLICT (id) DO UPDATE SET
    student_id = EXCLUDED.student_id,
    date = EXCLUDED.date,
    activity = EXCLUDED.activity,
    status = EXCLUDED.status,
    teacher_feedback = EXCLUDED.teacher_feedback;

-- I. SYSTEM SETTINGS
INSERT INTO public.system_settings (id, key, value)
VALUES 
('set-01', 'general', '{
    "appName": "SIMMAS",
    "appDescription": "Sistem Informasi Manajemen Magang Siswa",
    "contactEmail": "info@simmas.sch.id"
}'::jsonb),
('set-02', 'landing', '{
    "heroTitle": "Magang\nlebih\nteratur.",
    "heroSubtitle": "Sistem Informasi Manajemen Magang Siswa",
    "heroDescription": "Platform manajemen magang siswa SMK yang menghubungkan sekolah, guru pembimbing, dan dunia usaha dalam satu sistem terpadu."
}'::jsonb),
('set-03', 'school', '{
    "schoolName": "SMK Negeri 1 Surabaya",
    "schoolAddress": "Jl. SMEA No. 4, Wonokromo, Surabaya",
    "schoolPhone": "(031) 8292038",
    "schoolWebsite": "www.smkn1-sby.sch.id",
    "principalName": "Drs. H. Sugiyono, M.Pd.",
    "principalNip": "196503151989031008"
}'::jsonb)
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value;

-- J. AUDIT LOGS
INSERT INTO public.audit_logs (id, action, target, actor_email, actor_role, level, ip_address, details)
VALUES
('log-01', 'SYSTEM_INITIALIZE', 'Supabase Database', 'admin@simmas.sch.id', 'Admin', 'INFO', '127.0.0.1', '{"message": "Database schema and seed initialized successfully"}'::jsonb),
('log-02', 'PENGAJUAN_CREATED', 'PT Telkom Indonesia', 'siswa@simmas.sch.id', 'Siswa', 'INFO', '127.0.0.1', '{"position": "Mobile Developer"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
