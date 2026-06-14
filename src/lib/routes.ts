import type { Route } from "./types";

/**
 * Rutas demo. Los `id` (UUID) coinciden con los del seed en supabase/schema.sql
 * para que el cliente y la base de datos hablen el mismo idioma sin necesidad
 * de un panel de administración.
 */
export interface DemoRoute extends Route {
  tagline: string;
  /** Recorrido aproximado para el botón "avanzar ruta". */
  path: [number, number][];
}

export const DEMO_ROUTES: DemoRoute[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Ruta 1 · Centro – Minerva",
    color: "#00d8a0",
    is_active: true,
    tagline: "La columna vertebral de la ciudad.",
    path: [
      [20.6767, -103.3475],
      [20.6745, -103.3585],
      [20.6739, -103.3702],
      [20.6748, -103.3812],
      [20.6757, -103.3919],
      [20.6741, -103.4006],
    ],
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Ruta 2 · Periférico Norte",
    color: "#ffb020",
    is_active: true,
    tagline: "Conecta las orillas en un solo viaje.",
    path: [
      [20.7205, -103.3812],
      [20.7148, -103.3675],
      [20.7089, -103.3548],
      [20.7012, -103.3421],
      [20.6948, -103.3302],
      [20.6885, -103.3185],
    ],
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    name: "Ruta 3 · Tlaquepaque – Universidad",
    color: "#8b7bff",
    is_active: true,
    tagline: "Del centro histórico al campus.",
    path: [
      [20.6412, -103.3128],
      [20.6498, -103.3201],
      [20.6585, -103.3289],
      [20.6671, -103.3372],
      [20.6748, -103.3461],
      [20.6821, -103.3548],
    ],
  },
];

export function getRoute(id: string): DemoRoute | undefined {
  return DEMO_ROUTES.find((r) => r.id === id);
}
