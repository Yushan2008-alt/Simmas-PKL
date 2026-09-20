import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="relative overflow-hidden bg-primary py-24 lg:py-32">
      {/* Decorative Ornaments */}
      <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full border-[56px] border-primary-foreground/10 pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full border-[40px] border-primary-foreground/[0.07] pointer-events-none" />
      <div
        className="absolute bottom-0 right-0 w-48 h-full bg-primary-foreground/[0.04] pointer-events-none"
        style={{ clipPath: "polygon(40% 0, 100% 0, 100% 100%, 0% 100%)" }}
      />
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <p className="text-xs uppercase tracking-[0.2em] font-semibold text-primary-foreground/60 mb-6">
          Mulai Sekarang
        </p>
        <h2 className="text-4xl md:text-5xl xl:text-6xl font-extrabold tracking-tight leading-[1.05] text-primary-foreground mb-6">
          Siap untuk
          <br />
          <span className="text-primary-foreground/60">digitalisasi</span>
          <br />
          magang?
        </h2>
        <p className="text-base text-primary-foreground/80 max-w-md mx-auto mb-10 leading-relaxed">
          Tingkatkan efisiensi pemantauan dan evaluasi siswa magang dengan platform yang dirancang untuk produktivitas maksimal.
        </p>

        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 h-13 px-10 rounded-xl bg-white text-primary hover:bg-white/90 shadow-xl text-sm font-bold tracking-wide transition-all group active:scale-98"
        >
          <span>Masuk ke Dashboard</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
