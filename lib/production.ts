import "server-only";

import { requireUser } from "@/lib/auth";
import {
  BATCH_STATUSES,
  computeProductionStats,
  formatCode,
  PRINTER_STATUSES,
} from "@/lib/production-utils";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type { ModelDimensions } from "@/types/viewer";
import type {
  BatchStatus,
  PrinterProfile,
  PrinterStatus,
  ProductionBatch,
  ProductionData,
  ProductionFilamentOption,
  ProductionModelOption,
  ProductionStats,
} from "@/types/production";

type PrinterRow = Database["public"]["Tables"]["printers"]["Row"];
type BatchRow = Database["public"]["Tables"]["production_batches"]["Row"];
type ModelRow = Database["public"]["Tables"]["models"]["Row"];
type FilamentRow = Database["public"]["Tables"]["filaments"]["Row"];

function toPrinterStatus(value: string): PrinterStatus {
  return PRINTER_STATUSES.includes(value as PrinterStatus)
    ? (value as PrinterStatus)
    : "disponible";
}

function toBatchStatus(value: string): BatchStatus {
  return BATCH_STATUSES.includes(value as BatchStatus)
    ? (value as BatchStatus)
    : "en_cola";
}

function toDimensions(row: ModelRow): ModelDimensions | null {
  if (
    row.dimensions_x === null ||
    row.dimensions_y === null ||
    row.dimensions_z === null
  ) {
    return null;
  }

  return { x: row.dimensions_x, y: row.dimensions_y, z: row.dimensions_z };
}

export function mapPrinterProfile(row: PrinterRow): PrinterProfile {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    status: toPrinterStatus(row.status),
    bedX: row.bed_x,
    bedY: row.bed_y,
    bedZ: row.bed_z,
    nozzleDiameter: row.nozzle_diameter,
    costPerHour: row.cost_per_hour,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapModelOption(row: ModelRow): ProductionModelOption {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    material: row.material,
    estimatedMinutes: row.estimated_minutes,
    weightGrams: row.weight_grams,
    dimensions: toDimensions(row),
  };
}

function mapFilamentOption(row: FilamentRow): ProductionFilamentOption {
  return {
    id: row.id,
    code: row.code,
    material: row.material,
    color: row.color,
    brand: row.brand,
    weightCurrentG: row.weight_current_g,
    pricePerKg: row.price_per_kg,
  };
}

interface BatchIndexes {
  printers: Map<string, PrinterProfile>;
  models: Map<string, ProductionModelOption>;
  filaments: Map<string, ProductionFilamentOption>;
}

function filamentLabel(filament: ProductionFilamentOption): string {
  return `${formatCode(filament.code)} ${filament.material} ${filament.color}`;
}

