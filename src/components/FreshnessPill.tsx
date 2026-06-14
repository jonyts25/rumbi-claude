"use client";

import { useEffect, useState } from "react";
import { describeFreshness } from "@/lib/freshness";

const COLORS = {
  fresh: { dot: "bg-brand", text: "text-brand", ring: "border-brand/40" },
  stale: { dot: "bg-warn", text: "text-warn", ring: "border-warn/40" },
  none: { dot: "bg-gray-500", text: "text-gray-400", ring: "border-ink-line" },
} as const;

export function FreshnessPill({ lastUpdate }: { lastUpdate: number | null }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const fresh = describeFreshness(lastUpdate, now);
  const c = COLORS[fresh.level];

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border ${c.ring} bg-ink-soft px-3 py-1.5 text-sm ${c.text}`}
    >
      <span className={`h-2 w-2 rounded-full ${c.dot} ${fresh.level === "fresh" ? "animate-pulse" : ""}`} />
      {fresh.label}
    </span>
  );
}
