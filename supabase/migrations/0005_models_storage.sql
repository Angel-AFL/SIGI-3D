-- Bucket privado para los archivos STL y sus miniaturas.
-- La primera carpeta de cada objeto debe ser el uid del usuario propietario:
--   {user_id}/{model_id}/model.stl
--   {user_id}/{model_id}/thumb.png

insert into storage.buckets (id, name, public)
values ('models', 'models', false)
on conflict (id) do nothing;

drop policy if exists "models_storage_select_own" on storage.objects;
create policy "models_storage_select_own"
  on storage.objects for select
  using (
    bucket_id = 'models'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "models_storage_insert_own" on storage.objects;
create policy "models_storage_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'models'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "models_storage_update_own" on storage.objects;
create policy "models_storage_update_own"
  on storage.objects for update
  using (
    bucket_id = 'models'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'models'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "models_storage_delete_own" on storage.objects;
create policy "models_storage_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'models'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
