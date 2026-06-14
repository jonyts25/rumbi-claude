"use client";

import { useEffect, useRef, useState } from "react";

export type GeoStatus =
  | "idle"
  | "unsupported"
  | "insecure"
  | "prompting"
  | "active"
  | "denied"
  | "error";

export interface GeoState {
  status: GeoStatus;
  /** Precisión en metros del último fix. */
  accuracy: number | null;
  lastFixAt: number | null;
  error: string | null;
}

const MIN_INTERVAL_MS = 4000; // máximo 1 envío cada 4s al moverse
const MIN_DISTANCE_M = 15; // movimiento mínimo para considerar que avanzó
const HEARTBEAT_MS = 15000; // aunque esté parado, late cada 15s para no "envejecer"

function distanceM(a: [number, number], b: [number, number]): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Comparte la ubicación real del dispositivo mientras `active` sea true.
 * Llama a `onPosition` con un throttle suave para no saturar Supabase.
 */
export function useGeoShare(
  active: boolean,
  onPosition: (lat: number, lng: number) => void
): GeoState {
  const [state, setState] = useState<GeoState>({
    status: "idle",
    accuracy: null,
    lastFixAt: null,
    error: null,
  });

  const lastSentRef = useRef<{ at: number; pos: [number, number] } | null>(null);
  const onPosRef = useRef(onPosition);
  onPosRef.current = onPosition;

  useEffect(() => {
    if (!active) {
      setState((s) => ({ ...s, status: "idle" }));
      return;
    }

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState((s) => ({ ...s, status: "unsupported" }));
      return;
    }

    // Geolocation requiere contexto seguro (HTTPS o localhost).
    if (typeof window !== "undefined" && !window.isSecureContext) {
      setState((s) => ({ ...s, status: "insecure" }));
      return;
    }

    setState((s) => ({ ...s, status: "prompting", error: null }));
    lastSentRef.current = null;

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = pos.coords.accuracy;
        const now = Date.now();
        const last = lastSentRef.current;

        const moved = !last || distanceM(last.pos, [lat, lng]) >= MIN_DISTANCE_M;
        const dt = last ? now - last.at : Infinity;
        const shouldSend =
          !last || (dt >= MIN_INTERVAL_MS && moved) || dt >= HEARTBEAT_MS;

        setState({
          status: "active",
          accuracy: acc,
          lastFixAt: now,
          error: null,
        });

        if (shouldSend) {
          lastSentRef.current = { at: now, pos: [lat, lng] };
          onPosRef.current(lat, lng);
        }
      },
      (err) => {
        setState((s) => ({
          ...s,
          status: err.code === err.PERMISSION_DENIED ? "denied" : "error",
          error: err.message,
        }));
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 }
    );

    return () => navigator.geolocation.clearWatch(id);
  }, [active]);

  return state;
}