function mapBatch(row: BatchRow, indexes: BatchIndexes): ProductionBatch {
  const printer = row.printer_id
    ? indexes.printers.get(row.printer_id)
    : undefined;
  const model = row.model_id ? indexes.models.get(row.model_id) : undefined;
  const filament = row.filament_id
    ? indexes.filaments.get(row.filament_id)
    : undefined;

  return {
    id: row.id,
    code: row.code,
    printerId: row.printer_id,
    printerName: printer?.name ?? null,
    modelId: row.model_id,
    modelCode: model?.code ?? null,
    modelName: model?.name ?? null,
    filamentId: row.filament_id,
    filamentLabel: filament ? filamentLabel(filament) : null,
    copies: row.copies,
    unitsPerBed: row.units_per_bed,
    beds: row.beds,
    material: row.material,
    gramsPerUnit: row.grams_per_unit,
    minutesPerBed: row.minutes_per_bed,
    status: toBatchStatus(row.status),
    wasteGrams: row.waste_grams,
    wasteReason: row.waste_reason,
    inventoryApplied: row.inventory_applied,
    appliedGrams: row.applied_grams,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function fetchPrinterRows(): Promise<PrinterRow[]> {
  const user = await requireUser();
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("printers")
    .select("*")
    .eq("user_id", user.id)
    .order("code", { ascending: true });

  if (error) {
    throw new Error(`No se pudieron cargar los perfiles: ${error.message}`);
  }

  return data;
}

async function fetchBatchRows(): Promise<BatchRow[]> {
  const user = await requireUser();
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("production_batches")
    .select("*")
    .eq("user_id", user.id)
    .order("code", { ascending: true });

  if (error) {
    throw new Error(`No se pudieron cargar los lotes: ${error.message}`);
  }

  return data;
}

async function fetchModelRows(): Promise<ModelRow[]> {
  const user = await requireUser();
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("models")
    .select("*")
    .eq("user_id", user.id)
    .order("code", { ascending: true });

  if (error) {
    throw new Error(`No se pudieron cargar los modelos: ${error.message}`);
  }

  return data;
}

async function fetchFilamentRows(): Promise<FilamentRow[]> {
  const user = await requireUser();
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("filaments")
    .select("*")
    .eq("user_id", user.id)
    .order("code", { ascending: true });

  if (error) {
    throw new Error(`No se pudieron cargar los filamentos: ${error.message}`);
  }

  return data;
}

export async function getPrinterProfiles(): Promise<PrinterProfile[]> {
  const rows = await fetchPrinterRows();
  return rows.map(mapPrinterProfile);
}

export async function getModelOptions(): Promise<ProductionModelOption[]> {
  const rows = await fetchModelRows();
  return rows.map(mapModelOption);
}

export async function getFilamentOptions(): Promise<ProductionFilamentOption[]> {
  const rows = await fetchFilamentRows();
  return rows.map(mapFilamentOption);
}

export async function getProductionData(): Promise<ProductionData> {
  const [printerRows, batchRows, modelRows, filamentRows] = await Promise.all([
    fetchPrinterRows(),
    fetchBatchRows(),
    fetchModelRows(),
    fetchFilamentRows(),
  ]);

  const printers = printerRows.map(mapPrinterProfile);
  const modelOptions = modelRows.map(mapModelOption);
  const filamentOptions = filamentRows.map(mapFilamentOption);

  const indexes: BatchIndexes = {
    printers: new Map(printers.map((printer) => [printer.id, printer])),
    models: new Map(modelOptions.map((model) => [model.id, model])),
    filaments: new Map(filamentOptions.map((filament) => [filament.id, filament])),
  };

  const batches = batchRows.map((row) => mapBatch(row, indexes));

  const priceByFilamentId = new Map(
    filamentOptions.map((filament) => [filament.id, filament.pricePerKg]),
  );
  const costPerHourByPrinterId = new Map(
    printers.map((printer) => [printer.id, printer.costPerHour]),
  );

  return {
    printers,
    batches,
    modelOptions,
    filamentOptions,
    stats: computeProductionStats(
      batches,
      priceByFilamentId,
      costPerHourByPrinterId,
    ),
  };
}

export async function getProductionStats(): Promise<ProductionStats> {
  const [printerRows, batchRows, filamentRows] = await Promise.all([
    fetchPrinterRows(),
    fetchBatchRows(),
    fetchFilamentRows(),
  ]);

  const printers = printerRows.map(mapPrinterProfile);
  const filamentOptions = filamentRows.map(mapFilamentOption);
  const indexes: BatchIndexes = {
    printers: new Map(printers.map((printer) => [printer.id, printer])),
    models: new Map(),
    filaments: new Map(filamentOptions.map((filament) => [filament.id, filament])),
  };
  const batches = batchRows.map((row) => mapBatch(row, indexes));

  const priceByFilamentId = new Map(
    filamentOptions.map((filament) => [filament.id, filament.pricePerKg]),
  );
  const costPerHourByPrinterId = new Map(
    printers.map((printer) => [printer.id, printer.costPerHour]),
  );

  return computeProductionStats(
    batches,
    priceByFilamentId,
    costPerHourByPrinterId,
  );
}
