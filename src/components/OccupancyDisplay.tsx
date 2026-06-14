import { OCCUPANCY } from "@/lib/occupancy";
import type { OccupancyLevel } from "@/lib/types";

export function OccupancyDisplay({ level }: { level: OccupancyLevel | null }) {
  if (!level) {
    return (
      <div className="rounded-2xl border border-ink-line bg-ink-soft p-5">
        <p className="text-sm text-gray-400">Ocupación</p>
        <p className="mt-1 text-lg font-medium text-gray-300">
          Sin reportes todavía
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Aún nadie dice si viene vacío, medio o lleno.
        </p>
      </div>
    );
  }

  const meta = OCCUPANCY[level];

  return (
    <div
      className="rounded-2xl border bg-ink-soft p-5"
      style={{ borderColor: `${meta.color}55` }}
    >
      <p className="text-sm text-gray-400">¿Viene vacío, medio o lleno?</p>
      <p className="mt-1 flex items-center gap-2 text-2xl font-bold text-white">
        <span>{meta.emoji}</span>
        <span style={{ color: meta.color }}>{meta.label}</span>
      </p>
      <p className="mt-1 text-sm text-gray-400">{meta.hint}</p>
    </div>
  );
}
