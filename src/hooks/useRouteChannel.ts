"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { getSourceId } from "@/lib/sourceId";
import type {
  OccupancyLevel,
  OccupancyReport,
  RideMode,
  VehiclePosition,
} from "@/lib/types";

export interface PresenceCounts {
  /** Personas esperando (mirando) esta ruta ahora. */
  waiting: number;
  /** Personas que van arriba compartiendo ahora. */
  riding: number;
  total: number;
}

export interface RouteChannelState {
  position: VehiclePosition | null;
  occupancy: OccupancyReport | null;
  positionAt: number | null;
  occupancyAt: number | null;
  /** El último reporte/posición viene de este mismo navegador. */
  isOwnSource: boolean;
  connected: boolean;
  presence: PresenceCounts;
}

export interface RouteChannel extends RouteChannelState {
  configured: boolean;
  publishPosition: (lat: number, lng: number) => Promise<void>;
  publishOccupancy: (level: OccupancyLevel) => Promise<void>;
  /** Anuncia a la comunidad en qué modo estoy (esperando / a bordo). */
  announce: (mode: RideMode) => void;
}

interface PresenceMeta {
  mode: RideMode;
  source: string;
}

function toTime(value?: string): number {
  return value ? new Date(value).getTime() : Date.now();
}

export function useRouteChannel(routeId: string): RouteChannel {
  const [state, setState] = useState<RouteChannelState>({
    position: null,
    occupancy: null,
    positionAt: null,
    occupancyAt: null,
    isOwnSource: false,
    connected: false,
    presence: { waiting: 0, riding: 0, total: 0 },
  });

  const sourceIdRef = useRef<string>("");
  if (!sourceIdRef.current && typeof window !== "undefined") {
    sourceIdRef.current = getSourceId();
  }

  const channelRef = useRef<RealtimeChannel | null>(null);
  const modeRef = useRef<RideMode>("waiting");

  // Carga inicial + suscripción realtime + presencia.
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    const client = supabase;
    let active = true;

    (async () => {
      const [{ data: pos }, { data: occ }] = await Promise.all([
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

      setState((prev) => ({
        ...prev,
        position: pos?.[0] ?? null,
        positionAt: pos?.[0] ? toTime(pos[0].created_at) : null,
        occupancy: occ?.[0] ?? null,
        occupancyAt: occ?.[0] ? toTime(occ[0].created_at) : null,
      }));
    })();

    const channel = client.channel(`route:${routeId}`, {
      config: { presence: { key: sourceIdRef.current } },
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
            position: row,
            positionAt: toTime(row.created_at),
            isOwnSource: row.source_id === sourceIdRef.current,
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
            occupancy: row,
            occupancyAt: toTime(row.created_at),
          }));
        }
      )
      .on("presence", { event: "sync" }, () => {
        const presenceState = channel.presenceState<PresenceMeta>();
        let waiting = 0;
        let riding = 0;
        for (const entries of Object.values(presenceState)) {
          // Tomamos el modo del primer registro de cada persona.
          const meta = entries[0];
          if (meta?.mode === "riding") riding += 1;
          else waiting += 1;
        }
        setState((prev) => ({
          ...prev,
          presence: { waiting, riding, total: waiting + riding },
        }));
      })
      .subscribe(async (status) => {
        setState((prev) => ({
          ...prev,
          connected: status === "SUBSCRIBED",
        }));
        if (status === "SUBSCRIBED") {
          await channel.track({
            mode: modeRef.current,
            source: sourceIdRef.current,
          } satisfies PresenceMeta);
        }
      });

    return () => {
      active = false;
      channelRef.current = null;
      client.removeChannel(channel);
    };
  }, [routeId]);

  const publishPosition = useCallback(
    async (lat: number, lng: number) => {
      if (!isSupabaseConfigured || !supabase) return;
      const row: VehiclePosition = {
        route_id: routeId,
        lat,
        lng,
        source_id: sourceIdRef.current,
      };
      await supabase.from("vehicle_positions").insert(row);
    },
    [routeId]
  );

  const publishOccupancy = useCallback(
    async (level: OccupancyLevel) => {
      if (!isSupabaseConfigured || !supabase) return;
      const row: OccupancyReport = {
        route_id: routeId,
        level,
        source_id: sourceIdRef.current,
      };
      await supabase.from("occupancy_reports").insert(row);
    },
    [routeId]
  );

  const announce = useCallback((mode: RideMode) => {
    modeRef.current = mode;
    void channelRef.current?.track({
      mode,
      source: sourceIdRef.current,
    } satisfies PresenceMeta);
  }, []);

  return {
    ...state,
    configured: isSupabaseConfigured,
    publishPosition,
    publishOccupancy,
    announce,
  };
}
