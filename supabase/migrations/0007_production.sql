-- Producción. Máquinas de impresión (printers) y trabajos (print_jobs). Cada
-- usuario gestiona sus propias máquinas y trabajos, por lo que todas las
-- políticas RLS se basan en auth.uid() = user_id. Un trabajo puede asignarse a
-- una máquina y referenciar un modelo del catálogo 3D.

create table if not exists public.printers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code integer not null,
  name text not null,
  status text not null default 'disponible'
    check (status in ('disponible', 'mantenimiento')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, code)
);

create table if not exists public.print_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code integer not null,
  printer_id uuid references public.printers(id) on delete set null,
  model_id uuid references public.models(id) on delete set null,
  status text not null default 'en_cola'
    check (status in ('en_cola', 'imprimiendo', 'pausado', 'completado', 'error')),
  progress integer not null default 0 check (progress between 0 and 100),
  remaining_minutes integer check (remaining_minutes is null or remaining_minutes >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, code)
);

alter table public.printers enable row level security;
alter table public.print_jobs enable row level security;

create index if not exists printers_user_id_idx
  on public.printers (user_id);

create index if not exists print_jobs_user_id_idx
  on public.print_jobs (user_id);

create index if not exists print_jobs_printer_id_idx
  on public.print_jobs (printer_id);

drop policy if exists "printers_select_own" on public.printers;
create policy "printers_select_own"
  on public.printers for select
  using (auth.uid() = user_id);

drop policy if exists "printers_insert_own" on public.printers;
create policy "printers_insert_own"
  on public.printers for insert
  with check (auth.uid() = user_id);

drop policy if exists "printers_update_own" on public.printers;
create policy "printers_update_own"
  on public.printers for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "printers_delete_own" on public.printers;
create policy "printers_delete_own"
  on public.printers for delete
  using (auth.uid() = user_id);

drop policy if exists "print_jobs_select_own" on public.print_jobs;
create policy "print_jobs_select_own"
  on public.print_jobs for select
  using (auth.uid() = user_id);

drop policy if exists "print_jobs_insert_own" on public.print_jobs;
create policy "print_jobs_insert_own"
  on public.print_jobs for insert
  with check (auth.uid() = user_id);

drop policy if exists "print_jobs_update_own" on public.print_jobs;
create policy "print_jobs_update_own"
  on public.print_jobs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "print_jobs_delete_own" on public.print_jobs;
create policy "print_jobs_delete_own"
  on public.print_jobs for delete
  using (auth.uid() = user_id);
