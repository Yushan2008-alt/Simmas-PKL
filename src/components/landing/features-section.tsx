import { BookOpen, Users, Briefcase } from "lucide-react";

export function FeaturesSection() {
  const roleFeatures = [
    {
      roleLabel: "Untuk Siswa",
      title: "Jurnal & Kehadiran",
      description:
        "Catat jurnal harian dan isi daftar hadir secara digital dari mana saja, kapan saja dengan validasi presisi.",
      icon: BookOpen,
    },
    {
      roleLabel: "Untuk Guru Pembimbing",
      title: "Monitoring Terpadu",
      description:
        "Pantau aktivitas, setujui jurnal, dan evaluasi performa siswa magang secara real-time dalam satu dashboard.",
      icon: Users,
    },
    {
      roleLabel: "Untuk Admin Sekolah",
      title: "Manajemen Penempatan",
      description:
        "Kelola data DUDI, plotting pembimbing, kuota magang, dan cetak surat pengantar secara otomatis.",
      icon: Briefcase,
    },
  ];

  return (
    <section id="features" className="pt-16 lg:pt-20 pb-6 lg:pb-8 bg-muted/30 relative overflow-hidden">
      {/* Decorative circle */}
      <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full border-[48px] border-primary/5 pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <div className="mb-8 lg:mb-10">
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground mb-2.5">
            Fitur Platform
          </p>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-foreground max-w-lg">
            Solusi untuk
            <br />
            <span className="text-primary">setiap peran.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5 lg:gap-6">
          {roleFeatures.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={index}
                className="group flex flex-col p-6 lg:p-7 rounded-2xl bg-background border border-border/80 hover:border-primary/40 hover:shadow-md transition-all duration-300"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <IconComponent className="h-5 w-5" />
                </div>
                <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-muted-foreground mb-1.5">
                  {item.roleLabel}
                </p>
                <h3 className="text-lg font-bold text-foreground tracking-tight mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
