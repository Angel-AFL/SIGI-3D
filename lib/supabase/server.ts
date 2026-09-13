import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Cliente de Supabase para RSC, Server Actions y Route Handlers.
 * Lee la sesión del usuario desde las cookies y respeta RLS.
 *
 * Debe crearse uno nuevo en cada request: reutilizar una instancia entre
 * peticiones dejaría respuestas sin las cabeceras de caché necesarias.
 */
export async function createServerSupabaseClient(): Promise<
  SupabaseClient<Database>
> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !publicKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY en las variables de entorno.",
    );
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(url, publicKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Llamado desde un Server Component (no puede escribir cookies).
          // El proxy se encarga de refrescar la sesión en ese caso.
        }
      },
    },
  });
}
