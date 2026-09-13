-- Vincula cada suscripción Web Push con el usuario autenticado.
-- Las filas creadas antes de la autenticación no pueden asociarse a nadie,
-- por lo que se eliminan (los dispositivos volverán a suscribirse).

alter table public.push_subscriptions
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

delete from public.push_subscriptions where user_id is null;

create index if not exists push_subscriptions_user_id_idx
  on public.push_subscriptions (user_id);

-- RLS ya está habilitado en 0001. Cada usuario solo gestiona sus filas.
-- El service role (servidor) omite RLS para enviar notificaciones.

drop policy if exists "push_subscriptions_select_own" on public.push_subscriptions;
create policy "push_subscriptions_select_own"
  on public.push_subscriptions for select
  using (auth.uid() = user_id);

drop policy if exists "push_subscriptions_insert_own" on public.push_subscriptions;
create policy "push_subscriptions_insert_own"
  on public.push_subscriptions for insert
  with check (auth.uid() = user_id);

drop policy if exists "push_subscriptions_update_own" on public.push_subscriptions;
create policy "push_subscriptions_update_own"
  on public.push_subscriptions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "push_subscriptions_delete_own" on public.push_subscriptions;
create policy "push_subscriptions_delete_own"
  on public.push_subscriptions for delete
  using (auth.uid() = user_id);
