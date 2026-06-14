# Rumbi 2.0 — Claude Version

> Tu camión no trae GPS. Te tiene a ti.

**Rumbi es el "Waze de los camiones" para quien depende del transporte público en lugares donde no hay horarios al minuto ni paradas inteligentes.** No intenta ser Google Maps ni Moovit. Su apuesta es simple y radical: **donde no hay infraestructura oficial, la comunidad ES la infraestructura.**

En vez de esperar a ciegas sin saber si el camión ya pasó, viene lleno o conviene buscar otra opción, la gente que ya va arriba comparte —en vivo— dónde viene y qué tan lleno va. Lo que tú avisas hoy, alguien te lo avisa mañana.

Esta es una **demo web funcional** (no app nativa todavía; pensada para vivirse en el teléfono) construida para probar una sola idea: que **dos personas abran la misma ruta y vean la misma información en tiempo real**.

- Quien va **arriba del camión** comparte su posición (simulada) y reporta si va vacío, medio o lleno.
- Quien **está esperando** ve el punto del camión moverse en vivo, la ocupación y qué tan fresca es la información.

---

## ✨ Qué incluye la demo

- **Pantalla inicial** que explica Rumbi en una frase.
- **3 rutas demo** para elegir.
- **Dos modos por ruta:**
  - 🕒 **Estoy esperando** — solo escucha; ve el camión, la ocupación y la frescura ("hace 5 segundos", "señal antigua", "nadie comparte ahora").
  - 🚌 **Voy en el camión** — simula ubicación (Norte/Sur/Este/Oeste + "avanzar ruta") y reporta ocupación.
- **Mapa real** con Leaflet + OpenStreetMap/CARTO (sin API keys).
- **Tiempo real** con Supabase Realtime.

---

## 🧱 Stack

| Pieza        | Tecnología                          |
| ------------ | ----------------------------------- |
| Framework    | Next.js (App Router) + TypeScript   |
| Estilos      | Tailwind CSS                        |
| Datos + RT   | Supabase (Postgres + Realtime)      |
| Mapa         | Leaflet (tiles CARTO/OSM, sin keys) |
| Deploy       | Vercel                              |

### Arquitectura en una línea

El navegador habla **directo** con Supabase usando la `anon key` (no hay backend propio). Cada movimiento o reporte hace un `INSERT`; los demás clientes están **suscritos a `postgres_changes`** filtrando por `route_id`. Sin login: cada navegador usa un `source_id` anónimo guardado en `localStorage`.

```
Navegador A (Voy en el camión) ──INSERT──┐
                                         ▼
                                 Supabase Postgres
                       (routes · vehicle_positions · occupancy_reports)
                                         │ Realtime
                                         ▼
Navegador B (Estoy esperando) ◀──evento INSERT (route_id)── escucha en vivo
```

---

## 🚀 Cómo correr en local

### 1. Requisitos

