import "server-only";

import type { User } from "@supabase/supabase-js";

/**
 * Ruta del avatar del usuario dentro del bucket público `avatars`. Se guarda
 * en `user_metadata`, por lo que se elimina automáticamente con la cuenta.
 */
export function getAvatarPath(user: User): string | null {
  const path = user.user_metadata?.avatar_path;
  return typeof path === "string" && path.length > 0 ? path : null;
}

/**
 * URL pública del avatar. Añade una versión basada en `avatar_updated_at`
 * para invalidar la caché cuando el usuario cambia su foto.
 */
export function getAvatarUrl(user: User): string | null {
  const path = getAvatarPath(user);
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!path || !baseUrl) {
    return null;
  }

  const version = user.user_metadata?.avatar_updated_at;
  const suffix = version ? `?v=${encodeURIComponent(String(version))}` : "";

  return `${baseUrl}/storage/v1/object/public/avatars/${path}${suffix}`;
}
