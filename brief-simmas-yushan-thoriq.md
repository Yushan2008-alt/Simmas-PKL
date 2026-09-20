# Project Brief: SIMMAS — Yushan-Thoriq Edition

## 1. Project Overview
- **Nama project:** simmas.yushan-thoriq
- **Deskripsi:** Platform manajemen magang/PKL SMK yang menghubungkan Siswa, Guru Pembimbing, Admin Sekolah, dan DUDI (dunia usaha/industri) dalam satu sistem terpadu.
- **Referensi desain & fitur:** https://simmas.bagus-hidayat.my.id/
- **Tahap saat ini:** Landing page + halaman `/login` statis (belum ada logic autentikasi).

## 2. Tech Stack
| Layer | Teknologi |
|---|---|
| Framework | Next.js (App Router) |
| UI Components | shadcn/ui (custom Tailwind utility class diminimalkan — andalkan komponen bawaan shadcn) |
| Backend/DB | Supabase (setup awal saja, belum aktif dipakai) |
| Deployment | Vercel |

> Catatan: shadcn/ui secara teknis tetap berjalan di atas Tailwind CSS (tidak bisa dilepas total), tapi penulisan custom utility class akan diminimalkan — styling mengandalkan komponen shadcn yang sudah jadi.

## 3. Target Pengguna (Role)
Sistem punya **3 role**:
- **Admin** — mengelola data DUDI, plotting pembimbing, cetak surat otomatis
- **Guru** (Pembimbing) — memantau aktivitas, menyetujui jurnal, evaluasi performa siswa
- **Siswa** — mencatat jurnal harian & absensi magang

## 4. Scope Halaman (Tahap Ini)
| Route | Deskripsi |
|---|---|
| `/` | Landing page (marketing/promosi) |
| `/login` | Halaman login statis — UI saja, form belum terhubung ke Supabase Auth |

## 5. Struktur Konten Landing Page

### 5.1 Navbar
- Logo "SIMMAS" (branding warna biru)
- Nav links: `Fitur` (#features), `Panduan` (#panduan)
- CTA: `Masuk`, `Mulai Sekarang` → keduanya mengarah ke `/login`

### 5.2 Hero Section
- Headline: **"Magang lebih teratur."**
- Subheadline: deskripsi singkat platform (sekolah, guru pembimbing, dunia usaha dalam satu sistem)
- 3 value props (bullet list):
  - Penempatan magang terpusat & transparan
  - Monitoring kehadiran & jurnal real-time
  - Koordinasi sekolah, guru, dan industri
- CTA buttons: `Mulai Sekarang`, `Lihat Fitur`
- Dashboard mockup (image/ilustrasi)
- Badge "Live" + counter siswa aktif (data dummy)

### 5.3 Fitur Section (per Role)
Tiga card, masing-masing untuk satu role:
| Role | Judul Fitur | Deskripsi Singkat |
|---|---|---|
| Siswa | Jurnal & Kehadiran | Catat jurnal harian & isi absensi digital dari mana saja |
| Guru Pembimbing | Monitoring Terpadu | Pantau aktivitas, setujui jurnal, evaluasi performa siswa |
| Admin Sekolah | Manajemen Penempatan | Kelola data DUDI, plotting pembimbing, cetak surat otomatis |

### 5.4 Akurasi Data Section
- Highlight: presisi pencatatan kehadiran + validasi lokasi magang
- Fitur tambahan (list):
  - Export Laporan Otomatis (PDF/Excel)
  - Notifikasi Real-time untuk Guru
  - Riwayat Penempatan per Angkatan
- Stat cards (data dummy sementara):
  - Jurnal Disetujui
  - Absensi Tercatat (%)
  - Siswa Aktif
  - Perusahaan Mitra

### 5.5 Cara Kerja Section (4 Langkah)
1. **Registrasi DUDI** — admin daftarkan industri & kuota penempatan
2. **Pengajuan Siswa** — siswa pilih/ajukan tempat magang via dashboard
3. **Persetujuan & Surat** — sekolah cetak surat pengantar otomatis
4. **Monitoring** — siswa isi jurnal, guru pantau real-time

### 5.6 CTA Section (Penutup)
- Headline ajakan digitalisasi magang
- Button: `Masuk ke Dashboard` → `/login`

### 5.7 Footer
- Logo + deskripsi singkat
- Kolom **Produk**: Fitur, Panduan, Keamanan
- Kolom **Akses**: Siswa, Guru Pembimbing, Administrator (semua → `/login`)
- Kolom **Legal**: Kebijakan Privasi, Ketentuan Layanan
- Copyright + versi aplikasi

## 6. Halaman `/login` (Statis)
- **Panel kiri:** value prop ringkas (sama seperti hero) + mini stats (SMK Aktif, Siswa Terdaftar, Mitra DUDI)
- **Panel kanan:** form login (Email Sekolah, Password, link "Lupa?", tombol "Masuk Dashboard")
- **Akun Demo:** 3 tombol quick-fill (Admin / Guru / Siswa) — hanya auto-fill email, belum terhubung ke logic auth sungguhan

## 7. Branding & Desain
- **Warna utama:** Biru `#2563eb` (mengikuti referensi SIMMAS)
- **Font:** Sans-serif modern (default shadcn / Inter atau sejenis)
- **Gaya visual:** Clean, modern, dashboard-esque — cocok untuk audiens sekolah/pendidikan Indonesia

## 8. Data Dummy
Karena Supabase baru tahap setup dan belum dipakai untuk fitur aktif, seluruh angka/statistik di landing page (badge "Live" siswa, Jurnal Disetujui, Absensi Tercatat, dll.) menggunakan **data dummy/hardcoded** terlebih dahulu.

## 9. Out of Scope (Tahap Ini)
- Autentikasi Supabase yang berfungsi (form login masih UI-only)
- Dashboard internal per role (siswa/guru/admin)
- Integrasi data real-time
- Export laporan PDF/Excel

## 10. Deployment
- **Platform:** Vercel
- **Target:** Production deploy untuk landing page + `/login` statis
