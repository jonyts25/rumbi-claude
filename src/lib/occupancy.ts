import type { OccupancyLevel } from "./types";

export interface OccupancyMeta {
  level: OccupancyLevel;
  label: string;
  emoji: string;
  /** Color para badges y acentos. */
  color: string;
  /** Sugerencia humana de qué hacer. */
  hint: string;
}

export const OCCUPANCY: Record<OccupancyLevel, OccupancyMeta> = {
  empty: {
    level: "empty",
    label: "Vacío",
    emoji: "🟢",
    color: "#00d8a0",
    hint: "Te vas sentado. Súbete tranquilo.",
  },
  medium: {
    level: "medium",
    label: "Medio",
    emoji: "🟡",
    color: "#ffb020",
    hint: "Hay campo, pero seguro de pie.",
  },
  full: {
    level: "full",
    label: "Lleno",
    emoji: "🔴",
    color: "#ff5470",
    hint: "Va a reventar. Capaz ni se para. Piensa en el siguiente.",
  },
};

export const OCCUPANCY_ORDER: OccupancyLevel[] = ["empty", "medium", "full"];
