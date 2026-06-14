import Link from "next/link";
import type { DemoRoute } from "@/lib/routes";

export function RouteCard({ route }: { route: DemoRoute }) {
  return (
    <Link
      href={`/ruta/${route.id}`}
      className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-ink-line bg-ink-soft p-5 transition hover:border-brand/60 hover:bg-ink-soft/80"
    >
      <span
        className="absolute inset-x-0 top-0 h-1"
        style={{ backgroundColor: route.color }}
      />
      <div className="flex items-center gap-3">
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg"
          style={{
            backgroundColor: `${route.color}1f`,
            color: route.color,
          }}
        >
          🚌
        </span>
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-white">{route.name}</h3>
          <p className="truncate text-sm text-gray-400">{route.tagline}</p>
        </div>
      </div>
      <div className="mt-1 flex items-center justify-between text-sm">
        <span className="inline-flex items-center gap-1.5 text-gray-400">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          Ruta activa
        </span>
        <span className="font-medium text-brand transition group-hover:translate-x-0.5">
          Entrar →
        </span>
      </div>
    </Link>
  );
}
