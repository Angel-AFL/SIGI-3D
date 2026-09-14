import "server-only";

import { requireUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type { Model3D, ModelDimensions } from "@/types/viewer";

type ModelRow = Database["public"]["Tables"]["models"]["Row"];

const SIGNED_URL_TTL_SECONDS = 60 * 60;

function mapDimensions(row: ModelRow): ModelDimensions | null {
  if (
    row.dimensions_x === null ||
    row.dimensions_y === null ||
    row.dimensions_z === null
  ) {
    return null;
  }

  return {
    x: row.dimensions_x,
    y: row.dimensions_y,
    z: row.dimensions_z,
  };
}

function mapModel(row: ModelRow, urlByPath: Map<string, string>): Model3D {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    material: row.material,
    estimatedMinutes: row.estimated_minutes,
    dimensions: mapDimensions(row),
    fileName: row.file_name,
    fileSizeBytes: row.file_size_bytes,
    fileUrl: urlByPath.get(row.file_path) ?? null,
    thumbnailUrl: row.thumbnail_path
      ? (urlByPath.get(row.thumbnail_path) ?? null)
      : null,
    lastViewedAt: row.last_viewed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getModels(): Promise<Model3D[]> {
  const user = await requireUser();
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("models")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`No se pudieron cargar los modelos: ${error.message}`);
  }

  const paths = data.flatMap((row) =>
    [row.file_path, row.thumbnail_path].filter(
      (path): path is string => Boolean(path),
    ),
  );

  const urlByPath = new Map<string, string>();

  if (paths.length > 0) {
    const { data: signed } = await supabase.storage
      .from("models")
      .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);

    for (const item of signed ?? []) {
      if (item.path && item.signedUrl) {
        urlByPath.set(item.path, item.signedUrl);
      }
    }
  }

  return data.map((row) => mapModel(row, urlByPath));
}
