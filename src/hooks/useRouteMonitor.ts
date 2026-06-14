"use client";

import { useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import type { OccupancyReport, VehiclePosition } from "@/lib/types";

export interface MonitorEvent {
  id: string;
  at: number;
  kind: "position" | "occupancy" | "system";
  text: string;
}

export interface MonitorState {
  configured: boolean;
  connected: boolean;
  status: string;
  presence: { waiting: number; riding: number; total: number };
  lastPosition: VehiclePosition | null;
  lastPositionAt: number | null;
  lastOccupancy: OccupancyReport | null;
  lastOccupancyAt: number | null;
  /** Eventos realtime recibidos en esta sesión de monitoreo. */
  received: number;
  events: MonitorEvent[];
}

const MAX_EVENTS = 60;

function toTime(value?: string): number {
  return value ? new Date(value).getTime() : Date.now();
}

function short(src: string): string {
  return src.length > 8 ? `${src.slice(0, 6)}…` : src;
}

function eventId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function useRouteMonitor(routeId: string): MonitorState {
  const [state, setState] = useState<MonitorState>({
    configured: isSupabaseConfigured,
    connected: false,
    status: "init",
    presence: { waiting: 0, riding: 0, total: 0 },
    lastPosition: null,
    lastPositionAt: null,
    lastOccupancy: null,
    lastOccupancyAt: null,
    received: 0,
    events: [],
  });

  const channelRef = useRef<RealtimeChannel | null>(null);

  const pushEvent = (kind: MonitorEvent["kind"], text: string) => {
    setState((prev) => ({
      ...prev,
      events: [
        { id: eventId(), at: Date.now(), kind, text },
        ...prev.events,
      ].slice(0, MAX_EVENTS),
    }));
  };

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setState((s) => ({ ...s, status: "sin-config" }));
      return;
    }
    const client = supabase;
    let active = true;

    pushEvent("system", "Conectando al canal de la ruta…");

    (async () => {
      const [{ data: pos, error: posErr }, { data: occ, error: occErr }] =
        await Promise.all([
          client
            .from("vehicle_positions")
            .select("*")
            .eq("route_id", routeId)
            .order("created_at", { ascending: false })
            .limit(1),
          client
            .from("occupancy_reports")
            .select("*")
            .eq("route_id", routeId)
            .order("created_at", { ascending: false })
            .limit(1),
        ]);

      if (!active) return;

      if (posErr || occErr) {
        pushEvent(
          "system",
          `Error leyendo estado inicial: ${posErr?.message ?? occErr?.message}`
        );
      }

      setState((prev) => ({
        ...prev,
        lastPosition: pos?.[0] ?? null,
        lastPositionAt: pos?.[0] ? toTime(pos[0].created_at) : null,
        lastOccupancy: occ?.[0] ?? null,
        lastOccupancyAt: occ?.[0] ? toTime(occ[0].created_at) : null,
      }));

      if (pos?.[0]) {
        pushEvent(
          "position",
          `Última posición conocida (${pos[0].lat.toFixed(5)}, ${pos[0].lng.toFixed(5)}) · ${short(pos[0].source_id)}`
        );
      }
    })();

    const channel = client.channel(`monitor:${routeId}`, {
      config: { presence: { key: "monitor" } },
    });
    channelRef.current = channel;

    channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "vehicle_positions",
          filter: `route_id=eq.${routeId}`,
        },
        (payload) => {
          const row = payload.new as VehiclePosition;
          setState((prev) => ({
            ...prev,
            lastPosition: row,
            lastPositionAt: toTime(row.created_at),
            received: prev.received + 1,
            events: [
              {
                id: eventId(),
                at: Date.now(),
                kind: "position" as const,
                text: `📍 (${row.lat.toFixed(5)}, ${row.lng.toFixed(5)}) · ${short(row.source_id)}`,
              },
              ...prev.events,
            ].slice(0, MAX_EVENTS),
          }));
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "occupancy_reports",
          filter: `route_id=eq.${routeId}`,
        },
        (payload) => {
          const row = payload.new as OccupancyReport;
          setState((prev) => ({
            ...prev,
            lastOccupancy: row,
            lastOccupancyAt: toTime(row.created_at),
            received: prev.received + 1,
            events: [
              {
                id: eventId(),
                at: Date.now(),
                kind: "occupancy" as const,
                text: `🪑 ocupación: ${row.level} · ${short(row.source_id)}`,
              },
              ...prev.events,
            ].slice(0, MAX_EVENTS),
          }));
        }
      )
      .on("presence", { event: "sync" }, () => {
        const presenceState = channel.presenceState<{ mode?: string }>();
        let waiting = 0;
        let riding = 0;
        for (const entries of Object.values(presenceState)) {
          const meta = entries[0] as { mode?: string } | undefined;
          if (meta?.mode === "riding") riding += 1;
          else waiting += 1;
        }
        setState((prev) => ({
          ...prev,
          presence: { waiting, riding, total: waiting + riding },
        }));
      })
      .subscribe((status) => {
        setState((prev) => ({
          ...prev,
          connected: status === "SUBSCRIBED",
          status,
        }));
        pushEvent("system", `Canal: ${status}`);
      });

    return () => {
      active = false;
      channelRef.current = null;
      client.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeId]);

  return state;
}
