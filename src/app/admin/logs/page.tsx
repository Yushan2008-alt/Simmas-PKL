"use client";

import * as React from "react";
import {
  ScrollText,
  Search,
  Trash2,
  AlertTriangle,
  Info,
  AlertCircle,
  Clock,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAuditLogs, clearAuditLogs } from "@/lib/supabase/services";
import { useRealtimeTable } from "@/hooks/use-realtime";
import { AuditLog, LogLevel } from "@/types/database";

export default function AuditLogsPage() {
  const [logs, setLogs] = React.useState<AuditLog[]>([]);
  const [search, setSearch] = React.useState("");
  const [filterLevel, setFilterLevel] = React.useState("Semua");
  const [loading, setLoading] = React.useState(true);
  const [isClearOpen, setIsClearOpen] = React.useState(false);

  const fetchLogs = React.useCallback(async () => {
    try {
      const data = await getAuditLogs();
      setLogs(data);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useRealtimeTable("audit_logs", fetchLogs);

  const handleConfirmClear = async () => {
    try {
      await clearAuditLogs();
      setIsClearOpen(false);
      toast.success("Riwayat log audit berhasil dibersihkan");
      fetchLogs();
    } catch (e) {
      toast.error("Gagal membersihkan log");
    }
  };

  const filteredLogs = logs.filter((l) => {
    const matchSearch =
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      (l.target && l.target.toLowerCase().includes(search.toLowerCase())) ||
      l.actor_email.toLowerCase().includes(search.toLowerCase());
    const matchLevel = filterLevel === "Semua" || l.level === filterLevel;
    return matchSearch && matchLevel;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
            Log Aktivitas &amp; Audit Sistem
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Pencatatan riwayat setiap operasi Create, Update, dan Delete yang terjadi di SIMMAS.
          </p>
        </div>
        {logs.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsClearOpen(true)}
            className="gap-2 text-xs font-bold text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
            <span>Bersihkan Log</span>
          </Button>
        )}
      </div>

      {/* Filters: Shortened search input directly beside the level filter */}
      <div className="flex flex-wrap items-center gap-3 bg-card p-4 rounded-2xl border border-border">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari aksi, target, aktor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 bg-muted/20 text-xs sm:text-sm w-full"
          />
        </div>
        <div className="w-full sm:w-auto">
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="h-10 px-3 rounded-lg border border-border bg-background text-xs font-semibold text-foreground outline-none w-full sm:w-auto"
          >
            <option value="Semua">Semua Level</option>
            <option value="INFO">INFO</option>
            <option value="WARNING">WARNING</option>
            <option value="ERROR">ERROR</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground">
              <tr>
                <th className="px-5 py-3.5">Aksi &amp; Keterangan</th>
                <th className="px-5 py-3.5">Target</th>
                <th className="px-5 py-3.5">Aktor</th>
                <th className="px-5 py-3.5">Level</th>
                <th className="px-5 py-3.5 text-right">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground font-sans">
                    <ScrollText className="h-9 w-9 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="font-semibold text-sm">Tidak ada catatan log aktivitas</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Setiap aktivitas CRUD akan terekam secara otomatis di sini.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3.5 font-sans">
                      <p className="font-bold text-foreground text-xs">{log.action}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">IP: {log.ip_address}</p>
                    </td>
                    <td className="px-5 py-3.5 font-sans font-medium text-foreground">
                      {log.target || "-"}
                    </td>
                    <td className="px-5 py-3.5 font-sans">
                      <p className="font-semibold text-foreground text-xs">{log.actor_email}</p>
                      <p className="text-[10px] text-muted-foreground">{log.actor_role}</p>
                    </td>
                    <td className="px-5 py-3.5 font-sans">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.level === "INFO"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : log.level === "WARNING"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {log.level}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-[11px] text-muted-foreground">
                      {new Date(log.created_at).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CLEAR LOGS */}
      {isClearOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-background shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="p-2.5 rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Bersihkan Riwayat Log</h3>
                <p className="text-xs text-muted-foreground">Konfirmasi pembersihan</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed mb-6">
              Apakah Anda yakin ingin menghapus seluruh riwayat audit log aktivitas sistem?
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsClearOpen(false)}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleConfirmClear}
                className="font-bold"
              >
                Bersihkan Semua
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
