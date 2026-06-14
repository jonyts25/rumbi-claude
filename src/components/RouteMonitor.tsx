"use client";

import { useEffect, useState } from "react";
import { useRouteMonitor } from "@/hooks/useRouteMonitor";
import { describeFreshness } from "@/lib/freshness";
import type { DemoRoute } from "@/lib/routes";

function clock(at: number): string {
  return new Date(at).toLocaleTimeString("es-MX", { hour12: false });
}

function ageLabel(at: number | null, now: number): string {
  if (at == null) return "—";
  const s = Math.max(0, Math.round((now - at) / 1000));
  if (s < 60) return `hace ${s}s`;
  const m = Math.round(s / 60);
  return `hace ${m}m`;
}

export function RouteMonitor({ route }: { route: DemoRoute }) {
  const m = useRouteMonitor(route.id);
  const [now, setNow] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const fresh = describeFreshness(m.lastPositionAt, now);

  const health = !m.configured
    ? { dot: "bg-danger", text: "Supabase sin configurar" }
    : !m.connected
      ? { dot: "bg-warn animate-pulse", text: `Conectando… (${m.status})` }
      : fresh.level === "fresh"
        ? { dot: "bg-brand animate-pulse", text: "Recibiendo datos en vivo" }
        : m.lastPositionAt == null
          ? { dot: "bg-gray-500", text: "Conectado · nadie comparte aún" }
          : { dot: "bg-warn", text: "Conectado · señal antigua" };

  const copyDiagnostics = async () => {
    const lines = [
      "=== Rumbi · diagnóstico ===",
      `Fecha: ${new Date(now).toISOString()}`,
      `Ruta: ${route.name} (${route.id})`,
      `Supabase configurado: ${m.configured}`,
      `Canal: ${m.status} · conectado: ${m.connected}`,
      `Presencia: total ${m.presence.total} (a bordo ${m.presence.riding}, esperando ${m.presence.waiting})`,
      `Eventos recibidos (sesión): ${m.received}`,
      `Última posición: ${
        m.lastPosition
          ? `(${m.lastPosition.lat.toFixed(5)}, ${m.lastPosition.lng.toFixed(5)}) ${ageLabel(m.lastPositionAt, now)} · src ${m.lastPosition.source_id}`
          : "ninguna"
      }`,
      `Última ocupación: ${
        m.lastOccupancy
          ? `${m.lastOccupancy.level} ${ageLabel(m.lastOccupancyAt, now)} · src ${m.lastOccupancy.source_id}`
          : "ninguna"
      }`,
      "--- últimos eventos ---",
      ...m.events
        .slice(0, 20)
        .map((e) => `${clock(e.at)}  ${e.text}`),
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* sin clipboard */
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Salud */}
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-ink-line bg-ink-soft p-4">
        <div className="flex items-center gap-3">
          <span className={`h-3 w-3 rounded-full ${health.dot}`} />
          <div>
            <p className="font-semibold text-white">{health.text}</p>
            <p className="text-sm text-gray-400">{route.name}</p>
          </div>
        </div>
        <span className="rounded-full border border-ink-line px-3 py-1 text-xs text-gray-400">
          {m.received} eventos
        </span>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 gap-3">
        <Metric label="Personas en la ruta" value={`${m.presence.total}`} sub={`${m.presence.riding} a bordo · ${m.presence.waiting} esperando`} />
        <Metric
          label="Última posición"
          value={ageLabel(m.lastPositionAt, now)}
          sub={
            m.lastPosition
              ? `${m.lastPosition.lat.toFixed(4)}, ${m.lastPosition.lng.toFixed(4)}`
              : "sin datos"
          }
        />
        <Metric
          label="Última ocupación"
          value={m.lastOccupancy ? m.lastOccupancy.level : "—"}
          sub={ageLabel(m.lastOccupancyAt, now)}
        />
        <Metric label="Frescura" value={fresh.level} sub={fresh.label} />
      </div>

      <button
        onClick={copyDiagnostics}
        className="rounded-xl border border-brand/50 bg-brand/10 px-4 py-3 text-sm font-semibold text-brand transition hover:bg-brand/20"
      >
        {copied ? "✓ Diagnóstico copiado — pégalo en Cursor" : "📋 Copiar diagnóstico"}
      </button>

      {/* Registro en vivo */}
      <div className="rounded-2xl border border-ink-line bg-ink-soft p-4">
        <p className="mb-2 text-sm font-medium text-gray-300">Registro en vivo</p>
        <div className="max-h-[320px] overflow-y-auto rounded-lg bg-ink p-3 font-mono text-xs leading-relaxed">
          {m.events.length === 0 ? (
            <p className="text-gray-500">Esperando eventos…</p>
          ) : (
            m.events.map((e) => (
              <div
                key={e.id}
                className={
                  e.kind === "system"
                    ? "text-gray-500"
                    : e.kind === "occupancy"
                      ? "text-warn"
                      : "text-brand"
                }
              >
                <span className="text-gray-600">{clock(e.at)}</span> {e.text}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-ink-line bg-ink-soft p-4">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="mt-1 truncate text-lg font-semibold text-white">{value}</p>
      <p className="mt-0.5 truncate text-xs text-gray-500">{sub}</p>
    </div>
  );
}
