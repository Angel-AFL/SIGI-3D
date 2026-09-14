-- Inventario de filamentos. Cada usuario gestiona su propio inventario,
-- por lo que todas las políticas RLS se basan en auth.uid() = user_id.

create table if not exists public.filaments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code integer not null,
  material text not null,
  color text not null,
  brand text not null,
  weight_current_g numeric not null default 0 check (weight_current_g >= 0),
  weight_initial_g numeric check (weight_initial_g is null or weight_initial_g >= 0),
  location text,
  min_stock_g numeric not null default 250 check (min_stock_g >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, code)
);

alter table public.filaments enable row level security;

create index if not exists filaments_user_id_idx
  on public.filaments (user_id);

drop policy if exists "filaments_select_own" on public.filaments;
create policy "filaments_select_own"
  on public.filaments for select
  using (auth.uid() = user_id);

drop policy if exists "filaments_insert_own" on public.filaments;
create policy "filaments_insert_own"
  on public.filaments for insert
  with check (auth.uid() = user_id);

drop policy if exists "filaments_update_own" on public.filaments;
create policy "filaments_update_own"
  on public.filaments for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "filaments_delete_own" on public.filaments;
create policy "filaments_delete_own"
  on public.filaments for delete
  using (auth.uid() = user_id);
