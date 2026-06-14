"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ShareButton } from "@/components/ShareButton";
import { RouteClient } from "@/components/RouteClient";
import { DEMO_ROUTES } from "@/lib/routes";

export default function HomePage() {
  const [routeId, setRouteId] = useState(DEMO_ROUTES[0].id);
  const route = DEMO_ROUTES.find((r) => r.id === routeId) ?? DEMO_ROUTES[0];

  return (
    <main className="mx-auto flex min-h-dvh max-w-6xl flex-col px-4 sm:px-5">
      <header className="flex items-center justify-between gap-3 py-4">
        <Logo />
        <ShareButton />
      </header>

      <p className="pb-3 text-sm text-gray-400">
        Mira <span className="text-white">dónde viene</span> tu camión y{" "}
        <span className="text-white">qué tan lleno va</span>, en vivo. Elige tu
        ruta:
      </p>

      {/* Selector de rutas */}
      <div className="mb-4 flex flex-wrap gap-2">
        {DEMO_ROUTES.map((r) => {
          const active = r.id === routeId;
          return (
            <button
              key={r.id}
              onClick={() => setRouteId(r.id)}
              className="rounded-full border px-3.5 py-1.5 text-sm font-medium transition"
              style={{
                borderColor: active ? r.color : "#272e3a",
                backgroundColor: active ? `${r.color}1f` : "transparent",
                color: active ? r.color : "#c9d1d9",
              }}
            >
              {r.name}
            </button>
          );
        })}
      </div>

      {/* Experiencia de la ruta seleccionada (mapa + modos) */}
      <RouteClient key={route.id} route={route} embedded />

      <footer className="flex items-center justify-between gap-2 border-t border-ink-line py-4 text-xs text-gray-600">
        <span>Datos compartidos por la comunidad · demo, nada oficial.</span>
        <Link href="/monitor" className="shrink-0 transition hover:text-brand">
          Monitor →
        </Link>
      </footer>
    </main>
  );
}
