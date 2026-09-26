import "server-only";

import { createFilament, consumeFilament } from "@/app/(app)/inventario/actions";
import { createOrder, updateOrderStatus } from "@/app/(app)/pedidos/actions";
import {
  createBatch,
  createPrinterProfile,
  markBatchFailed,
  updateBatchStatus,
  updatePrinterProfile,
} from "@/app/(app)/produccion/actions";
import { getFilaments } from "@/lib/inventory";
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/lib/order-utils";
import { getOrders } from "@/lib/orders";
import {
  getModelOptions,
  getPrinterProfiles,
  getProductionData,
} from "@/lib/production";
import {
  BATCH_STATUSES,
  BATCH_STATUS_LABELS,
  gramsPerUnit,
  PRINTER_STATUSES,
  unitsPerBed,
} from "@/lib/production-utils";
import type { OrderStatus } from "@/types/dashboard";
import type {
  BatchStatus,
  PrinterStatus,
  ProductionModelOption,
  PrinterProfile,
} from "@/types/production";

export interface AssistantToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, unknown>;
      required?: string[];
    };
  };
}

export const ASSISTANT_TOOLS: AssistantToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "create_order",
      description:
        "Crea un pedido nuevo. Úsala cuando el usuario pida registrar o crear un pedido.",
      parameters: {
        type: "object",
        properties: {
          customer: { type: "string", description: "Nombre del cliente." },
          model_name: { type: "string", description: "Modelo o pieza." },
          quantity: { type: "integer", description: "Cantidad de piezas." },
          unit_price: {
            type: "number",
            description: "Precio por unidad en MXN.",
          },
          filament_color: {
            type: "string",
            description: "Color del filamento (opcional).",
          },
          delivery_date: {
            type: "string",
            description: "Fecha de entrega en formato YYYY-MM-DD (opcional).",
          },
          status: {
            type: "string",
            enum: ORDER_STATUSES,
            description: "Estado inicial (por defecto cotizado).",
          },
          notes: { type: "string", description: "Notas (opcional)." },
        },
        required: ["customer", "model_name", "quantity", "unit_price"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_order_status",
      description:
        "Cambia el estado de un pedido existente identificado por su código.",
      parameters: {
        type: "object",
        properties: {
          code: { type: "integer", description: "Código del pedido, ej. 12." },
          status: {
            type: "string",
            enum: ORDER_STATUSES,
            description: "Nuevo estado del pedido.",
          },
        },
        required: ["code", "status"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_batch",
      description:
        "Crea un lote de producción. Si se indica el modelo y la impresora, el sistema calcula piezas por cama, gramos y tiempo automáticamente.",
      parameters: {
        type: "object",
        properties: {
          model_code: {
            type: "integer",
            description: "Código del modelo del catálogo (opcional).",
          },
          printer_code: {
            type: "integer",
            description: "Código del perfil de impresora (opcional).",
          },
          filament_code: {
            type: "integer",
            description: "Código del carrete de filamento (opcional).",
          },
          copies: { type: "integer", description: "Número de copias." },
          units_per_bed: {
            type: "integer",
            description: "Piezas por cama (opcional; se calcula si hay modelo e impresora).",
          },
          grams_per_unit: {
            type: "number",
            description: "Gramos por pieza (opcional; se toma del modelo).",
          },
          minutes_per_bed: {
            type: "number",
            description: "Minutos por cama (opcional; se toma del modelo).",
          },
          material: {
            type: "string",
            description: "Material del lote (opcional).",
          },
          status: {
            type: "string",
            enum: BATCH_STATUSES,
            description: "Estado inicial (por defecto en_cola).",
          },
          notes: { type: "string", description: "Notas (opcional)." },
        },
        required: ["copies"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_batch_status",
      description:
        "Cambia el estado de un lote de producción. Al completarlo descuenta filamento del inventario.",
      parameters: {
        type: "object",
        properties: {
          code: { type: "integer", description: "Código del lote, ej. 3." },
          status: {
            type: "string",
            enum: BATCH_STATUSES,
            description: "Nuevo estado del lote.",
          },
        },
        required: ["code", "status"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "mark_batch_failed",
      description:
        "Marca un lote como fallido y registra la merma de filamento.",
      parameters: {
        type: "object",
        properties: {
          code: { type: "integer", description: "Código del lote." },
          waste_grams: {
            type: "number",
            description: "Gramos desperdiciados.",
          },
          reason: { type: "string", description: "Motivo de la falla (opcional)." },
        },
        required: ["code", "waste_grams"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "consume_filament",
      description: "Registra consumo de un carrete y descuenta los gramos.",
      parameters: {
        type: "object",
        properties: {
          code: { type: "integer", description: "Código del carrete." },
          grams: { type: "number", description: "Gramos consumidos." },
        },
        required: ["code", "grams"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_filament",
      description: "Registra un carrete de filamento nuevo en el inventario.",
      parameters: {
        type: "object",
        properties: {
          material: { type: "string", description: "Material, ej. PLA." },
          color: { type: "string", description: "Color." },
          brand: { type: "string", description: "Marca." },
          weight_current_g: {
            type: "number",
            description: "Gramos actuales.",
          },
          min_stock_g: {
            type: "number",
            description: "Mínimo de stock en gramos.",
          },
          weight_initial_g: {
            type: "number",
            description: "Gramos iniciales (opcional).",
          },
          location: { type: "string", description: "Ubicación (opcional)." },
          price_per_kg: {
            type: "number",
            description: "Precio por kg en MXN (opcional).",
          },
        },
        required: ["material", "color", "brand", "weight_current_g", "min_stock_g"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_printer_profile",
      description: "Crea un perfil de impresora.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Nombre o modelo." },
          status: {
            type: "string",
            enum: PRINTER_STATUSES,
            description: "Estado (por defecto disponible).",
          },
          bed_x: { type: "number", description: "Cama X en mm (opcional)." },
          bed_y: { type: "number", description: "Cama Y en mm (opcional)." },
          bed_z: { type: "number", description: "Cama Z en mm (opcional)." },
          nozzle_diameter: {
            type: "number",
            description: "Diámetro de boquilla en mm (por defecto 0.4).",
          },
          cost_per_hour: {
            type: "number",
            description: "Costo por hora en MXN (por defecto 0).",
          },
          notes: { type: "string", description: "Notas (opcional)." },
        },
        required: ["name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_printer_profile",
      description:
        "Edita un perfil de impresora existente. Solo envía los campos a cambiar.",
      parameters: {
        type: "object",
        properties: {
          code: { type: "integer", description: "Código del perfil." },
          name: { type: "string", description: "Nuevo nombre (opcional)." },
          status: {
            type: "string",
            enum: PRINTER_STATUSES,
            description: "Nuevo estado (opcional).",
          },
          bed_x: { type: "number", description: "Nueva cama X en mm (opcional)." },
          bed_y: { type: "number", description: "Nueva cama Y en mm (opcional)." },
          bed_z: { type: "number", description: "Nueva cama Z en mm (opcional)." },
          nozzle_diameter: {
            type: "number",
            description: "Nueva boquilla en mm (opcional).",
          },
          cost_per_hour: {
            type: "number",
            description: "Nuevo costo por hora (opcional).",
          },
          notes: { type: "string", description: "Nuevas notas (opcional)." },
        },
        required: ["code"],
      },
    },
  },
];

export const TOOL_LABELS: Record<string, string> = {
  create_order: "Creando pedido",
  update_order_status: "Actualizando estado del pedido",
  create_batch: "Creando lote",
  update_batch_status: "Actualizando estado del lote",
  mark_batch_failed: "Marcando lote como fallido",
  consume_filament: "Registrando consumo de filamento",
  create_filament: "Creando carrete",
  create_printer_profile: "Creando perfil de impresora",
  update_printer_profile: "Editando perfil de impresora",
};

export interface ToolExecutionResult {
  ok: boolean;
  summary: string;
}

function fail(summary: string): ToolExecutionResult {
  return { ok: false, summary };
}

function ok(summary: string): ToolExecutionResult {
  return { ok: true, summary };
}

function padCode(code: number): string {
  return `#${String(code).padStart(3, "0")}`;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function asInt(value: unknown): number | null {
  const parsed = asNumber(value);
  return parsed !== null && Number.isInteger(parsed) ? parsed : null;
}

function asDate(value: unknown): string | null {
  const text = asString(value);
  return text && /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : null;
}

function asOrderStatus(value: unknown): OrderStatus | null {
  return ORDER_STATUSES.includes(value as OrderStatus)
    ? (value as OrderStatus)
    : null;
}

function asBatchStatus(value: unknown): BatchStatus | null {
  return BATCH_STATUSES.includes(value as BatchStatus)
    ? (value as BatchStatus)
    : null;
}

function asPrinterStatus(value: unknown): PrinterStatus | null {
  return PRINTER_STATUSES.includes(value as PrinterStatus)
    ? (value as PrinterStatus)
    : null;
}

async function resolveOrderId(code: number): Promise<string | null> {
  const orders = await getOrders();
  return orders.find((order) => order.code === code)?.id ?? null;
}

async function resolveBatchId(code: number): Promise<string | null> {
  const data = await getProductionData();
  return data.batches.find((batch) => batch.code === code)?.id ?? null;
}

async function resolveFilamentId(code: number): Promise<string | null> {
  const filaments = await getFilaments();
  return filaments.find((filament) => filament.code === code)?.id ?? null;
}

async function resolvePrinter(code: number): Promise<PrinterProfile | null> {
  const printers = await getPrinterProfiles();
  return printers.find((printer) => printer.code === code) ?? null;
}

async function runCreateOrder(args: Record<string, unknown>): Promise<ToolExecutionResult> {
  const customer = asString(args.customer);
  const modelName = asString(args.model_name);
  const quantity = asInt(args.quantity);
  const unitPrice = asNumber(args.unit_price);

  if (!customer || !modelName || quantity === null || unitPrice === null) {
    return fail("Faltan datos: cliente, modelo, cantidad y precio por unidad.");
  }

  const status = asOrderStatus(args.status) ?? "cotizado";

  const result = await createOrder({
    customer,
    modelName,
    filamentColor: asString(args.filament_color),
    quantity,
    unitPrice,
    deliveryDate: asDate(args.delivery_date),
    status,
    notes: asString(args.notes),
  });

  if (!result.success) {
    return fail(result.error);
  }

  return ok(
    `Pedido creado para ${customer} (${modelName} x${quantity}) en estado ${ORDER_STATUS_LABELS[status]}.`,
  );
}

async function runUpdateOrderStatus(
  args: Record<string, unknown>,
): Promise<ToolExecutionResult> {
  const code = asInt(args.code);
  const status = asOrderStatus(args.status);

  if (code === null || status === null) {
    return fail("Indica el código del pedido y un estado válido.");
  }

  const id = await resolveOrderId(code);

  if (!id) {
    return fail(`No se encontró el pedido ${padCode(code)}.`);
  }

  const result = await updateOrderStatus(id, status);

  if (!result.success) {
    return fail(result.error);
  }

  return ok(`El pedido ${padCode(code)} ahora está en estado ${ORDER_STATUS_LABELS[status]}.`);
}

async function runCreateBatch(
  args: Record<string, unknown>,
): Promise<ToolExecutionResult> {
  const copies = asInt(args.copies);

  if (copies === null || copies <= 0) {
    return fail("Indica cuántas copias tendrá el lote.");
  }

  const modelCode = asInt(args.model_code);
  const printerCode = asInt(args.printer_code);
  const filamentCode = asInt(args.filament_code);

  let model: ProductionModelOption | null = null;
  let printer: PrinterProfile | null = null;
  let filamentId: string | null = null;

  if (modelCode !== null) {
    const options = await getModelOptions();
    model = options.find((option) => option.code === modelCode) ?? null;

    if (!model) {
      return fail(`No se encontró el modelo ${padCode(modelCode)}.`);
    }
  }

  if (printerCode !== null) {
    printer = await resolvePrinter(printerCode);

    if (!printer) {
      return fail(`No se encontró el perfil de impresora ${padCode(printerCode)}.`);
    }
  }

  if (filamentCode !== null) {
    filamentId = await resolveFilamentId(filamentCode);

    if (!filamentId) {
      return fail(`No se encontró el carrete ${padCode(filamentCode)}.`);
    }
  }

  const units =
    asInt(args.units_per_bed) ??
    (model && printer
      ? unitsPerBed(
          model.dimensions,
          printer.bedX,
          printer.bedY,
          printer.bedZ,
        )
      : null);

  if (units === null || units <= 0) {
    return fail(
      "No pude calcular las piezas por cama. Indica units_per_bed o proporciona el modelo y la impresora.",
    );
  }

  const grams = asNumber(args.grams_per_unit) ?? (model ? gramsPerUnit(model) : 0);
  const minutes =
    asNumber(args.minutes_per_bed) ?? model?.estimatedMinutes ?? 0;
  const status = asBatchStatus(args.status) ?? "en_cola";

  const result = await createBatch({
    printerId: printer?.id ?? null,
    modelId: model?.id ?? null,
    filamentId,
    copies,
    unitsPerBed: units,
    material: asString(args.material) ?? model?.material ?? null,
    gramsPerUnit: grams ?? 0,
    minutesPerBed: minutes,
    status,
    notes: asString(args.notes),
  });

  if (!result.success) {
    return fail(result.error);
  }

  return ok(
    `Lote creado: ${copies} copias${model ? ` de ${model.name}` : ""} (${units} por cama) en estado ${BATCH_STATUS_LABELS[status]}.`,
  );
}

async function runUpdateBatchStatus(
  args: Record<string, unknown>,
): Promise<ToolExecutionResult> {
  const code = asInt(args.code);
  const status = asBatchStatus(args.status);

  if (code === null || status === null) {
    return fail("Indica el código del lote y un estado válido.");
  }

  const id = await resolveBatchId(code);

  if (!id) {
    return fail(`No se encontró el lote ${padCode(code)}.`);
  }

  const result = await updateBatchStatus(id, status);

  if (!result.success) {
    return fail(result.error);
  }

  return ok(`El lote ${padCode(code)} ahora está en estado ${BATCH_STATUS_LABELS[status]}.`);
}

async function runMarkBatchFailed(
  args: Record<string, unknown>,
): Promise<ToolExecutionResult> {
  const code = asInt(args.code);
  const wasteGrams = asNumber(args.waste_grams);

  if (code === null || wasteGrams === null) {
    return fail("Indica el código del lote y los gramos de merma.");
  }

  const id = await resolveBatchId(code);

  if (!id) {
    return fail(`No se encontró el lote ${padCode(code)}.`);
  }

  const result = await markBatchFailed(id, wasteGrams, asString(args.reason));

  if (!result.success) {
    return fail(result.error);
  }

  return ok(`Lote ${padCode(code)} marcado como fallido (merma: ${wasteGrams} g).`);
}

async function runConsumeFilament(
  args: Record<string, unknown>,
): Promise<ToolExecutionResult> {
  const code = asInt(args.code);
  const grams = asNumber(args.grams);

  if (code === null || grams === null) {
    return fail("Indica el código del carrete y los gramos a consumir.");
  }

  const id = await resolveFilamentId(code);

  if (!id) {
    return fail(`No se encontró el carrete ${padCode(code)}.`);
  }

  const result = await consumeFilament(id, grams);

  if (!result.success) {
    return fail(result.error);
  }

  return ok(`Consumo de ${grams} g registrado en el carrete ${padCode(code)}.`);
}

async function runCreateFilament(
  args: Record<string, unknown>,
): Promise<ToolExecutionResult> {
  const material = asString(args.material);
  const color = asString(args.color);
  const brand = asString(args.brand);
  const weightCurrentG = asNumber(args.weight_current_g);
  const minStockG = asNumber(args.min_stock_g);

  if (
    !material ||
    !color ||
    !brand ||
    weightCurrentG === null ||
    minStockG === null
  ) {
    return fail(
      "Faltan datos: material, color, marca, gramos actuales y mínimo de stock.",
    );
  }

  const result = await createFilament({
    material,
    color,
    brand,
    weightCurrentG,
    weightInitialG: asNumber(args.weight_initial_g),
    location: asString(args.location),
    minStockG,
    pricePerKg: asNumber(args.price_per_kg),
  });

  if (!result.success) {
    return fail(result.error);
  }

  return ok(`Carrete creado: ${material} ${color} (${brand}), ${weightCurrentG} g.`);
}

async function runCreatePrinterProfile(
  args: Record<string, unknown>,
): Promise<ToolExecutionResult> {
  const name = asString(args.name);

  if (!name) {
    return fail("Indica el nombre del perfil de impresora.");
  }

  const result = await createPrinterProfile({
    name,
    status: asPrinterStatus(args.status) ?? "disponible",
    bedX: asNumber(args.bed_x),
    bedY: asNumber(args.bed_y),
    bedZ: asNumber(args.bed_z),
    nozzleDiameter: asNumber(args.nozzle_diameter) ?? 0.4,
    costPerHour: asNumber(args.cost_per_hour) ?? 0,
    notes: asString(args.notes),
  });

  if (!result.success) {
    return fail(result.error);
  }

  return ok(`Perfil de impresora "${name}" creado.`);
}

async function runUpdatePrinterProfile(
  args: Record<string, unknown>,
): Promise<ToolExecutionResult> {
  const code = asInt(args.code);

  if (code === null) {
    return fail("Indica el código del perfil de impresora.");
  }

  const current = await resolvePrinter(code);

  if (!current) {
    return fail(`No se encontró el perfil ${padCode(code)}.`);
  }

  const result = await updatePrinterProfile(current.id, {
    name: asString(args.name) ?? current.name,
    status: asPrinterStatus(args.status) ?? current.status,
    bedX: asNumber(args.bed_x) ?? current.bedX,
    bedY: asNumber(args.bed_y) ?? current.bedY,
    bedZ: asNumber(args.bed_z) ?? current.bedZ,
    nozzleDiameter: asNumber(args.nozzle_diameter) ?? current.nozzleDiameter,
    costPerHour: asNumber(args.cost_per_hour) ?? current.costPerHour,
    notes: asString(args.notes) ?? current.notes,
  });

  if (!result.success) {
    return fail(result.error);
  }

  return ok(`Perfil ${padCode(code)} actualizado.`);
}

export async function executeAssistantTool(
  name: string,
  rawArguments: string,
): Promise<ToolExecutionResult> {
  let args: Record<string, unknown>;

  try {
    const parsed = JSON.parse(rawArguments === "" ? "{}" : rawArguments);
    args =
      typeof parsed === "object" && parsed !== null
        ? (parsed as Record<string, unknown>)
        : {};
  } catch {
    return fail("No pude interpretar los argumentos de la acción.");
  }

  switch (name) {
    case "create_order":
      return runCreateOrder(args);
    case "update_order_status":
      return runUpdateOrderStatus(args);
    case "create_batch":
      return runCreateBatch(args);
    case "update_batch_status":
      return runUpdateBatchStatus(args);
    case "mark_batch_failed":
      return runMarkBatchFailed(args);
    case "consume_filament":
      return runConsumeFilament(args);
    case "create_filament":
      return runCreateFilament(args);
    case "create_printer_profile":
      return runCreatePrinterProfile(args);
    case "update_printer_profile":
      return runUpdatePrinterProfile(args);
    default:
      return fail(`La acción "${name}" no está disponible.`);
  }
}
