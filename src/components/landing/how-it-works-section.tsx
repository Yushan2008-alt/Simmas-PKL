import { Building2, UserPlus, FilePenLine, Presentation } from "lucide-react";

export function HowItWorksSection() {
  const steps = [
    {
      step: "01",
      title: "Registrasi DUDI",
      description:
        "Admin sekolah mendaftarkan daftar industri (DUDI) dan menetapkan kuota penempatan siswa.",
      icon: Building2,
    },
    {
      step: "02",
      title: "Pengajuan Siswa",
      description:
        "Siswa memilih atau mengajukan tempat magang melalui dashboard masing-masing.",
      icon: UserPlus,
    },
    {
      step: "03",
      title: "Persetujuan & Surat",
      description:
        "Sekolah mencetak surat pengantar otomatis untuk diserahkan ke pihak industri mitra.",
      icon: FilePenLine,
    },
    {
      step: "04",
      title: "Monitoring",
      description:
        "Siswa mengisi jurnal harian, guru memantau perkembangan secara real-time dari sistem.",
      icon: Presentation,
    },
  ];

  return (
    <section id="panduan" className="py-24 lg:py-32 bg-background relative overflow-hidden">
      {/* Decorative circle */}
      <div className="absolute -bottom-16 -left-16 h-80 w-80 rounded-full border-[48px] border-primary/5 pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <div className="mb-14 lg:mb-16">
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-muted-foreground mb-4">
            Cara Kerja
          </p>
          <h2 className="text-3xl md:text-4xl xl:text-5xl font-extrabold tracking-tight leading-[1.1] text-foreground max-w-xl">
            Empat langkah,
            <br />
            <span className="text-primary">satu sistem.</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, idx) => {
            const IconComp = item.icon;
            const isLast = idx === steps.length - 1;
            return (
              <div key={idx} className="relative group">
                {/* Connecting Line for desktop */}
                {!isLast && (
                  <div className="hidden lg:block absolute top-[28px] left-[calc(100%-12px)] w-full h-px bg-border/80 z-0 pointer-events-none" />
                )}

                <div className="relative z-10 flex flex-col p-7 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-md transition-all h-full">
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground group-hover:scale-105 transition-transform">
                      <IconComp className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-extrabold tracking-[0.2em] text-muted-foreground/70">
                      {item.step}
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold tracking-tight text-foreground mb-2.5">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
