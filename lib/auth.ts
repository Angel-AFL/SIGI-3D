import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Data Access Layer de autenticación. `getUser` valida el token contra el
 * servidor de Supabase y memoiza el resultado durante el render.
 */
export const getUser = cache(async () => {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  return data.user;
});

export async function requireUser() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
