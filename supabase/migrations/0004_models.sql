-- Catálogo de modelos 3D. Cada usuario gestiona sus propios modelos,
-- por lo que todas las políticas RLS se basan en auth.uid() = user_id.

create table if not exists public.models (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code integer not null,
  name text not null,
  material text not null,
  estimated_minutes integer check (estimated_minutes is null or estimated_minutes >= 0),
  dimensions_x numeric check (dimensions_x is null or dimensions_x >= 0),
  dimensions_y numeric check (dimensions_y is null or dimensions_y >= 0),
  dimensions_z numeric check (dimensions_z is null or dimensions_z >= 0),
  file_path text not null,
  file_name text not null,
  file_size_bytes bigint check (file_size_bytes is null or file_size_bytes >= 0),
  thumbnail_path text,
  last_viewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, code)
);

alter table public.models enable row level security;

create index if not exists models_user_id_idx
  on public.models (user_id);

drop policy if exists "models_select_own" on public.models;
create policy "models_select_own"
  on public.models for select
  using (auth.uid() = user_id);

drop policy if exists "models_insert_own" on public.models;
create policy "models_insert_own"
  on public.models for insert
  with check (auth.uid() = user_id);

drop policy if exists "models_update_own" on public.models;
create policy "models_update_own"
  on public.models for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "models_delete_own" on public.models;
create policy "models_delete_own"
  on public.models for delete
  using (auth.uid() = user_id);
