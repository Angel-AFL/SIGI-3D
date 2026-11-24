-- Fecha real de entrega de los pedidos.
-- Permite agrupar ingresos por el mes en que se entregó el pedido, sin que
-- cambios posteriores (notas, edición) alteren el reporte.

alter table public.orders
  add column if not exists delivered_at timestamptz;

-- Pedidos ya entregados: usamos updated_at como mejor aproximación.
update public.orders
set delivered_at = updated_at
where status = 'entregado' and delivered_at is null;

create index if not exists orders_user_delivered_at_idx
  on public.orders (user_id, delivered_at);

create or replace function public.sync_order_delivered_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'entregado'
     and (tg_op = 'INSERT' or old.status is distinct from 'entregado') then
    new.delivered_at := now();
  elsif new.status <> 'entregado' then
    new.delivered_at := null;
  end if;

  return new;
end;
$$;

drop trigger if exists orders_delivered_at on public.orders;

create trigger orders_delivered_at
before insert or update of status on public.orders
for each row execute function public.sync_order_delivered_at();
