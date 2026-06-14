"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { FreshnessPill } from "@/components/FreshnessPill";
import { OccupancyDisplay } from "@/components/OccupancyDisplay";
import { RidingControls } from "@/components/RidingControls";
import { CommunityPulse } from "@/components/CommunityPulse";
import { ShareButton } from "@/components/ShareButton";
import { useRouteChannel } from "@/hooks/useRouteChannel";
import { useGeoShare } from "@/hooks/useGeoShare";
import type { DemoRoute } from "@/lib/routes";
import type { RideMode } from "@/lib/types";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-ink text-sm text-gray-500">
      Cargando mapa…
    </div>
  ),
});

const STEP = 0.0009; // ~100 m por toque

export function RouteClient({ route }: { route: DemoRoute }) {
  const channel = useRouteChannel(route.id);
  const [mode, setMode] = useState<RideMode>("waiting");

  const [sim, setSim] = useState<[number, number]>(route.path[0]);
  const [pathIndex, setPathIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [useRealGps, setUseRealGps] = useState(true);

  // Avisa a la comunidad en qué modo estoy (alimenta el contador en vivo).
  const { announce } = channel;
  useEffect(() => {
    announce(mode);
  }, [mode, announce]);

  // Posición que se dibuja en el mapa según el modo.
  const busPosition: [number, number] | null = useMemo(() => {
    if (mode === "riding") return started ? sim : null;
    return channel.position
      ? [channel.position.lat, channel.position.lng]
      : null;
  }, [mode, started, sim, channel.position]);

  const pushPosition = useCallback(
    (pos: [number, number]) => {
      setSim(pos);
      setStarted(true);
      void channel.publishPosition(pos[0], pos[1]);
    },
    [channel]
  );

  // GPS real pasivo: solo cuando voy a bordo y tengo el GPS activado.
  const gpsActive = mode === "riding" && useRealGps;
  const geo = useGeoShare(gpsActive, (lat, lng) => pushPosition([lat, lng]));

  const move = useCallback(
    (dir: "north" | "south" | "east" | "west") => {
      setSim((prev) => {
        const [lat, lng] = prev;
        const next: [number, number] =
          dir === "north"
            ? [lat + STEP, lng]
            : dir === "south"
              ? [lat - STEP, lng]
              : dir === "east"
                ? [lat, lng + STEP]
                : [lat, lng - STEP];
        setStarted(true);
        void channel.publishPosition(next[0], next[1]);
        return next;
      });
    },
    [channel]
  );

  const advance = useCallback(() => {
    const nextIndex = (pathIndex + 1) % route.path.length;
    setPathIndex(nextIndex);
    pushPosition(route.path[nextIndex]);
  }, [pathIndex, route.path, pushPosition]);

  const fresh = mode === "riding";

  return (
    <main className="mx-auto flex min-h-dvh max-w-6xl flex-col px-4 sm:px-5">
      <header className="flex items-center justify-between gap-3 py-5">
        <Logo />
        <div className="flex items-center gap-2">
          <ShareButton
            message={`Mira el camión de "${route.name}" en vivo con Rumbi 🚌 La comunidad te avisa dónde viene y qué tan lleno va:`}
          />
          <Link
            href="/rutas"
            className="text-sm text-gray-400 transition hover:text-white"
          >
            ← Cambiar ruta
          </Link>
        </div>
      </header>

      <div className="flex items-center gap-3 pb-4">
        <span
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: route.color }}
        />
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-white">{route.name}</h1>
          <p className="truncate text-sm text-gray-400">{route.tagline}</p>
        </div>
      </div>

      <CommunityPulse presence={channel.presence} configured={channel.configured} />

      {!channel.configured && (
        <div className="mb-4 rounded-xl border border-warn/40 bg-warn/10 p-4 text-sm text-warn">
          Supabase no está configurado. Copia <code>.env.example</code> a{" "}
          <code>.env.local</code>, agrega tus llaves y reinicia el servidor para
          activar el tiempo real.
        </div>
      )}

      {/* Toggle de modo */}
      <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl border border-ink-line bg-ink-soft p-1.5">
        <button
          onClick={() => setMode("waiting")}
          className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
            mode === "waiting"
              ? "bg-brand text-ink"
              : "text-gray-300 hover:text-white"
          }`}
        >
          🕒 Estoy esperando
        </button>
        <button
          onClick={() => setMode("riding")}
          className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
            mode === "riding"
              ? "bg-brand text-ink"
              : "text-gray-300 hover:text-white"
          }`}
        >
          🚌 Voy en el camión
        </button>
      </div>

      <div className="grid flex-1 gap-5 pb-8 lg:grid-cols-[1.5fr_1fr]">
        {/* Mapa */}
        <div className="relative h-[340px] overflow-hidden rounded-2xl border border-ink-line sm:h-[460px] lg:h-auto lg:min-h-[460px]">
          <MapView
            center={route.path[0]}
            color={route.color}
            path={route.path}
            bus={busPosition}
            fresh={fresh}
          />
          {mode === "waiting" && (
            <div className="pointer-events-none absolute left-3 top-3 z-[1000]">
              <FreshnessPill lastUpdate={channel.positionAt} />
            </div>
          )}
        </div>

        {/* Panel lateral */}
        <div className="flex flex-col gap-4">
          {mode === "waiting" ? (
            <WaitingPanel channel={channel} />
          ) : (
            <RidingControls
              channel={channel}
              onMove={move}
              onAdvance={advance}
              started={started}
              useRealGps={useRealGps}
              onToggleGps={setUseRealGps}
              geo={geo}
            />
          )}
        </div>
      </div>
    </main>
  );
}

function WaitingPanel({
  channel,
}: {
  channel: ReturnType<typeof useRouteChannel>;
}) {
  const hasBus = Boolean(channel.position);

  return (
    <>
      <div className="rounded-2xl border border-ink-line bg-ink-soft p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-semibold text-white">¿Ya viene o ya pasó?</h2>
          <FreshnessPill lastUpdate={channel.positionAt} />
        </div>
        <p className="mt-2 text-sm text-gray-400">
          {hasBus
            ? "Alguien va arriba ahora mismo y nos está avisando dónde viene. Síguelo en el mapa y deja de adivinar."
            : "Nadie está avisando en esta ruta ahora. Aquí los camiones no traen GPS: dependemos de que alguien suba y comparta. En cuanto pase, lo verás aquí."}
        </p>
      </div>

      <OccupancyDisplay level={channel.occupancy?.level ?? null} />

      <div className="rounded-2xl border border-ink-line bg-ink-soft p-5 text-sm text-gray-400">
        <p className="font-medium text-gray-300">Tú decides, no la suerte</p>
        <p className="mt-1">
          Con esto sabes si corres a la parada, te esperas tranquilo o mejor
          buscas otra forma de llegar. Ya no esperas a ciegas.
        </p>
      </div>
    </>
  );
}
