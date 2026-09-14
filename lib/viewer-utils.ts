import { FILAMENT_MATERIALS } from "@/lib/inventory-utils";
import type { ModelDimensions } from "@/types/viewer";

export const MODEL_MATERIALS = FILAMENT_MATERIALS;

export function formatEstimatedTime(minutes: number | null): string {
  if (minutes === null || minutes <= 0) {
    return "—";
  }

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (hours === 0) {
    return `${rest} min`;
  }

  if (rest === 0) {
    return `${hours} h`;
  }

  return `${hours} h ${rest} min`;
}

export function formatDimensions(dimensions: ModelDimensions | null): string {
  if (!dimensions) {
    return "—";
  }

  const round = (value: number) => Math.round(value * 10) / 10;
  return `${round(dimensions.x)} × ${round(dimensions.y)} × ${round(dimensions.z)} mm`;
}

export function formatFileSize(bytes: number | null): string {
  if (bytes === null || bytes <= 0) {
    return "—";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${Math.round((bytes / (1024 * 1024)) * 10) / 10} MB`;
}
