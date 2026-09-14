"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { FilamentActionResult, FilamentInput } from "@/types/inventory";

type ValidatedInput = {
  material: string;
  color: string;
  brand: string;
  weightCurrentG: number;
  weightInitialG: number | null;
  location: string | null;
  minStockG: number;
};

function toColumns(value: ValidatedInput) {
  return {
    material: value.material,
    color: value.color,
    brand: value.brand,
    weight_current_g: value.weightCurrentG,
    weight_initial_g: value.weightInitialG,
    location: value.location,
    min_stock_g: value.minStockG,
  };
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function validateInput(
  input: FilamentInput,
): { ok: true; value: ValidatedInput } | { ok: false; error: string } {
  const material = input.material?.trim();
  const color = input.color?.trim();
  const brand = input.brand?.trim();
  const location = input.location?.trim() ? input.location.trim() : null;
  const weightCurrentG = toNumber(input.weightCurrentG);
  const minStockG = toNumber(input.minStockG);
  const rawInitial = input.weightInitialG;
  const weightInitialG =
    rawInitial === null || rawInitial === undefined
      ? null
      : toNumber(rawInitial);

  if (!material || !color || !brand) {
    return { ok: false, error: "Material, color y marca son obligatorios." };
  }

  if (weightCurrentG === null || weightCurrentG < 0) {
    return { ok: false, error: "El peso actual debe ser un número mayor o igual a 0." };
  }

  if (minStockG === null || minStockG < 0) {
    return { ok: false, error: "El mínimo de stock debe ser mayor o igual a 0." };
  }

  if (
    rawInitial !== null &&
    rawInitial !== undefined &&
    (weightInitialG === null || weightInitialG < 0)
  ) {
    return { ok: false, error: "El peso inicial debe ser un número mayor o igual a 0." };
  }

  return {
    ok: true,
    value: {
      material,
      color,
      brand,
      weightCurrentG,
      weightInitialG,
      location,
      minStockG,
    },
  };
}

export async function createFilament(
  input: FilamentInput,
): Promise<FilamentActionResult> {
  const validation = validateInput(input);
  if (!validation.ok) {
    return { success: false, error: validation.error };
  }

  const user = await requireUser();
  const supabase = await createServerSupabaseClient();

  const { data: last } = await supabase
    .from("filaments")
    .select("code")
    .eq("user_id", user.id)
    .order("code", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("filaments").insert({
    user_id: user.id,
    code: (last?.code ?? 0) + 1,
    ...toColumns(validation.value),
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/inventario");
  return { success: true };
}

export async function updateFilament(
  id: string,
  input: FilamentInput,
): Promise<FilamentActionResult> {
  const validation = validateInput(input);
  if (!validation.ok) {
    return { success: false, error: validation.error };
  }

  const user = await requireUser();
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("filaments")
    .update({ ...toColumns(validation.value), updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/inventario");
  return { success: true };
}

export async function deleteFilament(id: string): Promise<FilamentActionResult> {
  const user = await requireUser();
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("filaments")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/inventario");
  return { success: true };
}

export async function consumeFilament(
  id: string,
  grams: number,
): Promise<FilamentActionResult> {
  const amount = toNumber(grams);

  if (amount === null || amount <= 0) {
    return { success: false, error: "Indica una cantidad de gramos mayor a 0." };
  }

  const user = await requireUser();
  const supabase = await createServerSupabaseClient();

  const { data: current, error: fetchError } = await supabase
    .from("filaments")
    .select("weight_current_g")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError || !current) {
    return { success: false, error: "No se encontró el carrete." };
  }

  const nextWeight = Math.max(0, current.weight_current_g - amount);

  const { error } = await supabase
    .from("filaments")
    .update({
      weight_current_g: nextWeight,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/inventario");
  return { success: true };
}
