-- Suscripciones Web Push (PWA). Se accede únicamente con la service role key
-- desde el servidor, por lo que RLS queda habilitado sin políticas públicas.

create extension if not exists "pgcrypto";

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;