- Node.js 18+ (probado con Node 24)
- Una cuenta gratuita en [supabase.com](https://supabase.com)

### 2. Instalar dependencias

```bash
npm install
```

### 3. Crear el proyecto en Supabase

1. Entra a [supabase.com](https://supabase.com) → **New project**.
2. Elige nombre, contraseña y región. Espera a que termine de aprovisionar.

### 4. Correr el esquema

1. En el dashboard de Supabase, abre **SQL Editor**.
2. Crea una nueva query, pega **todo** el contenido de [`supabase/schema.sql`](./supabase/schema.sql) y dale **Run**.
3. Esto crea las tablas, los índices, las políticas RLS (select/insert público), activa Realtime y siembra las 3 rutas demo.

### 5. Configurar variables de entorno

1. En Supabase ve a **Project Settings → API**.
2. Copia el **Project URL** y la **anon public key**.
3. En la raíz del proyecto, crea `.env.local` (puedes copiar `.env.example`):

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

> Si abres la app sin estas variables, funciona pero muestra un aviso y no hay tiempo real.

### 6. Levantar el servidor

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

---

## 🧪 Cómo probarlo con dos navegadores

1. Abre la app en **dos ventanas**: una normal y una en **incógnito** (o dos navegadores distintos). Así cada una tiene su propio `source_id`.
2. **Ventana A:** entra a **Ruta 1**, elige **🚌 Voy en el camión**.
   - Usa los botones de flecha o **"Avanzar ruta"** para mover el punto.
   - Toca **Vacío / Medio / Lleno** para reportar ocupación.
3. **Ventana B:** entra a la **misma Ruta 1**, elige **🕒 Estoy esperando**.
   - Verás el punto del camión **moverse en vivo**.
   - Verás la **ocupación** que reportó A.
   - Verás la **frescura**: "Actualizado hace X segundos" → con el tiempo cambia a "Señal antigua".
4. Si nadie comparte, B muestra **"Nadie está compartiendo esta ruta ahora"**.

> Tip: ponlas lado a lado para ver la magia del tiempo real.

---

## 📁 Estructura

```
.
├─ supabase/
│  └─ schema.sql            # Tablas, RLS permisivo, Realtime y seed de rutas
├─ src/
│  ├─ app/
│  │  ├─ page.tsx           # Pantalla inicial
│  │  ├─ rutas/page.tsx     # Selección de ruta (3 rutas demo)
│  │  └─ ruta/[id]/page.tsx # Pantalla de ruta (server) -> RouteClient
│  ├─ components/
│  │  ├─ RouteClient.tsx    # Orquesta modos, mapa y panel
│  │  ├─ RidingControls.tsx # Controles de movimiento + reporte de ocupación
│  │  ├─ MapView.tsx        # Mapa Leaflet (client-only)
│  │  ├─ FreshnessPill.tsx  # Estado de frescura
│  │  ├─ OccupancyDisplay.tsx
│  │  ├─ RouteCard.tsx
│  │  └─ Logo.tsx
│  ├─ hooks/
│  │  └─ useRouteChannel.ts # Carga inicial + suscripción Realtime + publish
│  └─ lib/
│     ├─ supabaseClient.ts  # Cliente Supabase (anon)
│     ├─ routes.ts          # Datos de las 3 rutas demo (IDs = seed SQL)
│     ├─ occupancy.ts       # Niveles de ocupación (label/color/hint)
│     ├─ freshness.ts       # Lógica de "hace X segundos / señal antigua"
│     ├─ sourceId.ts        # Identidad anónima por navegador
│     └─ types.ts
├─ .env.example
└─ README.md
```

---

## 🗄️ Modelo de datos

- **routes** — `id`, `name`, `color`, `is_active`, `created_at`
- **vehicle_positions** — `id`, `route_id`, `lat`, `lng`, `source_id`, `created_at`
- **occupancy_reports** — `id`, `route_id`, `level` (`empty`/`medium`/`full`), `source_id`, `created_at`

RLS es **permisivo a propósito** (select + insert público) porque es una demo sin auth. **No lo uses así en producción.**

---

## ☁️ Subir a GitHub

```bash
git init
git add .
git commit -m "Rumbi 2.0 - Claude Version (demo)"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/rumbi-claude.git
git push -u origin main
```

> `.env.local` está en `.gitignore`: tus llaves no se suben.

---

## ▲ Desplegar en Vercel

1. Entra a [vercel.com](https://vercel.com) → **Add New… → Project** e importa tu repo de GitHub.
2. Vercel detecta Next.js automáticamente (no cambies build settings).
3. En **Environment Variables** agrega:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Deploy**. Al terminar tendrás una URL pública.
5. Ábrela en dos navegadores y repite la prueba de tiempo real. 🎉

---

## 🎯 Fuera de alcance (a propósito)

Sin auth, sin pagos, sin reputación, sin dashboard admin, sin múltiples ciudades, sin rutas reales complejas, sin app nativa, sin backend propio, sin IA. Es una demo enfocada en **una** experiencia: dejar de esperar a ciegas.

---

Información en vivo, compartida por la comunidad. **Decide si corres, esperas o cambias de plan.**
