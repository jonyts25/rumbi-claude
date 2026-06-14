import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ConnectCard } from "@/components/ConnectCard";
import { ShareButton } from "@/components/ShareButton";

export default function HomePage() {
  return (
    <main className="relative mx-auto flex min-h-dvh max-w-5xl flex-col px-5">
      {/* glow de fondo */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-brand/20 blur-[120px]"
      />

      <header className="flex items-center justify-between gap-3 py-6">
        <Logo />
        <div className="flex items-center gap-2">
          <ShareButton />
          <Link
            href="/rutas"
            className="rounded-full border border-ink-line px-4 py-1.5 text-sm text-gray-300 transition hover:border-brand/60 hover:text-white"
          >
            Ver rutas
          </Link>
        </div>
      </header>

      <section className="flex flex-1 flex-col justify-center py-12">
        <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-ink-line bg-ink-soft px-3 py-1 text-xs font-medium text-brand animate-fadeUp">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
          Aquí el camión no avisa · nos avisamos entre nosotros
        </span>

        <h1 className="max-w-3xl text-balance text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl animate-fadeUp">
          Tu camión no trae GPS.{" "}
          <span className="text-brand">Te tiene a ti.</span>
        </h1>

        <p className="mt-6 max-w-xl text-pretty text-lg text-gray-300 animate-fadeUp">
          En Japón hay horarios al minuto. Aquí no. Rumbi convierte a la gente
          que ya va arriba del camión en la información que nunca tuvimos:{" "}
          <strong className="text-white">dónde viene</strong> y{" "}
          <strong className="text-white">qué tan lleno va</strong>, en vivo.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-3 animate-fadeUp">
          <Link
            href="/rutas"
            className="rounded-full bg-brand px-6 py-3 font-semibold text-ink shadow-[0_0_28px_rgba(0,216,160,0.35)] transition hover:bg-brand-glow"
          >
            Ver mi ruta
          </Link>
          <span className="text-sm text-gray-500">
            Sin cuenta, sin descargar nada, sin gastar datos de más.
          </span>
        </div>

        <div className="mt-12 rounded-2xl border border-brand/30 bg-brand/5 p-6 animate-fadeUp">
          <p className="text-pretty text-lg font-medium leading-relaxed text-white">
            &ldquo;No necesitamos esperar a que alguien instale paradas
            inteligentes. La comunidad{" "}
            <span className="text-brand">es</span> la infraestructura.&rdquo;
          </p>
          <p className="mt-2 text-sm text-gray-400">
            Cada persona que comparte su viaje le ahorra la incertidumbre a la
            siguiente.
          </p>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-3 animate-fadeUp">
          {[
            {
              icon: "👀",
              title: "¿Ya pasó o ya viene?",
              body: "Deja de preguntarle a desconocidos. Mira el punto del camión moverse en vivo.",
            },
            {
              icon: "🪑",
              title: "¿Vacío, medio o lleno?",
              body: "Para que no corras a la parada y lo veas pasar repleto sin parar.",
            },
            {
              icon: "🤝",
              title: "Entre todos",
              body: "Lo que tú avisas hoy, alguien te lo avisa mañana. Pura banda ayudándose.",
            },
          ].map((f) => (
            <li
              key={f.title}
              className="rounded-2xl border border-ink-line bg-ink-soft p-5"
            >
              <div className="mb-2 text-2xl">{f.icon}</div>
              <h3 className="font-semibold text-white">{f.title}</h3>
              <p className="mt-1 text-sm text-gray-400">{f.body}</p>
            </li>
          ))}
        </ul>

        <div className="mt-10 animate-fadeUp">
          <ConnectCard />
        </div>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-ink-line py-6 text-sm text-gray-500">
        <p className="max-w-lg">
          Hecho para quien depende del camión todos los días. Rumbi es una demo
          comunitaria: ningún dato es oficial, todo lo pone la gente.
        </p>
        <Link href="/monitor" className="shrink-0 text-gray-500 transition hover:text-brand">
          Monitor →
        </Link>
      </footer>
    </main>
  );
}
