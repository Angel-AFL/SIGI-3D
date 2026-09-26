import type { ModelDimensions } from "@/types/viewer";

export type PrinterStatus = "disponible" | "mantenimiento";

export type BatchStatus = "en_cola" | "imprimiendo" | "completado" | "fallido";

export interface PrinterProfile {
  id: string;
  code: number;
  name: string;
  status: PrinterStatus;
  bedX: number | null;
  bedY: number | null;
  bedZ: number | null;
  nozzleDiameter: number;
  costPerHour: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductionBatch {
  id: string;
  code: number;
  printerId: string | null;
  printerName: string | null;
  modelId: string | null;
  modelCode: number | null;
  modelName: string | null;
  filamentId: string | null;
  filamentLabel: string | null;
  copies: number;
  unitsPerBed: number;
  beds: number;
  material: string | null;
  gramsPerUnit: number;
  minutesPerBed: number;
  status: BatchStatus;
  wasteGrams: number;
  wasteReason: string | null;
  inventoryApplied: boolean;
  appliedGrams: number;
  startedAt: string | null;
  finishedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PrinterProfileInput {
  name: string;
  status: PrinterStatus;
  bedX: number | null;
  bedY: number | null;
  bedZ: number | null;
  nozzleDiameter: number;
  costPerHour: number;
  notes: string | null;
}

export interface BatchInput {
  printerId: string | null;
  modelId: string | null;
  filamentId: string | null;
  copies: number;
  unitsPerBed: number;
  material: string | null;
  gramsPerUnit: number;
  minutesPerBed: number;
  status: BatchStatus;
  notes: string | null;
}

export interface ProductionModelOption {
  id: string;
  code: number;
  name: string;
  material: string;
  estimatedMinutes: number | null;
  weightGrams: number | null;
  dimensions: ModelDimensions | null;
}

export interface ProductionFilamentOption {
  id: string;
  code: number;
  material: string;
  color: string;
  brand: string;
  weightCurrentG: number;
  pricePerKg: number | null;
}

export interface ProductionPlan {
  unitsPerBed: number | null;
  beds: number | null;
  totalMinutes: number;
  totalGrams: number;
  materialCost: number | null;
  machineCost: number;
  totalCost: number | null;
}

export interface ProductionStats {
  queuedBatches: number;
  printingBatches: number;
  plannedMinutes: number;
  requiredGrams: number;
  estimatedCost: number;
}

export interface ProductionData {
  printers: PrinterProfile[];
  batches: ProductionBatch[];
  modelOptions: ProductionModelOption[];
  filamentOptions: ProductionFilamentOption[];
  stats: ProductionStats;
}

export type ProductionActionResult =
  | { success: true }
  | { success: false; error: string };
