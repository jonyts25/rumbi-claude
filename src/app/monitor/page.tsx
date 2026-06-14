"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { RouteMonitor } from "@/components/RouteMonitor";
import { DEMO_ROUTES } from "@/lib/routes";

export default function MonitorPage() {
  const [routeId, setRouteId] = useState(DEMO_ROUTES[0].id);
  const route = DEMO_ROUTES.find((r) => r.id === routeId) ?? DEMO_ROUTES[0];

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col px-4 sm:px-5">
      <header className="flex items-center justify-between py-5">
        <Logo />
        <Link
          href="/"
          className="text-sm text-gray-400 transition hover:text-white"
        >
          ← Inicio
        </Link>
      </header>

      <div className="pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Monitor de ruta
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Vigila en vivo qué datos llegan. Si algo falla, copia el diagnóstico y
          pégalo en Cursor para arreglarlo.
        </p>
      </div>

      {/* Selector de ruta */}
      <div className="mb-5 flex flex-wrap gap-2">
        {DEMO_ROUTES.map((r) => (
          <button
            key={r.id}
            onClick={() => setRouteId(r.id)}
            className="rounded-full border px-3 py-1.5 text-sm font-medium transition"
            style={{
              borderColor: r.id === routeId ? r.color : "#272e3a",
              backgroundColor: r.id === routeId ? `${r.color}1f` : "transparent",
              color: r.id === routeId ? r.color : "#c9d1d9",
            }}
          >
            {r.name.split(" · ")[0]}
          </button>
        ))}
      </div>

      <RouteMonitor key={route.id} route={route} />

      <footer className="mt-auto py-6 text-xs text-gray-600">
        <p>
          Este monitor solo observa: no aparece como persona esperando ni
          comparte ubicación.
        </p>
      </footer>
    </main>
  );
}
