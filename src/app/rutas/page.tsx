import Link from "next/link";
import { Logo } from "@/components/Logo";
import { RouteCard } from "@/components/RouteCard";
import { DEMO_ROUTES } from "@/lib/routes";

export default function RoutesPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col px-5">
      <header className="flex items-center justify-between py-6">
        <Logo />
        <Link
          href="/"
          className="text-sm text-gray-400 transition hover:text-white"
        >
          ← Inicio
        </Link>
      </header>

      <section className="py-6">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          ¿Cuál camión tomas?
        </h1>
        <p className="mt-2 max-w-xl text-gray-400">
          Entra a tu ruta para ver si el camión ya viene o ya pasó. Y si tú vas
          arriba, avísale a la banda que espera en la parada.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DEMO_ROUTES.map((route) => (
            <div key={route.id} className="animate-fadeUp">
              <RouteCard route={route} />
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-auto border-t border-ink-line py-6 text-sm text-gray-500">
        <p>
          ¿Vas arriba? Activa &ldquo;Voy en el camión&rdquo; dentro de la ruta:
          tu aviso vale más que cualquier horario que nunca llegó.
        </p>
      </footer>
    </main>
  );
}
