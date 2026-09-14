"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  Model3DInput,
  Model3DUpdateInput,
  ModelActionResult,
  ModelDimensions,
} from "@/types/viewer";

function toOptionalNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function validateDimensions(
  dimensions: ModelDimensions | null,
): ModelDimensions | null | false {
  if (dimensions === null || dimensions === undefined) {
    return null;
  }

  const x = toOptionalNumber(dimensions.x);
  const y = toOptionalNumber(dimensions.y);
  const z = toOptionalNumber(dimensions.z);

  if (x === null || y === null || z === null || x < 0 || y < 0 || z < 0) {
    return false;
  }

  return { x, y, z };
}

export async function createModel(
  input: Model3DInput,
): Promise<ModelActionResult> {
  const name = input.name?.trim();
  const material = input.material?.trim();
  const filePath = input.filePath?.trim();
  const fileName = input.fileName?.trim();

  if (!name || !material) {
    return { success: false, error: "Nombre y material son obligatorios." };
  }

  if (!filePath || !fileName) {
    return { success: false, error: "El archivo del modelo es obligatorio." };
  }

  const estimatedMinutes = toOptionalNumber(input.estimatedMinutes);
  if (estimatedMinutes !== null && estimatedMinutes < 0) {
    return { success: false, error: "El tiempo estimado no puede ser negativo." };
  }

  const dimensions = validateDimensions(input.dimensions);
  if (dimensions === false) {
    return { success: false, error: "Las dimensiones del modelo no son válidas." };
  }

  const fileSizeBytes = toOptionalNumber(input.fileSizeBytes);

  const user = await requireUser();
  const supabase = await createServerSupabaseClient();

  const { data: last } = await supabase
    .from("models")
    .select("code")
    .eq("user_id", user.id)
    .order("code", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("models").insert({
    user_id: user.id,
    code: (last?.code ?? 0) + 1,
    name,
    material,
    estimated_minutes: estimatedMinutes,
    dimensions_x: dimensions?.x ?? null,
    dimensions_y: dimensions?.y ?? null,
    dimensions_z: dimensions?.z ?? null,
    file_path: filePath,
    file_name: fileName,
    file_size_bytes: fileSizeBytes,
    thumbnail_path: input.thumbnailPath?.trim() || null,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/modelos");
  return { success: true };
}

export async function updateModel(
  id: string,
  input: Model3DUpdateInput,
): Promise<ModelActionResult> {
  const name = input.name?.trim();
  const material = input.material?.trim();

  if (!name || !material) {
    return { success: false, error: "Nombre y material son obligatorios." };
  }

  const estimatedMinutes = toOptionalNumber(input.estimatedMinutes);
  if (estimatedMinutes !== null && estimatedMinutes < 0) {
    return { success: false, error: "El tiempo estimado no puede ser negativo." };
  }

  const user = await requireUser();
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("models")
    .update({
      name,
      material,
      estimated_minutes: estimatedMinutes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/modelos");
  return { success: true };
}

export async function deleteModel(id: string): Promise<ModelActionResult> {
  const user = await requireUser();
  const supabase = await createServerSupabaseClient();

  const { data: current, error: fetchError } = await supabase
    .from("models")
    .select("file_path, thumbnail_path")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError || !current) {
    return { success: false, error: "No se encontró el modelo." };
  }

  const paths = [current.file_path, current.thumbnail_path].filter(
    (path): path is string => Boolean(path),
  );

  if (paths.length > 0) {
    await supabase.storage.from("models").remove(paths);
  }

  const { error } = await supabase
    .from("models")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/modelos");
  return { success: true };
}

export async function markModelViewed(id: string): Promise<ModelActionResult> {
  const user = await requireUser();
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("models")
    .update({ last_viewed_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
