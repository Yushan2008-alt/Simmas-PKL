import * as React from "react";
import Link from "next/link";
import { GraduationCap, CheckCircle2 } from "lucide-react";

export function LoginBrandingPanel() {
  const valueProps = [
    "Penempatan magang terpusat & transparan",
    "Monitoring kehadiran & jurnal real-time",
    "Koordinasi sekolah, guru, dan industri",
  ];

  const miniStats = [
    { value: "50+", label: "SMK Aktif" },
    { value: "10k+", label: "Siswa Terdaftar" },
    { value: "200+", label: "Mitra DUDI" },
  ];

  return (
    <aside className="hidden lg:flex lg:w-[46%] xl:w-[42%] relative flex-col overflow-hidden bg-primary select-none shrink-0 p-10 xl:p-14 text-primary-foreground">
      {/* Background Decorative Rings */}
      <div className="absolute -top-24 -right-24 h-[420px] w-[420px] rounded-full border-[56px] border-primary-foreground/10 pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full border-[40px] border-primary-foreground/[0.07] pointer-events-none" />
      <div
        className="absolute bottom-0 right-0 w-32 h-full bg-primary-foreground/[0.04] pointer-events-none"
        style={{ clipPath: "polygon(40% 0, 100% 0, 100% 100%, 0% 100%)" }}
      />

      {/* Brand Header */}
      <div className="relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 hover:opacity-90 transition-opacity"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm p-1.5 text-primary">
            <div className="flex shrink-0 items-center justify-center rounded-lg bg-blue-600 shadow-sm h-full w-full text-white">
              <GraduationCap className="h-5 w-5" />
            </div>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">
            SIMMAS
          </span>
        </Link>
      </div>

      {/* Main Pitch in Middle */}
      <div className="relative z-10 flex-1 flex flex-col justify-center my-auto py-8">
        <p className="text-xs uppercase tracking-[0.2em] font-semibold text-primary-foreground/60 mb-5">
          Sistem Informasi Manajemen Magang Siswa
        </p>
        <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-[1.1] tracking-tight mb-6">
          Magang
          <br />
          <span className="text-primary-foreground/60">lebih</span>
          <br />
          teratur.
        </h1>
        <p className="text-sm xl:text-base text-primary-foreground/80 leading-relaxed max-w-sm mb-10">
          Platform manajemen magang siswa SMK yang menghubungkan sekolah, guru pembimbing, dan dunia usaha dalam satu sistem terpadu.
        </p>

        {/* 3 Value Propositions */}
        <ul className="space-y-3.5">
          {valueProps.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary-foreground/75 shrink-0 mt-0.5" />
              <span className="text-sm text-primary-foreground/90 font-medium leading-snug">
                {item}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Mini Stats Footer */}
      <div className="relative z-10 border-t border-primary-foreground/15 pt-6 flex items-center gap-6">
        {miniStats.map((stat, idx) => (
          <React.Fragment key={idx}>
            <div>
              <p className="text-2xl font-extrabold text-white tracking-tight">
                {stat.value}
              </p>
              <p className="text-xs text-primary-foreground/60 font-medium mt-0.5">
                {stat.label}
              </p>
            </div>
            {idx < miniStats.length - 1 && (
              <div className="w-px h-8 bg-primary-foreground/15" />
            )}
          </React.Fragment>
        ))}
      </div>
    </aside>
  );
}
