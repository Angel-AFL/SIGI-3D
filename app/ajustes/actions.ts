"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface DeleteAccountState {
  error?: string;
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

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);

  if (deleteError) {
    return { error: "No se pudo eliminar la cuenta. Inténtalo de nuevo." };
  }

  if (paths.length > 0) {
    await admin.storage.from("models").remove(paths);
  }

  await supabase.auth.signOut();
  redirect("/login");
}
