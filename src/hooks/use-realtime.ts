"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

/**
 * Custom React Hook untuk berlangganan perubahan Supabase Realtime secara instan
 * @param table Nama tabel yang dipantau (e.g. 'guru', 'siswa', 'dudi', 'penempatan')
 * @param onUpdate Callback fungsi yang dieksekusi saat ada data INSERT, UPDATE, atau DELETE
 */
export function useRealtimeTable(table: string, onUpdate: () => void) {
  useEffect(() => {
    const channelName = `realtime-${table}-${Math.random().toString(36).substring(7)}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: table,
        },
        () => {
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, onUpdate]);
}
