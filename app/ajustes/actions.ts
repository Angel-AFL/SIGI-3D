"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getAvatarPath } from "@/lib/profile";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface DeleteAccountState {
  error?: string;
}

export interface AvatarActionState {
  error?: string;
  success?: boolean;
}

const AVATAR_BUCKET = "avatars";
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ["image/png", "image/jpeg", "image/webp"];

function avatarPathFor(userId: string): string {
  return `${userId}/avatar`;
}

/**
 * Sube (o reemplaza) la foto de perfil del usuario en el bucket público
 * `avatars` y guarda su ruta en `user_metadata`.
 */
export async function updateAvatar(
  _state: AvatarActionState,
  formData: FormData,
): Promise<AvatarActionState> {
  const user = await requireUser();
  const file = formData.get("avatar");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecciona una imagen." };
  }

  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    return { error: "Formato no válido. Usa PNG, JPEG o WebP." };
  }

  if (file.size > MAX_AVATAR_BYTES) {
    return { error: "La imagen no puede superar 2 MB." };
  }

  const supabase = await createServerSupabaseClient();
  const path = avatarPathFor(user.id);

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, {
      upsert: true,
      contentType: file.type,
      cacheControl: "3600",
    });

  if (uploadError) {
    return { error: `No se pudo subir la imagen: ${uploadError.message}` };
  }

  const { error: metaError } = await supabase.auth.updateUser({
    data: { avatar_path: path, avatar_updated_at: Date.now() },
  });

  if (metaError) {
    return { error: "No se pudo guardar la foto de perfil." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * Elimina la foto de perfil del usuario del Storage y de `user_metadata`.
 */
export async function removeAvatar(): Promise<AvatarActionState> {
  const user = await requireUser();
  const supabase = await createServerSupabaseClient();
  const path = getAvatarPath(user) ?? avatarPathFor(user.id);

  await supabase.storage.from(AVATAR_BUCKET).remove([path]);

  const { error } = await supabase.auth.updateUser({
    data: { avatar_path: null, avatar_updated_at: null },
  });

  if (error) {
    return { error: "No se pudo eliminar la foto de perfil." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * Elimina de forma permanente la cuenta del usuario y todos sus datos.
 *
 * Los archivos del bucket `models` no se borran por cascada, por lo que se
 * recopilan sus rutas antes de eliminar el usuario. El borrado de auth.users
 * elimina en cascada filas de filaments, orders, models, printers,
 * production_batches y push_subscriptions.
 */
export async function deleteAccount(
  _state: DeleteAccountState,
  formData: FormData,
): Promise<DeleteAccountState> {
  const user = await requireUser();
  const email = user.email ?? "";
  const confirmation = String(formData.get("confirmation") ?? "")
    .trim()
    .toLowerCase();

  if (!email || confirmation !== email.toLowerCase()) {
    return {
      error: "Escribe tu correo electrónico exactamente para confirmar.",
    };
  }

  const supabase = await createServerSupabaseClient();
  const admin = createAdminSupabaseClient();

  const { data: models, error: modelsError } = await supabase
    .from("models")
    .select("file_path, thumbnail_path")
    .eq("user_id", user.id);

  if (modelsError) {
    return { error: "No se pudieron recopilar los archivos del usuario." };
  }

  const paths = (models ?? []).flatMap((model) =>
    [model.file_path, model.thumbnail_path].filter(
      (path): path is string => Boolean(path),
    ),
  );

  const avatarPath = getAvatarPath(user);

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);

  if (deleteError) {
    return { error: "No se pudo eliminar la cuenta. Inténtalo de nuevo." };
  }

  if (paths.length > 0) {
    await admin.storage.from("models").remove(paths);
  }

  if (avatarPath) {
    await admin.storage.from(AVATAR_BUCKET).remove([avatarPath]);
  }

  await supabase.auth.signOut();
  redirect("/login");
}
