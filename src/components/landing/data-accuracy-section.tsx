import { CheckCircle2 } from "lucide-react";

export function DataAccuracySection() {
  const accuracyPoints = [
    "Export Laporan Otomatis (PDF/Excel)",
    "Notifikasi Real-time untuk Guru",
    "Riwayat Penempatan per Angkatan",
  ];

  const statMetrics = [
    { label: "Jurnal Disetujui", value: "142" },
    { label: "Absensi Tercatat", value: "98%" },
    { label: "Siswa Aktif", value: "324" },
    { label: "Perusahaan Mitra", value: "200+" },
  ];

  return (
    <section className="pt-4 lg:pt-6 pb-16 lg:pb-20 bg-muted/30 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* Left Column: Descriptions */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground mb-2.5">
              Lebih dari Catatan Digital
            </p>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-foreground mb-3">
              Akurasi data,
              <br />
              <span className="text-primary">setiap hari.</span>
            </h2>
            <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed mb-6 max-w-sm">
              SIMMAS memastikan akurasi data kehadiran dengan fitur pencatatan presisi dan validasi lokasi magang siswa SMK.
            </p>

            <ul className="space-y-2.5">
              {accuracyPoints.map((point, index) => (
                <li key={index} className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-xs sm:text-[13px] font-semibold text-foreground">
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column: Rotated Badge & 4 Stat Cards */}
          <div className="relative pt-3 pb-3">
            {/* Tilted Blue Backplate */}
            <div
              className="absolute inset-0 bg-primary rounded-2xl transition-transform"
              style={{ transform: "rotate(-2deg)" }}
            />

            {/* Front White/Card Container */}
            <div className="relative bg-background rounded-2xl border border-border p-6 sm:p-7 shadow-md">
              <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-muted-foreground mb-4">
                Ringkasan Mingguan
              </p>

              <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
                {statMetrics.map((stat, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 sm:p-4 rounded-xl bg-muted/50 border border-border hover:border-primary/30 transition-all"
                  >
                    <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.12em] font-bold text-muted-foreground mb-1">
                      {stat.label}
                    </p>
                    <p className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
