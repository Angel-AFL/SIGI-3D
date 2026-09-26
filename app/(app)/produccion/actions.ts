"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { BATCH_STATUSES, PRINTER_STATUSES } from "@/lib/production-utils";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  BatchInput,
  BatchStatus,
  PrinterProfileInput,
  PrinterStatus,
  ProductionActionResult,
} from "@/types/production";

type SupabaseClient = Awaited<ReturnType<typeof createServerSupabaseClient>>;

type ValidatedPrinter = {
  name: string;
  status: PrinterStatus;
  bedX: number | null;
  bedY: number | null;
  bedZ: number | null;
  nozzleDiameter: number;
  costPerHour: number;
  notes: string | null;
};

type ValidatedBatch = {
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
};

interface InventoryState {
  filamentId: string | null;
  applied: boolean;
  appliedGrams: number;
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

function toPrinterStatus(value: unknown): PrinterStatus | null {
  return PRINTER_STATUSES.includes(value as PrinterStatus)
    ? (value as PrinterStatus)
    : null;
}

function toBatchStatus(value: unknown): BatchStatus | null {
  return BATCH_STATUSES.includes(value as BatchStatus)
    ? (value as BatchStatus)
    : null;
}

function toPositiveOrNull(value: unknown): number | null | false {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = toNumber(value);

  if (parsed === null || parsed <= 0) {
    return false;
  }

  return parsed;
}

function validatePrinterInput(
  input: PrinterProfileInput,
): { ok: true; value: ValidatedPrinter } | { ok: false; error: string } {
  const name = input.name?.trim();
  const status = toPrinterStatus(input.status);
  const notes = input.notes?.trim() ? input.notes.trim() : null;
  const bedX = toPositiveOrNull(input.bedX);
  const bedY = toPositiveOrNull(input.bedY);
  const bedZ = toPositiveOrNull(input.bedZ);
  const nozzleDiameter = toNumber(input.nozzleDiameter);
  const costPerHour = toNumber(input.costPerHour);

  if (!name) {
    return { ok: false, error: "El nombre del perfil es obligatorio." };
  }

  if (status === null) {
    return { ok: false, error: "El estado del perfil no es válido." };
  }

  if (bedX === false || bedY === false || bedZ === false) {
    return {
      ok: false,
      error: "Las medidas de la cama deben ser números mayores a 0.",
    };
  }

  if (nozzleDiameter === null || nozzleDiameter <= 0) {
    return {
      ok: false,
      error: "El diámetro de boquilla debe ser mayor a 0.",
    };
  }

  if (costPerHour === null || costPerHour < 0) {
    return {
      ok: false,
      error: "El costo por hora debe ser un número mayor o igual a 0.",
    };
  }

  return {
    ok: true,
    value: {
      name,
      status,
      bedX,
      bedY,
      bedZ,
      nozzleDiameter,
      costPerHour,
      notes,
    },
  };
}

function validateBatchInput(
  input: BatchInput,
): { ok: true; value: ValidatedBatch } | { ok: false; error: string } {
  const copies = toNumber(input.copies);
  const unitsPerBed = toNumber(input.unitsPerBed);
  const gramsPerUnit = toNumber(input.gramsPerUnit);
  const minutesPerBed = toNumber(input.minutesPerBed);
  const status = toBatchStatus(input.status);
  const material = input.material?.trim() ? input.material.trim() : null;
  const notes = input.notes?.trim() ? input.notes.trim() : null;

  if (copies === null || !Number.isInteger(copies) || copies <= 0) {
    return { ok: false, error: "Las copias deben ser un entero mayor a 0." };
  }

  if (unitsPerBed === null || !Number.isInteger(unitsPerBed) || unitsPerBed <= 0) {
    return {
      ok: false,
      error: "Las piezas por cama deben ser un entero mayor a 0.",
    };
  }

  if (gramsPerUnit === null || gramsPerUnit < 0) {
    return {
      ok: false,
      error: "Los gramos por pieza deben ser un número mayor o igual a 0.",
    };
  }

  if (minutesPerBed === null || minutesPerBed < 0) {
    return {
      ok: false,
      error: "El tiempo por cama debe ser un número mayor o igual a 0.",
    };
  }

  if (status === null) {
    return { ok: false, error: "El estado del lote no es válido." };
  }

  return {
    ok: true,
    value: {
      printerId: input.printerId,
      modelId: input.modelId,
      filamentId: input.filamentId,
      copies,
      unitsPerBed,
      material,
      gramsPerUnit,
      minutesPerBed,
      status,
      notes,
    },
  };
}

async function belongsToUser(
  supabase: SupabaseClient,
  table: "printers" | "models" | "filaments",
  id: string,
  userId: string,
): Promise<boolean> {
  const query =
    table === "printers"
      ? supabase.from("printers")
      : table === "models"
        ? supabase.from("models")
        : supabase.from("filaments");

  const { data } = await query
    .select("id")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  return Boolean(data);
}

async function validateRelations(
  supabase: SupabaseClient,
  userId: string,
  value: ValidatedBatch,
): Promise<string | null> {
  if (
    value.printerId &&
    !(await belongsToUser(supabase, "printers", value.printerId, userId))
  ) {
    return "El perfil de impresora seleccionado no existe.";
  }

  if (
    value.modelId &&
    !(await belongsToUser(supabase, "models", value.modelId, userId))
  ) {
    return "El modelo seleccionado no existe.";
  }

  if (
    value.filamentId &&
    !(await belongsToUser(supabase, "filaments", value.filamentId, userId))
  ) {
    return "El filamento seleccionado no existe.";
  }

  return null;
}

function toPrinterColumns(value: ValidatedPrinter) {
  return {
    name: value.name,
    status: value.status,
    bed_x: value.bedX,
    bed_y: value.bedY,
    bed_z: value.bedZ,
    nozzle_diameter: value.nozzleDiameter,
    cost_per_hour: value.costPerHour,
    notes: value.notes,
  };
}

function toBatchColumns(value: ValidatedBatch) {
  return {
    printer_id: value.printerId,
    model_id: value.modelId,
    filament_id: value.filamentId,
    copies: value.copies,
    units_per_bed: value.unitsPerBed,
    beds: Math.ceil(value.copies / value.unitsPerBed),
    material: value.material,
    grams_per_unit: value.gramsPerUnit,
    minutes_per_bed: value.minutesPerBed,
    status: value.status,
    notes: value.notes,
  };
}

function revalidateProduction() {
  revalidatePath("/produccion");
  revalidatePath("/dashboard");
  revalidatePath("/inventario");
}

async function adjustFilament(
  supabase: SupabaseClient,
  userId: string,
  filamentId: string,
  deltaGrams: number,
): Promise<void> {
  const { data: current } = await supabase
    .from("filaments")
    .select("weight_current_g")
    .eq("id", filamentId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!current) {
    return;
  }

  const next = Math.max(0, current.weight_current_g + deltaGrams);

  await supabase
    .from("filaments")
    .update({ weight_current_g: next, updated_at: new Date().toISOString() })
    .eq("id", filamentId)
    .eq("user_id", userId);
}

async function syncInventory(
  supabase: SupabaseClient,
  userId: string,
  previous: InventoryState,
  next: InventoryState,
): Promise<void> {
  if (previous.filamentId && previous.applied && previous.appliedGrams > 0) {
    await adjustFilament(
      supabase,
      userId,
      previous.filamentId,
      previous.appliedGrams,
    );
  }

  if (next.filamentId && next.applied && next.appliedGrams > 0) {
    await adjustFilament(supabase, userId, next.filamentId, -next.appliedGrams);
  }
}

function appliedForStatus(
  status: BatchStatus,
  value: { copies: number; gramsPerUnit: number; wasteGrams: number },
): number {
  if (status === "completado") {
    return value.copies * value.gramsPerUnit;
  }

  if (status === "fallido") {
    return value.wasteGrams;
  }

  return 0;
}

export async function createPrinterProfile(
  input: PrinterProfileInput,
): Promise<ProductionActionResult> {
  const validation = validatePrinterInput(input);
  if (!validation.ok) {
    return { success: false, error: validation.error };
  }

  const user = await requireUser();
  const supabase = await createServerSupabaseClient();

  const { data: last } = await supabase
    .from("printers")
    .select("code")
    .eq("user_id", user.id)
    .order("code", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("printers").insert({
    user_id: user.id,
    code: (last?.code ?? 0) + 1,
    ...toPrinterColumns(validation.value),
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidateProduction();
  return { success: true };
}

export async function updatePrinterProfile(
  id: string,
  input: PrinterProfileInput,
): Promise<ProductionActionResult> {
  const validation = validatePrinterInput(input);
  if (!validation.ok) {
    return { success: false, error: validation.error };
  }

  const user = await requireUser();
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("printers")
    .update({
      ...toPrinterColumns(validation.value),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidateProduction();
  return { success: true };
}

export async function deletePrinterProfile(
  id: string,
): Promise<ProductionActionResult> {
  const user = await requireUser();
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("printers")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidateProduction();
  return { success: true };
}

export async function createBatch(
  input: BatchInput,
): Promise<ProductionActionResult> {
  const validation = validateBatchInput(input);
  if (!validation.ok) {
    return { success: false, error: validation.error };
  }

  const user = await requireUser();
  const supabase = await createServerSupabaseClient();

  const relationError = await validateRelations(
    supabase,
    user.id,
    validation.value,
  );
  if (relationError) {
    return { success: false, error: relationError };
  }

  const { data: last } = await supabase
    .from("production_batches")
    .select("code")
    .eq("user_id", user.id)
    .order("code", { ascending: false })
    .limit(1)
    .maybeSingle();

  const appliedGrams = appliedForStatus(validation.value.status, {
    copies: validation.value.copies,
    gramsPerUnit: validation.value.gramsPerUnit,
    wasteGrams: 0,
  });

  const { error } = await supabase.from("production_batches").insert({
    user_id: user.id,
    code: (last?.code ?? 0) + 1,
    ...toBatchColumns(validation.value),
    inventory_applied: appliedGrams > 0,
    applied_grams: appliedGrams,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (appliedGrams > 0 && validation.value.filamentId) {
    await adjustFilament(
      supabase,
      user.id,
      validation.value.filamentId,
      -appliedGrams,
    );
  }

  revalidateProduction();
  return { success: true };
}

export async function updateBatch(
  id: string,
  input: BatchInput,
): Promise<ProductionActionResult> {
  const validation = validateBatchInput(input);
  if (!validation.ok) {
    return { success: false, error: validation.error };
  }

  const user = await requireUser();
  const supabase = await createServerSupabaseClient();

  const relationError = await validateRelations(
    supabase,
    user.id,
    validation.value,
  );
  if (relationError) {
    return { success: false, error: relationError };
  }

  const { data: current } = await supabase
    .from("production_batches")
    .select(
      "filament_id, inventory_applied, applied_grams, waste_grams, status",
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!current) {
    return { success: false, error: "No se encontró el lote." };
  }

  const appliedGrams = appliedForStatus(validation.value.status, {
    copies: validation.value.copies,
    gramsPerUnit: validation.value.gramsPerUnit,
    wasteGrams: current.waste_grams,
  });

  await syncInventory(
    supabase,
    user.id,
    {
      filamentId: current.filament_id,
      applied: current.inventory_applied,
      appliedGrams: current.applied_grams,
    },
    {
      filamentId: validation.value.filamentId,
      applied: appliedGrams > 0,
      appliedGrams,
    },
  );

  const { error } = await supabase
    .from("production_batches")
    .update({
      ...toBatchColumns(validation.value),
      inventory_applied: appliedGrams > 0,
      applied_grams: appliedGrams,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidateProduction();
  return { success: true };
}

export async function updateBatchStatus(
  id: string,
  status: BatchStatus,
): Promise<ProductionActionResult> {
  const nextStatus = toBatchStatus(status);

  if (nextStatus === null) {
    return { success: false, error: "El estado del lote no es válido." };
  }

  const user = await requireUser();
  const supabase = await createServerSupabaseClient();

  const { data: current } = await supabase
    .from("production_batches")
    .select(
      "filament_id, inventory_applied, applied_grams, copies, grams_per_unit, waste_grams, started_at",
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!current) {
    return { success: false, error: "No se encontró el lote." };
  }

  const appliedGrams = appliedForStatus(nextStatus, {
    copies: current.copies,
    gramsPerUnit: current.grams_per_unit,
    wasteGrams: current.waste_grams,
  });

  await syncInventory(
    supabase,
    user.id,
    {
      filamentId: current.filament_id,
      applied: current.inventory_applied,
      appliedGrams: current.applied_grams,
    },
    {
      filamentId: current.filament_id,
      applied: appliedGrams > 0,
      appliedGrams,
    },
  );

  const now = new Date().toISOString();

  const { error } = await supabase
    .from("production_batches")
    .update({
      status: nextStatus,
      inventory_applied: appliedGrams > 0,
      applied_grams: appliedGrams,
      started_at:
        nextStatus === "imprimiendo" && !current.started_at
          ? now
          : current.started_at,
      finished_at:
        nextStatus === "completado" || nextStatus === "fallido" ? now : null,
      updated_at: now,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidateProduction();
  return { success: true };
}

export async function markBatchFailed(
  id: string,
  wasteGrams: number,
  reason: string | null,
): Promise<ProductionActionResult> {
  const waste = toNumber(wasteGrams);

  if (waste === null || waste < 0) {
    return {
      success: false,
      error: "La merma debe ser un número mayor o igual a 0.",
    };
  }

  const user = await requireUser();
  const supabase = await createServerSupabaseClient();

  const { data: current } = await supabase
    .from("production_batches")
    .select(
      "filament_id, inventory_applied, applied_grams, copies, grams_per_unit, started_at",
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!current) {
    return { success: false, error: "No se encontró el lote." };
  }

  await syncInventory(
    supabase,
    user.id,
    {
      filamentId: current.filament_id,
      applied: current.inventory_applied,
      appliedGrams: current.applied_grams,
    },
    {
      filamentId: current.filament_id,
      applied: waste > 0,
      appliedGrams: waste,
    },
  );

  const now = new Date().toISOString();

  const { error } = await supabase
    .from("production_batches")
    .update({
      status: "fallido",
      waste_grams: waste,
      waste_reason: reason?.trim() ? reason.trim() : null,
      inventory_applied: waste > 0,
      applied_grams: waste,
      finished_at: now,
      updated_at: now,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidateProduction();
  return { success: true };
}

export async function deleteBatch(
  id: string,
): Promise<ProductionActionResult> {
  const user = await requireUser();
  const supabase = await createServerSupabaseClient();

  const { data: current } = await supabase
    .from("production_batches")
    .select("filament_id, inventory_applied, applied_grams")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (current?.filament_id && current.inventory_applied && current.applied_grams > 0) {
    await adjustFilament(
      supabase,
      user.id,
      current.filament_id,
      current.applied_grams,
    );
  }

  const { error } = await supabase
    .from("production_batches")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidateProduction();
  return { success: true };
}
