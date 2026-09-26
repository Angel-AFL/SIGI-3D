-- Planificador de producción. Convierte las máquinas en perfiles de impresora
-- (tamaño de cama, boquilla y costo/hora), añade lotes de producción con
-- métricas de tiempo, filamento, costo y mermas, y los campos de apoyo en
-- models (gramos por pieza) y filaments (precio por kg). Todas las políticas
-- RLS se basan en auth.uid() = user_id.

-- 1. printers -> perfil de impresora.
alter table public.printers
  add column if not exists bed_x numeric
    check (bed_x is null or bed_x > 0);

alter table public.printers
  add column if not exists bed_y numeric
    check (bed_y is null or bed_y > 0);

alter table public.printers
  add column if not exists bed_z numeric
    check (bed_z is null or bed_z > 0);

alter table public.printers
  add column if not exists nozzle_diameter numeric not null default 0.4
    check (nozzle_diameter > 0);

alter table public.printers
  add column if not exists cost_per_hour numeric not null default 0
    check (cost_per_hour >= 0);

-- 2. models -> gramos por pieza (dato opcional del slicer).
alter table public.models
  add column if not exists weight_grams numeric
    check (weight_grams is null or weight_grams >= 0);

-- 3. filaments -> precio por kg (para estimar costos).
alter table public.filaments
  add column if not exists price_per_kg numeric
    check (price_per_kg is null or price_per_kg >= 0);

-- 4. Lotes de producción (reemplaza print_jobs). Los campos calculados se
-- guardan como snapshot para que el lote no cambie si luego se edita el modelo.
create table if not exists public.production_batches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code integer not null,
  printer_id uuid references public.printers(id) on delete set null,
  model_id uuid references public.models(id) on delete set null,
  filament_id uuid references public.filaments(id) on delete set null,
  copies integer not null default 1 check (copies > 0),
  units_per_bed integer not null default 1 check (units_per_bed > 0),
  beds integer not null default 1 check (beds > 0),
  material text,
  grams_per_unit numeric not null default 0 check (grams_per_unit >= 0),
  minutes_per_bed numeric not null default 0 check (minutes_per_bed >= 0),
  status text not null default 'en_cola'
    check (status in ('en_cola', 'imprimiendo', 'completado', 'fallido')),
  waste_grams numeric not null default 0 check (waste_grams >= 0),
  waste_reason text,
  inventory_applied boolean not null default false,
  applied_grams numeric not null default 0 check (applied_grams >= 0),
  started_at timestamptz,
  finished_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, code)
);

alter table public.production_batches enable row level security;

create index if not exists production_batches_user_id_idx
  on public.production_batches (user_id);

create index if not exists production_batches_printer_id_idx
  on public.production_batches (printer_id);

create index if not exists production_batches_model_id_idx
  on public.production_batches (model_id);

drop policy if exists "production_batches_select_own" on public.production_batches;
create policy "production_batches_select_own"
  on public.production_batches for select
  using (auth.uid() = user_id);

drop policy if exists "production_batches_insert_own" on public.production_batches;
create policy "production_batches_insert_own"
  on public.production_batches for insert
  with check (auth.uid() = user_id);

drop policy if exists "production_batches_update_own" on public.production_batches;
create policy "production_batches_update_own"
  on public.production_batches for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "production_batches_delete_own" on public.production_batches;
create policy "production_batches_delete_own"
  on public.production_batches for delete
  using (auth.uid() = user_id);

-- 5. Retira la tabla obsoleta del primer enfoque (máquinas + trabajos).
drop table if exists public.print_jobs;
