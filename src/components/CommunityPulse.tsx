"use client";

import type { PresenceCounts } from "@/hooks/useRouteChannel";

interface Props {
  presence: PresenceCounts;
  configured: boolean;
}

export function CommunityPulse({ presence, configured }: Props) {
  if (!configured) return null;

  const { total, riding, waiting } = presence;

  const headline =
    total <= 1
      ? "Eres la única persona en esta ruta ahora"
      : `${total} personas están en esta ruta ahora mismo`;

  const detail =
    riding > 0
      ? `${riding} a bordo avisando · ${waiting} esperando`
      : total <= 1
        ? "Sé quien avise: alguien más lo está necesitando."
        : `${waiting} esperando · nadie a bordo todavía`;

  return (
    <div className="mb-4 flex items-center gap-3 rounded-xl border border-ink-line bg-ink-soft px-4 py-3">
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand" />
      </span>
      <div className="min-w-0 text-sm">
        <p className="font-medium text-white">{headline}</p>
        <p className="text-gray-400">{detail}</p>
      </div>
    </div>
  );
}
