-- Pedidos. Cada usuario gestiona sus propios pedidos, por lo que todas las
-- políticas RLS se basan en auth.uid() = user_id. Los estados válidos son los
-- mismos que usa el dashboard y StatusBadge (types/dashboard.ts).

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code integer not null,
  customer text not null,
  model_name text not null,
  filament_color text,
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric not null default 0 check (unit_price >= 0),
  total numeric not null default 0 check (total >= 0),
  delivery_date date,
  status text not null default 'cotizado'
    check (status in ('cotizado', 'imprimiendo', 'entregado')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, code)
);

-- Idempotente: si la tabla ya existía sin unit_price, la añade y rellena el
-- precio por unidad a partir del total y la cantidad ya registrados.
alter table public.orders
  add column if not exists unit_price numeric not null default 0
  check (unit_price >= 0);

update public.orders
  set unit_price = round(total / quantity, 2)
  where unit_price = 0 and total > 0 and quantity > 0;

-- Idempotente: añade el color de filamento y retira el estado 'en_cola'
-- (los pedidos existentes en ese estado pasan a 'cotizado').
alter table public.orders
  add column if not exists filament_color text;

alter table public.orders drop constraint if exists orders_status_check;

update public.orders set status = 'cotizado' where status = 'en_cola';

alter table public.orders add constraint orders_status_check
  check (status in ('cotizado', 'imprimiendo', 'entregado'));

alter table public.orders enable row level security;

create index if not exists orders_user_id_idx
  on public.orders (user_id);

drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own"
  on public.orders for select
  using (auth.uid() = user_id);

drop policy if exists "orders_insert_own" on public.orders;
create policy "orders_insert_own"
  on public.orders for insert
  with check (auth.uid() = user_id);

drop policy if exists "orders_update_own" on public.orders;
create policy "orders_update_own"
  on public.orders for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "orders_delete_own" on public.orders;
create policy "orders_delete_own"
  on public.orders for delete
  using (auth.uid() = user_id);
