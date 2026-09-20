"use client";

import Link from "next/link";
import {
  CheckCircle2,
  ArrowRight,
  Sparkles,
  CalendarCheck,
  FileCheck2,
  Building2,
  UserCheck,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-background pt-24 pb-12 lg:pt-0 lg:pb-0">
      {/* Decorative Background Elements */}
      <div className="absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full border-[72px] border-primary/10 pointer-events-none" />
      <div className="absolute top-1/3 -right-8 h-64 w-64 rounded-full border-[40px] border-primary/5 pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full border-[48px] border-border/80 pointer-events-none" />
      <div
        className="absolute top-0 right-0 h-full w-[38%] bg-primary pointer-events-none hidden lg:block"
        style={{
          clipPath: "polygon(18% 0, 100% 0, 100% 100%, 0% 100%)",
        }}
      />
      <div
        className="absolute top-0 right-0 h-full w-[38%] pointer-events-none hidden lg:block opacity-[0.07]"
        style={{
          clipPath: "polygon(18% 0, 100% 0, 100% 100%, 0% 100%)",
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column: Text & Value Props */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-[0.15em] mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Sistem Informasi Manajemen Magang Siswa</span>
            </div>

            <h1 className="text-5xl md:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.05] text-foreground mb-6 whitespace-pre-line">
              Magang{"\n"}
              <span className="text-primary">lebih</span>{"\n"}
              teratur.
            </h1>

            <p className="text-base text-muted-foreground leading-relaxed max-w-md mb-8">
              Platform manajemen magang siswa SMK yang menghubungkan sekolah, guru pembimbing, dan dunia usaha dalam satu sistem terpadu.
            </p>

            {/* 3 Value Propositions */}
            <ul className="space-y-3 mb-10">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm font-medium text-foreground">
                  Penempatan magang terpusat &amp; transparan
                </span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm font-medium text-foreground">
                  Monitoring kehadiran &amp; jurnal real-time
                </span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm font-medium text-foreground">
                  Koordinasi sekolah, guru, dan industri
                </span>
              </li>
            </ul>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3.5">
              <Link href="/login">
                <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-sm font-bold shadow-md shadow-primary/20">
                  <span>Mulai Sekarang</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 text-sm font-bold border-border bg-background hover:bg-muted">
                  Lihat Fitur
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: Interactive Dashboard Mockup Preview */}
          <div className="hidden lg:flex items-center justify-center relative">
            <div className="relative w-full max-w-[460px]">
              {/* Backing glow / shadow border */}
              <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xs pointer-events-none" />

              {/* Main Window Frame */}
              <div className="relative rounded-2xl overflow-hidden border border-border shadow-2xl bg-card text-card-foreground">
                {/* Browser/Window Header */}
                <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-muted/60">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                  <div className="ml-3 flex-1 h-5 rounded-md bg-background/80 border border-border/60 flex items-center px-2 text-[10px] text-muted-foreground font-mono">
                    simmas.sch.id/dashboard
                  </div>
                </div>

                {/* Window Inner Content (Interactive Mockup UI) */}
                <div className="p-5 space-y-4 bg-background">
                  {/* Top Bar inside dashboard */}
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                        YS
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground leading-tight">Yushan Thoriq</p>
                        <p className="text-[10px] text-muted-foreground">Siswa SMK • XII RPL 2</p>
                      </div>
                    </div>
                    <div className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Aktif Magang
                    </div>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-xl bg-muted/40 border border-border">
                      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                        <CalendarCheck className="h-3.5 w-3.5 text-primary" />
                        <span className="text-[10px] font-semibold">Kehadiran</span>
                      </div>
                      <p className="text-lg font-extrabold text-foreground">98.5%</p>
                      <div className="w-full bg-muted h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div className="bg-primary h-full rounded-full w-[98%]" />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-muted/40 border border-border">
                      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                        <FileCheck2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-[10px] font-semibold">Jurnal Disetujui</span>
                      </div>
                      <p className="text-lg font-extrabold text-foreground">42 Hari</p>
                      <p className="text-[9px] text-emerald-600 font-medium mt-1 flex items-center gap-0.5">
                        <TrendingUp className="h-2.5 w-2.5" /> 100% terisi
                      </p>
                    </div>
                  </div>

                  {/* Mitra Info */}
                  <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-blue-950">PT Telkom Indonesia</p>
                        <p className="text-[10px] text-blue-700">Divisi Software Engineering</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-primary px-2 py-0.5 rounded bg-white shadow-xs">
                      Kota Surabaya
                    </span>
                  </div>

                  {/* Recent Activity Mini Feed */}
                  <div className="space-y-2 pt-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Aktivitas Terakhir
                    </p>
                    <div className="p-2.5 rounded-lg border border-border/80 bg-muted/20 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-3.5 w-3.5 text-primary" />
                        <div>
                          <p className="text-[11px] font-semibold text-foreground">Absensi Datang (07:42 WIB)</p>
                          <p className="text-[9px] text-muted-foreground">Validasi GPS dalam radius lokasi PKL</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                        Tervalidasi
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Badge "Live: 324 Siswa" */}
              <div className="absolute -top-4 -right-4 bg-primary text-primary-foreground rounded-xl px-4 py-2.5 shadow-xl border border-white/20 animate-in fade-in zoom-in-95">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-[10px] uppercase tracking-[0.15em] font-extrabold text-primary-foreground/90">
                    Live
                  </p>
                </div>
                <p className="text-lg font-extrabold leading-none mt-1 text-white">324 Siswa</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
