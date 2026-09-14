import "server-only";

import { requireUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type { Filament } from "@/types/inventory";

type FilamentRow = Database["public"]["Tables"]["filaments"]["Row"];

export function mapFilament(row: FilamentRow): Filament {
  return {
    id: row.id,
    code: row.code,
    material: row.material,
    color: row.color,
    brand: row.brand,
    weightCurrentG: row.weight_current_g,
    weightInitialG: row.weight_initial_g,
    location: row.location,
    minStockG: row.min_stock_g,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getFilaments(): Promise<Filament[]> {
  const user = await requireUser();
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("filaments")
    .select("*")
    .eq("user_id", user.id)
    .order("code", { ascending: true });

  if (error) {
    throw new Error(`No se pudo cargar el inventario: ${error.message}`);
  }

  return data.map(mapFilament);
}
