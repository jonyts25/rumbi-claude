-- =====================================================================
-- Rumbi 2.0 - Claude Version · Esquema de base de datos (demo)
-- =====================================================================
-- Pégalo completo en el SQL Editor de Supabase y ejecútalo.
-- RLS permisivo a propósito: esto es una demo SIN auth.
-- =====================================================================

-- Extensión para generar UUIDs.
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------------

create table if not exists public.routes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text not null default '#00d8a0',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.vehicle_positions (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references public.routes (id) on delete cascade,
  lat double precision not null,
  lng double precision not null,
  source_id text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.occupancy_reports (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references public.routes (id) on delete cascade,
  level text not null check (level in ('empty', 'medium', 'full')),
  source_id text not null,
  created_at timestamptz not null default now()
);

-- Índices para leer rápido el último dato por ruta.
create index if not exists idx_vehicle_positions_route_created
  on public.vehicle_positions (route_id, created_at desc);

create index if not exists idx_occupancy_reports_route_created
  on public.occupancy_reports (route_id, created_at desc);

-- ---------------------------------------------------------------------
-- Realtime: publicar cambios de estas tablas
-- ---------------------------------------------------------------------
-- (Si la publicación ya incluye la tabla, Postgres ignora el alter.)
do $$
begin
  begin
    alter publication supabase_realtime add table public.vehicle_positions;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.occupancy_reports;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.routes;
  exception when duplicate_object then null;
  end;
end $$;

-- ---------------------------------------------------------------------
-- Row Level Security (permisivo para la demo)
-- ---------------------------------------------------------------------
alter table public.routes enable row level security;
alter table public.vehicle_positions enable row level security;
alter table public.occupancy_reports enable row level security;

-- SELECT público
drop policy if exists "public select routes" on public.routes;
create policy "public select routes" on public.routes
  for select using (true);

drop policy if exists "public select positions" on public.vehicle_positions;
create policy "public select positions" on public.vehicle_positions
  for select using (true);

drop policy if exists "public select occupancy" on public.occupancy_reports;
create policy "public select occupancy" on public.occupancy_reports
  for select using (true);

-- INSERT público
drop policy if exists "public insert positions" on public.vehicle_positions;
create policy "public insert positions" on public.vehicle_positions
  for insert with check (true);

drop policy if exists "public insert occupancy" on public.occupancy_reports;
create policy "public insert occupancy" on public.occupancy_reports
  for insert with check (true);

-- ---------------------------------------------------------------------
-- Seed: 3 rutas demo (IDs fijos para casar con el front)
-- ---------------------------------------------------------------------
insert into public.routes (id, name, color, is_active) values
  ('11111111-1111-1111-1111-111111111111', 'Ruta 1 · Centro – Minerva', '#00d8a0', true),
  ('22222222-2222-2222-2222-222222222222', 'Ruta 2 · Periférico Norte', '#ffb020', true),
  ('33333333-3333-3333-3333-333333333333', 'Ruta 3 · Tlaquepaque – Universidad', '#8b7bff', true)
on conflict (id) do update
  set name = excluded.name,
      color = excluded.color,
      is_active = excluded.is_active;
