import type { ModelDimensions } from "@/types/viewer";
import type {
  BatchStatus,
  PrinterStatus,
  ProductionBatch,
  ProductionModelOption,
  ProductionPlan,
  ProductionStats,
} from "@/types/production";

export const PRINTER_STATUSES: PrinterStatus[] = [
  "disponible",
  "mantenimiento",
];

export const PRINTER_STATUS_LABELS: Record<PrinterStatus, string> = {
  disponible: "Disponible",
  mantenimiento: "Mantenimiento",
};

export const BATCH_STATUSES: BatchStatus[] = [
  "en_cola",
  "imprimiendo",
  "completado",
  "fallido",
];

export const BATCH_STATUS_LABELS: Record<BatchStatus, string> = {
  en_cola: "En cola",
  imprimiendo: "Imprimiendo",
  completado: "Completado",
  fallido: "Fallido",
};

// Densidad aproximada del filamento en g/cm³.
const MATERIAL_DENSITIES: Record<string, number> = {
  PLA: 1.24,
  "PLA+": 1.24,
  PETG: 1.27,
  ABS: 1.04,
  ASA: 1.07,
  TPU: 1.21,
  Nylon: 1.14,
};

const DEFAULT_DENSITY = 1.24;

// Factor de relleno aproximado sobre el volumen del bounding box para estimar
// el filamento cuando no se capturaron los gramos exactos del slicer.
const FILL_FACTOR = 0.4;

// Separación mínima entre piezas al acomodar la cama, en mm.
const BED_GAP_MM = 5;

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function formatCode(value: number): string {
  return `#${String(value).padStart(3, "0")}`;
}

export function formatDuration(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return "0m";
  }

  const total = Math.round(minutes);
  const hours = Math.floor(total / 60);
  const rest = total % 60;

  if (hours === 0) {
    return `${rest}m`;
  }

  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
}

export function isActiveBatch(status: BatchStatus): boolean {
  return status === "en_cola" || status === "imprimiendo";
}

/**
 * Cuántas piezas del modelo caben en una cama, probando ambas orientaciones
 * de la huella (X,Y) y con una separación mínima entre piezas. Devuelve null
 * si faltan dimensiones o si el modelo es más alto que la cama.
 */
export function unitsPerBed(
  dimensions: ModelDimensions | null,
  bedX: number | null,
  bedY: number | null,
  bedZ: number | null,
  gap = BED_GAP_MM,
): number | null {
  if (!dimensions || !bedX || !bedY) {
    return null;
  }

  const { x, y, z } = dimensions;

  if (x <= 0 || y <= 0) {
    return null;
  }

  if (bedZ !== null && bedZ > 0 && z > bedZ) {
    return null;
  }

  const grid = (dx: number, dy: number) =>
    Math.floor((bedX + gap) / (dx + gap)) *
    Math.floor((bedY + gap) / (dy + gap));

  const best = Math.max(grid(x, y), grid(y, x));

  return best > 0 ? best : null;
}

/**
 * Estimación de gramos a partir del volumen del bounding box, la densidad del
 * material y un factor de relleno. Es un respaldo cuando el modelo no tiene
 * capturado su peso real.
 */
export function estimateGrams(
  dimensions: ModelDimensions | null,
  material: string,
): number | null {
  if (!dimensions) {
    return null;
  }

  const volumeCm3 = (dimensions.x * dimensions.y * dimensions.z) / 1000;

  if (volumeCm3 <= 0) {
    return null;
  }

  const density = MATERIAL_DENSITIES[material] ?? DEFAULT_DENSITY;

  return round1(volumeCm3 * density * FILL_FACTOR);
}

export function gramsPerUnit(
  model: Pick<
    ProductionModelOption,
    "weightGrams" | "dimensions" | "material"
  >,
): number | null {
  if (model.weightGrams !== null && model.weightGrams > 0) {
    return model.weightGrams;
  }

  return estimateGrams(model.dimensions, model.material);
}

export interface BatchCost {
  materialCost: number | null;
  machineCost: number;
  totalCost: number | null;
}

export function computeBatchCost(
  batch: Pick<
    ProductionBatch,
    "beds" | "minutesPerBed" | "copies" | "gramsPerUnit"
  >,
  pricePerKg: number | null,
  costPerHour: number,
): BatchCost {
  const hours = (batch.beds * batch.minutesPerBed) / 60;
  const machineCost = round2(hours * costPerHour);
  const materialCost =
    pricePerKg === null
      ? null
      : round2(((batch.copies * batch.gramsPerUnit) / 1000) * pricePerKg);

  return {
    materialCost,
    machineCost,
    totalCost:
      materialCost === null ? null : round2(materialCost + machineCost),
  };
}

export function computePlan(input: {
  copies: number;
  unitsPerBed: number | null;
  minutesPerBed: number;
  gramsPerUnit: number;
  pricePerKg: number | null;
  costPerHour: number;
}): ProductionPlan {
  const beds =
    input.unitsPerBed !== null && input.unitsPerBed > 0
      ? Math.ceil(input.copies / input.unitsPerBed)
      : null;

  const totalMinutes = beds === null ? 0 : beds * input.minutesPerBed;
  const totalGrams = input.copies * input.gramsPerUnit;
  const machineCost = round2((totalMinutes / 60) * input.costPerHour);
  const materialCost =
    input.pricePerKg === null
      ? null
      : round2((totalGrams / 1000) * input.pricePerKg);

  return {
    unitsPerBed: input.unitsPerBed,
    beds,
    totalMinutes,
    totalGrams,
    materialCost,
    machineCost,
    totalCost:
      materialCost === null ? null : round2(materialCost + machineCost),
  };
}

export function computeProductionStats(
  batches: ProductionBatch[],
  priceByFilamentId: Map<string, number | null>,
  costPerHourByPrinterId: Map<string, number>,
): ProductionStats {
  let queuedBatches = 0;
  let printingBatches = 0;
  let plannedMinutes = 0;
  let requiredGrams = 0;
  let estimatedCost = 0;

  for (const batch of batches) {
    if (batch.status === "en_cola") {
      queuedBatches += 1;
    } else if (batch.status === "imprimiendo") {
      printingBatches += 1;
    }

    if (!isActiveBatch(batch.status)) {
      continue;
    }

    plannedMinutes += batch.beds * batch.minutesPerBed;
    requiredGrams += batch.copies * batch.gramsPerUnit;

    const pricePerKg = batch.filamentId
      ? (priceByFilamentId.get(batch.filamentId) ?? null)
      : null;
    const costPerHour = batch.printerId
      ? (costPerHourByPrinterId.get(batch.printerId) ?? 0)
      : 0;

    estimatedCost += computeBatchCost(batch, pricePerKg, costPerHour).totalCost ?? 0;
  }

  return {
    queuedBatches,
    printingBatches,
    plannedMinutes,
    requiredGrams: round1(requiredGrams),
    estimatedCost: round2(estimatedCost),
  };
}
