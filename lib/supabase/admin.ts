import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

let adminClient: SupabaseClient<Database> | undefined;

/**
 * Cliente con la service role key. Omite RLS y solo debe usarse en el
 * servidor para tareas administrativas (p. ej. enviar notificaciones push).
 */
export function createAdminSupabaseClient(): SupabaseClient<Database> {
  if (adminClient) {
    return adminClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !secretKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SECRET_KEY en las variables de entorno.",
    );
  }

  adminClient = createClient<Database>(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return adminClient;
}
