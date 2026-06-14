export type FreshnessLevel = "fresh" | "stale" | "none";

export interface FreshnessState {
  level: FreshnessLevel;
  /** Texto humano listo para mostrar. */
  label: string;
  /** Segundos desde el último dato, o null si no hay datos. */
  secondsAgo: number | null;
}

const FRESH_THRESHOLD = 15; // segundos: se considera "en vivo"
const STALE_THRESHOLD = 60; // segundos: más allá de esto, "señal antigua"

export function describeFreshness(
  lastUpdate: number | null,
  now: number = Date.now()
): FreshnessState {
  if (lastUpdate == null) {
    return {
      level: "none",
      label: "Nadie está compartiendo esta ruta ahora",
      secondsAgo: null,
    };
  }

  const secondsAgo = Math.max(0, Math.round((now - lastUpdate) / 1000));

  if (secondsAgo <= FRESH_THRESHOLD) {
    return {
      level: "fresh",
      label: `Actualizado hace ${secondsAgo} ${secondsAgo === 1 ? "segundo" : "segundos"}`,
      secondsAgo,
    };
  }

  if (secondsAgo <= STALE_THRESHOLD) {
    return {
      level: "stale",
      label: `Actualizado hace ${secondsAgo} segundos`,
      secondsAgo,
    };
  }

  return {
    level: "stale",
    label: formatOldSignal(secondsAgo),
    secondsAgo,
  };
}

function formatOldSignal(secondsAgo: number): string {
  if (secondsAgo < 3600) {
    const minutes = Math.round(secondsAgo / 60);
    return `Señal antigua · hace ${minutes} ${minutes === 1 ? "minuto" : "minutos"}`;
  }
  return "Señal antigua";
}
