"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  Building2,
  Clock,
  ArrowRight,
  TrendingUp,
  Activity,
  Plus,
  ShieldCheck,
  Briefcase,
  CheckCircle2,
  XCircle,
  ChevronRight,
  MapPin,
  Calendar,
  ExternalLink,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  getGuruList,
  getSiswaList,
  getDudiList,
  getPenempatanList,
  getAuditLogs,
} from "@/lib/supabase/services";
import { useRealtimeTable } from "@/hooks/use-realtime";
import { Siswa, Guru, Dudi, Penempatan, AuditLog } from "@/types/database";

export default function AdminDashboardPage() {
  const [siswa, setSiswa] = React.useState<Siswa[]>([]);
  const [guru, setGuru] = React.useState<Guru[]>([]);
  const [dudi, setDudi] = React.useState<Dudi[]>([]);
  const [penempatan, setPenempatan] = React.useState<Penempatan[]>([]);
  const [logs, setLogs] = React.useState<AuditLog[]>([]);
  const [loading, setLoading] = React.useState(true);

  const loadAllData = React.useCallback(async () => {
    try {
      const [sData, gData, dData, pData, lData] = await Promise.all([
        getSiswaList(),
        getGuruList(),
        getDudiList(),
        getPenempatanList(),
        getAuditLogs(),
      ]);
      setSiswa(sData);
      setGuru(gData);
      setDudi(dData);
      setPenempatan(pData);
      setLogs(lData);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Realtime subscriptions across all relevant tables
  useRealtimeTable("siswa", loadAllData);
  useRealtimeTable("guru", loadAllData);
  useRealtimeTable("dudi", loadAllData);
  useRealtimeTable("penempatan", loadAllData);
  useRealtimeTable("audit_logs", loadAllData);

  // 1. Computed KPI Metrics
  const totalSiswa = siswa.length;
  const totalGuru = guru.length;
  const totalDudi = dudi.length;
  const pendingDudiCount = dudi.filter((d) => d.status === "Menunggu Validasi").length;
  const pendingPenempatanCount = penempatan.filter(
    (p) => (p.status as any) === "Menunggu" || (p.status as any) === "Menunggu Validasi"
  ).length;
  const totalPendingValidation = pendingDudiCount + pendingPenempatanCount;

  // 2. Status Pengajuan Breakdown
  const disetujuiCount = penempatan.filter(
    (p) => p.status === "Berlangsung" || (p.status as any) === "Disetujui" || p.status === "Selesai"
  ).length;
  const menungguCount = pendingPenempatanCount;
  const ditolakCount = penempatan.filter(
    (p) => p.status === "Dibatalkan" || (p.status as any) === "Ditolak"
  ).length;

  const totalPengajuan = disetujuiCount + menungguCount + ditolakCount;
  const disetujuiPct = totalPengajuan > 0 ? Math.round((disetujuiCount / totalPengajuan) * 100) : 0;
  const menungguPct = totalPengajuan > 0 ? Math.round((menungguCount / totalPengajuan) * 100) : 0;
  const ditolakPct = totalPengajuan > 0 ? Math.round((ditolakCount / totalPengajuan) * 100) : 0;

  // 3. Dynamic Real 6-Month Submission Trend
  const monthlyTrend = React.useMemo(() => {
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
    ];
    const now = new Date();
    const result = [];

    // Generate last 6 months in chronological order
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mIndex = d.getMonth();
      const year = d.getFullYear();
      const label = monthNames[mIndex];

      // Count placements created in this year & month from real data
      const count = penempatan.filter((p) => {
        if (!p.created_at) return false;
        const pDate = new Date(p.created_at);
        return pDate.getFullYear() === year && pDate.getMonth() === mIndex;
      }).length;

      result.push({ month: label, count });
    }
    return result;
  }, [penempatan]);

  // Max count to dynamically scale Y-Axis while keeping flat line at 0 if no data
  const maxMonthlyCount = Math.max(...monthlyTrend.map((m) => m.count));

  // 4. Filter Logs for Today
  const todayLogs = React.useMemo(() => {
    const todayStr = new Date().toDateString();
    return logs.filter((log) => {
      try {
        return new Date(log.created_at).toDateString() === todayStr;
      } catch {
        return false;
      }
    });
  }, [logs]);

  // 5. Sebaran Siswa Per Tempat Magang (Industri yang ada siswa magangnya saja)
  const activeIndustriesWithStudents = React.useMemo(() => {
    const activePlacements = penempatan.filter((p) => p.status !== "Dibatalkan");
    const dudiMap = new Map<string, { dudi: Dudi; placements: Penempatan[] }>();

    activePlacements.forEach((p) => {
      if (!p.dudi_id) return;
      if (!dudiMap.has(p.dudi_id)) {
        const foundDudi = dudi.find((d) => d.id === p.dudi_id) || p.dudi;
        if (foundDudi) {
          dudiMap.set(p.dudi_id, { dudi: foundDudi, placements: [] });
        }
      }
      const entry = dudiMap.get(p.dudi_id);
      if (entry) {
        entry.placements.push(p);
      }
    });

    // CRITICAL: Filter ONLY industries that currently have placed students!
    return Array.from(dudiMap.values()).filter((item) => item.placements.length > 0);
  }, [penempatan, dudi]);

  // Format today date in Indonesian (e.g. SELASA, 15 SEPTEMBER 2026)
  const todayFormatted = React.useMemo(() => {
    const days = ["MINGGU", "SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU"];
    const months = [
      "JANUARI", "FEBRUARI", "MARET", "APRIL", "MEI", "JUNI",
      "JULI", "AGUSTUS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DESEMBER"
    ];
    const now = new Date();
    const day = days[now.getDay()];
    const date = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    return `${day}, ${date} ${month} ${year}`;
  }, []);

  return (
    <div className="w-full space-y-8">
      {/* 1. Top Banner Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/10">
        <div>
          <p className="text-[11px] font-bold text-blue-100 tracking-wider uppercase mb-1.5">
            {todayFormatted}
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Selamat datang kembali, Admin
          </h2>
          <p className="text-xs sm:text-sm text-blue-100/90 mt-1 max-w-xl">
            {totalPendingValidation > 0
              ? `${totalPendingValidation} pengajuan magang atau industri memerlukan validasi Anda.`
              : "Belum ada pengajuan magang yang perlu divalidasi hari ini."}
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/admin/penempatan">
            <Button
              variant="white"
              size="sm"
              className="gap-2 shadow-sm font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50/90 transition-all"
            >
              <span>Tinjau Pengajuan</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. 4 KPI Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Total Siswa */}
        <Link
          href="/admin/siswa"
          className="p-5 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Total Siswa
            </span>
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {totalSiswa}
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">Lihat data siswa</span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        </Link>

        {/* Card 2: Guru Pembimbing */}
        <Link
          href="/admin/guru"
          className="p-5 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Guru Pembimbing
            </span>
            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <GraduationCap className="h-5 w-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {totalGuru}
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">Lihat data guru</span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        </Link>

        {/* Card 3: Mitra DUDI */}
        <Link
          href="/admin/dudi"
          className="p-5 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Mitra DUDI
            </span>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {totalDudi}
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">Lihat mitra DUDI</span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        </Link>

        {/* Card 4: Menunggu Validasi */}
        <Link
          href="/admin/penempatan"
          className="p-5 rounded-2xl bg-card border border-border hover:border-amber-400/50 hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Menunggu Validasi
            </span>
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {totalPendingValidation}
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground group-hover:text-amber-600 transition-colors">Perlu verifikasi</span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        </Link>
      </div>

      {/* 3. Row 1: Tren Pengajuan Magang (Grafik Garis) & Status Pengajuan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Tren Pengajuan Magang (6 Bulan Terakhir Real-time) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-card border border-border shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-foreground tracking-tight">
                  Tren Pengajuan Magang
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Jumlah pengajuan &amp; persetujuan 6 bulan terakhir
                </p>
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200/80 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                <span>Real-time Live</span>
              </span>
            </div>

            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthlyTrend}
                  margin={{ top: 10, right: 15, left: -25, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorTren" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#e2e8f0" }}
                  />
                  <YAxis
                    domain={[0, maxMonthlyCount > 0 ? "auto" : 5]}
                    allowDecimals={false}
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#e2e8f0" }}
                  />
                  <Tooltip
                    formatter={(value: any) => [`${value} Pengajuan`, "Pengajuan Magang"]}
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      fontSize: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorTren)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="pt-3 border-t border-border/80 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Grafik bersumber dari tanggal pengajuan penempatan siswa</span>
            <span className="font-semibold text-foreground">
              Total {disetujuiCount} Aktif Ditempatkan
            </span>
          </div>
        </div>

        {/* Right: Status Pengajuan (Sesuai Referensi) */}
        <div className="p-6 rounded-2xl bg-card border border-border shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-foreground tracking-tight">
                  Status Pengajuan
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Distribusi status magang siswa
                </p>
              </div>
              <Link
                href="/admin/penempatan"
                className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-0.5"
              >
                <span>Detail</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-5">
              {/* Item 1: Disetujui */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                    <span className="font-bold text-foreground">Disetujui</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-foreground">
                      {disetujuiCount}
                    </span>
                    <span className="text-xs text-muted-foreground font-semibold">
                      {disetujuiPct}%
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-muted/40 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${disetujuiPct}%` }}
                  />
                </div>
              </div>

              {/* Item 2: Menunggu */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                      <Clock className="h-3.5 w-3.5" />
                    </div>
                    <span className="font-bold text-foreground">Menunggu</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-foreground">
                      {menungguCount}
                    </span>
                    <span className="text-xs text-muted-foreground font-semibold">
                      {menungguPct}%
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-muted/40 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${menungguPct}%` }}
                  />
                </div>
              </div>

              {/* Item 3: Ditolak */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
                      <XCircle className="h-3.5 w-3.5" />
                    </div>
                    <span className="font-bold text-foreground">Ditolak</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-foreground">
                      {ditolakCount}
                    </span>
                    <span className="text-xs text-muted-foreground font-semibold">
                      {ditolakPct}%
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-muted/40 overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all duration-500"
                    style={{ width: `${ditolakPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border/80 flex items-center justify-between text-xs text-muted-foreground">
            <span>Total Pengajuan:</span>
            <span className="font-bold text-foreground">{totalPengajuan} Siswa</span>
          </div>
        </div>
      </div>

      {/* 4. Row 2: Aktivitas Sistem Terakhir (Hari Ini) & Kelola Data (Quick Nav Side Navbar) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kolom Kiri: Log Aktivitas Terakhir Pada Hari Ini */}
        <div className="p-6 rounded-2xl bg-card border border-border shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-foreground tracking-tight">
                  Aktivitas Sistem Terakhir
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Log aktivitas hari ini secara real-time dari seluruh pengguna
                </p>
              </div>
              <Link
                href="/admin/logs"
                className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
              >
                <span>Lihat semua log</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {todayLogs.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">
                <Activity className="h-9 w-9 mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-xs font-semibold text-foreground">
                  Belum ada riwayat aktivitas pada hari ini
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5 max-w-sm mx-auto">
                  Aktivitas login, penambahan, pengeditan, atau penghapusan data hari ini akan langsung tercatat secara real-time di sini.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayLogs.slice(0, 5).map((log) => {
                  const initials = (log.actor_email || "AD")
                    .substring(0, 2)
                    .toUpperCase();
                  return (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-muted/20 border border-border/70 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-700 font-bold text-[11px] flex items-center justify-center border border-blue-200 shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">
                            {log.action}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {log.actor_email} → {log.target || "SYSTEM"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          {log.level || "INFO"}
                        </span>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {new Date(log.created_at).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-border/80 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sistem Logging Real-time Aktif</span>
            </span>
            <span className="font-mono text-[11px]">{todayLogs.length} aktivitas hari ini</span>
          </div>
        </div>

        {/* Kolom Kanan: Kelola Data (Fast / Quick Navigasi Side Navbar) */}
        <div className="p-6 rounded-2xl bg-card border border-border shadow-xs flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h3 className="text-base font-bold text-foreground tracking-tight">
                Kelola Data
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pintasan navigasi dan manajemen data master
              </p>
            </div>

            <div className="space-y-2">
              {/* Quick Nav 1: Data Siswa */}
              <Link
                href="/admin/siswa"
                className="p-3 rounded-xl bg-card border border-border/80 hover:border-primary/50 hover:bg-muted/30 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Data Siswa</p>
                    <p className="text-[11px] text-muted-foreground">
                      {totalSiswa} siswa terdaftar
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </Link>

              {/* Quick Nav 2: Data Guru */}
              <Link
                href="/admin/guru"
                className="p-3 rounded-xl bg-card border border-border/80 hover:border-primary/50 hover:bg-muted/30 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Data Guru</p>
                    <p className="text-[11px] text-muted-foreground">
                      {totalGuru} guru pembimbing aktif
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </Link>

              {/* Quick Nav 3: Mitra DUDI */}
              <Link
                href="/admin/dudi"
                className="p-3 rounded-xl bg-card border border-border/80 hover:border-primary/50 hover:bg-muted/30 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Mitra DUDI</p>
                    <p className="text-[11px] text-muted-foreground">
                      {totalDudi} perusahaan terverifikasi
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </Link>

              {/* Quick Nav 4: Penempatan Magang */}
              <Link
                href="/admin/penempatan"
                className="p-3 rounded-xl bg-card border border-border/80 hover:border-primary/50 hover:bg-muted/30 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Penempatan Magang</p>
                    <p className="text-[11px] text-muted-foreground">
                      {disetujuiCount} aktif • {menungguCount} menunggu validasi
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </Link>

              {/* Quick Nav 5: Monitoring Global */}
              <Link
                href="/admin/monitoring"
                className="p-3 rounded-xl bg-card border border-border/80 hover:border-primary/50 hover:bg-muted/30 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Monitoring Global</p>
                    <p className="text-[11px] text-muted-foreground">
                      Pantau absensi &amp; jurnal siswa
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          </div>

          <div className="pt-4 mt-3 border-t border-border/80 flex items-center justify-between text-xs text-muted-foreground">
            <span>5 Modul Terhubung</span>
            <Link
              href="/admin/penempatan"
              className="text-primary font-bold hover:underline flex items-center gap-1"
            >
              <span>+ Plotting Baru</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 5. Row 3: Sebaran Siswa Per Tempat Magang (Paling Bawah - Minimalis Sesuai Desain) */}
      <div className="p-6 sm:p-7 rounded-2xl bg-card border border-border shadow-xs">
        <div className="mb-6">
          <h3 className="text-base font-bold text-foreground tracking-tight">
            Sebaran Siswa per Tempat Magang
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Jumlah siswa aktif magang di tiap mitra DUDI
          </p>
        </div>

        {/* Jika belum ada mitra DUDI */}
        {dudi.length === 0 ? (
          <div className="py-12 px-4 rounded-2xl border border-dashed border-border/80 bg-muted/10 text-center">
            <Building2 className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <h4 className="text-sm font-bold text-foreground">
              Belum ada mitra DUDI terdaftar
            </h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto leading-relaxed">
              Daftarkan mitra DUDI terlebih dahulu di menu Data DUDI.
            </p>
            <div className="mt-4">
              <Link href="/admin/dudi">
                <Button size="sm" className="gap-2 font-bold shadow-xs">
                  <Plus className="h-4 w-4" />
                  <span>Tambah DUDI</span>
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border/80 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="pb-3 text-left font-bold">MITRA DUDI</th>
                  <th className="pb-3 text-right font-bold pr-10 sm:pr-16">SISWA MAGANG</th>
                  <th className="pb-3 text-left font-bold w-44 sm:w-56">PROPORSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {dudi.map((industry) => {
                  const placements = penempatan.filter(
                    (p) => p.dudi_id === industry.id && p.status !== "Dibatalkan"
                  );
                  const studentCount = placements.length;
                  const quota = industry.quota || 1;
                  const filledPercentage = quota > 0 ? Math.min(Math.round((studentCount / quota) * 100), 100) : 0;

                  return (
                    <tr key={industry.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-4 pr-4">
                        <p className="text-sm font-bold text-foreground">{industry.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {industry.address || "Lokasi industri"}
                        </p>
                      </td>
                      <td className="py-4 pr-10 sm:pr-16 text-right whitespace-nowrap">
                        <span className="text-sm font-extrabold text-foreground">{studentCount}</span>
                        <span className="text-xs font-semibold text-muted-foreground">/{quota}</span>
                      </td>
                      <td className="py-4">
                        <div className="w-32 sm:w-44 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                            style={{ width: `${Math.max(filledPercentage, studentCount > 0 ? 10 : 0)}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
