import type { FilamentStatus } from "@/types/inventory";

export const FILAMENT_MATERIALS = [
  "PLA",
  "PLA+",
  "PETG",
  "ABS",
  "ASA",
  "TPU",
  "Nylon",
] as const;

export function getFilamentStatus(
  weightCurrentG: number,
  minStockG: number,
): FilamentStatus {
  if (weightCurrentG <= 0) {
    return "agotado";
  }

  if (weightCurrentG < minStockG) {
    return "bajo_stock";
  }

  return "en_stock";
}

export function formatGrams(grams: number): string {
  const rounded = Math.round(grams * 10) / 10;
  return `${rounded.toLocaleString("es")} g`;
}

export function remainingPercent(
  weightCurrentG: number,
  weightInitialG: number | null,
): number | null {
  if (!weightInitialG || weightInitialG <= 0) {
    return null;
  }

  return Math.max(0, Math.min(100, (weightCurrentG / weightInitialG) * 100));
}
