import Link from "next/link";
import { Logo } from "@/components/Logo";
import { RouteClient } from "@/components/RouteClient";
import { DEMO_ROUTES, getRoute } from "@/lib/routes";

export function generateStaticParams() {
  return DEMO_ROUTES.map((r) => ({ id: r.id }));
}

export default async function RoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const route = getRoute(id);

  if (!route) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-2xl flex-col px-5">
        <header className="py-6">
          <Logo />
        </header>
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <h1 className="text-2xl font-bold text-white">Ruta no encontrada</h1>
          <p className="mt-2 text-gray-400">
            Esa ruta no existe en la demo.
          </p>
          <Link
            href="/rutas"
            className="mt-6 rounded-full bg-brand px-5 py-2.5 font-semibold text-ink"
          >
            Ver rutas disponibles
          </Link>
        </div>
      </main>
    );
  }

  return <RouteClient route={route} />;
}
