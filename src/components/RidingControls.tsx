"use client";

import { useState } from "react";
import { OCCUPANCY, OCCUPANCY_ORDER } from "@/lib/occupancy";
import type { OccupancyLevel } from "@/lib/types";
import type { useRouteChannel } from "@/hooks/useRouteChannel";
import type { GeoState } from "@/hooks/useGeoShare";

interface Props {
  channel: ReturnType<typeof useRouteChannel>;
  onMove: (dir: "north" | "south" | "east" | "west") => void;
  onAdvance: () => void;
  started: boolean;
  useRealGps: boolean;
  onToggleGps: (value: boolean) => void;
  geo: GeoState;
}

export function RidingControls({
  channel,
  onMove,
  onAdvance,
  started,
  useRealGps,
  onToggleGps,
  geo,
}: Props) {
  const [selected, setSelected] = useState<OccupancyLevel | null>(
    channel.occupancy?.level ?? null
  );

  const report = (level: OccupancyLevel) => {
    setSelected(level);
    void channel.publishOccupancy(level);
  };

  return (
    <>
      <div className="rounded-2xl border border-brand/40 bg-brand/5 p-5">
        <h2 className="font-semibold text-white">Eres los ojos de la ruta 🙌</h2>
        <p className="mt-1 text-sm text-gray-300">
          No hay GPS oficial: tu aviso es lo que le ahorra a alguien esperar a
          ciegas en la parada.
        </p>
      </div>

      {/* Selector de fuente de ubicación */}
      <div className="rounded-2xl border border-ink-line bg-ink-soft p-5">
        <div className="mb-3 grid grid-cols-2 gap-2 rounded-xl border border-ink-line bg-ink p-1.5">
          <button
            onClick={() => onToggleGps(true)}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              useRealGps ? "bg-brand text-ink" : "text-gray-300 hover:text-white"
            }`}
          >
            📍 Mi GPS real
          </button>
          <button
            onClick={() => onToggleGps(false)}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              !useRealGps ? "bg-brand text-ink" : "text-gray-300 hover:text-white"
            }`}
          >
            🎮 Simular
          </button>
        </div>

        {useRealGps ? (
          <GpsStatus geo={geo} />
        ) : (
          <ManualControls
            onMove={onMove}
            onAdvance={onAdvance}
            started={started}
          />
        )}
      </div>

      {/* Reporte de ocupación */}
      <div className="rounded-2xl border border-ink-line bg-ink-soft p-5">
        <p className="mb-3 text-sm font-medium text-gray-300">
          ¿Qué tan lleno va?
        </p>
        <div className="grid grid-cols-3 gap-2">
          {OCCUPANCY_ORDER.map((level) => {
            const meta = OCCUPANCY[level];
            const active = selected === level;
            return (
              <button
                key={level}
                onClick={() => report(level)}
                className="flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-sm font-semibold transition"
                style={{
                  borderColor: active ? meta.color : "#272e3a",
                  backgroundColor: active ? `${meta.color}1f` : "transparent",
                  color: active ? meta.color : "#c9d1d9",
                }}
              >
                <span className="text-lg">{meta.emoji}</span>
                {meta.label}
              </button>
            );
          })}
        </div>
        {selected && (
          <p className="mt-3 text-sm text-gray-400">
            Avisaste{" "}
            <strong style={{ color: OCCUPANCY[selected].color }}>
              {OCCUPANCY[selected].label}
            </strong>
            . Gracias: alguien en la parada acaba de decidir mejor por ti.
          </p>
        )}
      </div>
    </>
  );
}

function GpsStatus({ geo }: { geo: GeoState }) {
  const map: Record<
    GeoState["status"],
    { dot: string; title: string; detail: string }
  > = {
    idle: {
      dot: "bg-gray-500",
      title: "GPS en pausa",
      detail: "Se activará en cuanto entres a este modo.",
    },
    prompting: {
      dot: "bg-warn animate-pulse",
      title: "Pidiendo permiso de ubicación…",
      detail: "Acepta el permiso para empezar a compartir tu posición.",
    },
    active: {
      dot: "bg-brand animate-pulse",
      title: "Compartiendo tu ubicación real",
      detail:
        geo.accuracy != null
          ? `Precisión ±${Math.round(geo.accuracy)} m. Deja Rumbi abierto durante el viaje.`
          : "Tu posición se actualiza sola conforme avanzas.",
    },
    denied: {
      dot: "bg-danger",
      title: "Permiso de ubicación denegado",
      detail:
        "Actívalo en los ajustes del navegador, o usa el modo Simular por ahora.",
    },
    insecure: {
      dot: "bg-danger",
      title: "El GPS necesita HTTPS",
      detail:
        "Abre Rumbi desde la liga pública (Vercel) o localhost. Por IP local el navegador bloquea el GPS.",
    },
    unsupported: {
      dot: "bg-danger",
      title: "Este dispositivo no expone GPS al navegador",
      detail: "Usa el modo Simular para probar.",
    },
    error: {
      dot: "bg-danger",
      title: "No pudimos leer tu ubicación",
      detail: geo.error ?? "Intenta de nuevo o usa el modo Simular.",
    },
  };

  const s = map[geo.status];

  return (
    <div className="flex items-start gap-3">
      <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${s.dot}`} />
      <div>
        <p className="text-sm font-medium text-white">{s.title}</p>
        <p className="mt-0.5 text-sm text-gray-400">{s.detail}</p>
      </div>
    </div>
  );
}

function ManualControls({
  onMove,
  onAdvance,
  started,
}: {
  onMove: (dir: "north" | "south" | "east" | "west") => void;
  onAdvance: () => void;
  started: boolean;
}) {
  return (
    <div>
      <p className="mb-3 text-sm text-gray-400">
        Modo prueba (sin GPS).{" "}
        {started ? "Mueve el punto como quieras." : "Mueve el punto para empezar a avisar."}
      </p>
      <div className="mx-auto grid w-[180px] grid-cols-3 grid-rows-3 gap-2">
        <span />
        <ArrowButton label="Norte" onClick={() => onMove("north")}>
          ↑
        </ArrowButton>
        <span />
        <ArrowButton label="Oeste" onClick={() => onMove("west")}>
          ←
        </ArrowButton>
        <div className="grid place-items-center text-xl">🚌</div>
        <ArrowButton label="Este" onClick={() => onMove("east")}>
          →
        </ArrowButton>
        <span />
        <ArrowButton label="Sur" onClick={() => onMove("south")}>
          ↓
        </ArrowButton>
        <span />
      </div>
      <button
        onClick={onAdvance}
        className="mt-4 w-full rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-ink transition hover:bg-brand-glow"
      >
        Avanzar ruta →
      </button>
    </div>
  );
}

function ArrowButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={`Mover al ${label.toLowerCase()}`}
      className="grid h-[52px] place-items-center rounded-xl border border-ink-line bg-ink text-xl text-gray-200 transition hover:border-brand/60 hover:text-brand active:scale-95"
    >
      {children}
    </button>
  );
}
