import { ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/lib/order-utils";
import { BATCH_STATUS_LABELS } from "@/lib/production-utils";
import type { Order, OrderStatus } from "@/types/orders";
import type { BatchStatus, ProductionBatch } from "@/types/production";
import type {
  MaterialUsage,
  MonthlyRevenuePoint,
  ReportData,
  ReportDataset,
  ReportKpis,
  ReportRange,
  StatusSlice,
  TopCustomer,
  TopModel,
  WasteBatch,
} from "@/types/reports";

export const REPORT_RANGES: ReportRange[] = ["mes", "30d", "90d", "anio", "todo"];

export const REPORT_RANGE_LABELS: Record<ReportRange, string> = {
  mes: "Mes actual",
  "30d": "30 días",
  "90d": "90 días",
  anio: "Este año",
  todo: "Todo",
};

export const REPORT_DATASETS: ReportDataset[] = [
  "pedidos",
  "lotes",
  "resumen",
];

export interface ResolvedReportRange {
  from: Date | null;
  to: Date;
  label: string;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function startOfDay(value: Date): Date {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const monthYearFormatter = new Intl.DateTimeFormat("es-MX", {
  month: "long",
  year: "numeric",
});

const shortMonthFormatter = new Intl.DateTimeFormat("es-MX", {
  month: "short",
  year: "2-digit",
});

export function parseReportRange(
  value: string | string[] | null | undefined,
): ReportRange {
  const raw = Array.isArray(value) ? value[0] : value;
  return REPORT_RANGES.includes(raw as ReportRange)
    ? (raw as ReportRange)
    : "mes";
}

export function parseReportDataset(
  value: string | string[] | null | undefined,
): ReportDataset {
  const raw = Array.isArray(value) ? value[0] : value;
  return REPORT_DATASETS.includes(raw as ReportDataset)
    ? (raw as ReportDataset)
    : "resumen";
}

export function resolveReportRange(
  range: ReportRange,
  now = new Date(),
): ResolvedReportRange {
  switch (range) {
    case "30d": {
      const from = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 29,
      );
      return { from, to: now, label: "Últimos 30 días" };
    }
    case "90d": {
      const from = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 89,
      );
      return { from, to: now, label: "Últimos 90 días" };
    }
    case "anio": {
      const from = new Date(now.getFullYear(), 0, 1);
      return { from, to: now, label: `Año ${now.getFullYear()}` };
    }
    case "todo":
      return { from: null, to: now, label: "Todo el historial" };
    case "mes":
    default: {
      const from = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
      return {
        from,
        to: now,
        label: capitalize(monthYearFormatter.format(now)),
      };
    }
  }
}

export function isWithin(
  iso: string | null | undefined,
  from: Date | null,
  to: Date,
): boolean {
  if (!iso) {
    return false;
  }

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return (!from || date >= from) && date <= to;
}

export function isFinishedBatch(status: BatchStatus): boolean {
  return status === "completado" || status === "fallido";
}

export function batchFinishedAt(batch: ProductionBatch): string {
  return batch.finishedAt ?? batch.updatedAt;
}

export function consumedGramsForBatch(batch: ProductionBatch): number {
  if (batch.status === "fallido") {
    return round1(batch.wasteGrams);
  }

  if (batch.status === "completado") {
    const computed = batch.copies * batch.gramsPerUnit;
    return round1(computed > 0 ? computed : batch.appliedGrams);
  }

  return 0;
}

export interface ReportBatchCost {
  materialCost: number | null;
  machineCost: number;
  totalCost: number;
  consumedGrams: number;
  missingMaterialPrice: boolean;
}

export function computeBatchReportCost(
  batch: ProductionBatch,
  pricePerKg: number | null,
  costPerHour: number,
): ReportBatchCost {
  const grams = consumedGramsForBatch(batch);
  const hours = (batch.beds * batch.minutesPerBed) / 60;
  const machineCost = round2(hours * Math.max(costPerHour, 0));

  if (grams > 0 && (pricePerKg === null || !Number.isFinite(pricePerKg))) {
    return {
      materialCost: null,
      machineCost,
      totalCost: machineCost,
      consumedGrams: grams,
      missingMaterialPrice: true,
    };
  }

  const materialCost =
    grams > 0 && pricePerKg !== null
      ? round2((grams / 1000) * pricePerKg)
      : 0;

  return {
    materialCost,
    machineCost,
    totalCost: round2(materialCost + machineCost),
    consumedGrams: grams,
    missingMaterialPrice: false,
  };
}

export function computeReportKpis(
  orders: Order[],
  batches: ProductionBatch[],
  range: ResolvedReportRange,
  priceByFilamentId: Map<string, number | null>,
  costPerHourByPrinterId: Map<string, number>,
): ReportKpis {
  const delivered = orders.filter(
    (order) =>
      order.status === "entregado" &&
      isWithin(order.deliveredAt, range.from, range.to),
  );
  const active = orders.filter(
    (order) =>
      order.status !== "entregado" &&
      isWithin(order.createdAt, range.from, range.to),
  );

  const revenue = round2(
    delivered.reduce((sum, order) => sum + order.total, 0),
  );
  const pipeline = round2(
    active.reduce((sum, order) => sum + order.total, 0),
  );

  let productionCost = 0;
  let consumedGrams = 0;
  let printerHours = 0;
  let wasteGrams = 0;
  let completedBatches = 0;
  let failedBatches = 0;
  let batchesWithoutCost = 0;

  for (const batch of batches) {
    if (
      !isFinishedBatch(batch.status) ||
      !isWithin(batchFinishedAt(batch), range.from, range.to)
    ) {
      continue;
    }

    if (batch.status === "completado") {
      completedBatches += 1;
    } else {
      failedBatches += 1;
    }

    const pricePerKg = batch.filamentId
      ? (priceByFilamentId.get(batch.filamentId) ?? null)
      : null;
    const costPerHour = batch.printerId
      ? (costPerHourByPrinterId.get(batch.printerId) ?? 0)
      : 0;
    const cost = computeBatchReportCost(batch, pricePerKg, costPerHour);

    productionCost += cost.totalCost;
    consumedGrams += cost.consumedGrams;
    printerHours += (batch.beds * batch.minutesPerBed) / 60;

    if (cost.missingMaterialPrice) {
      batchesWithoutCost += 1;
    }

    if (batch.status === "fallido") {
      wasteGrams += batch.wasteGrams;
    }
  }

  productionCost = round2(productionCost);
  consumedGrams = round1(consumedGrams);
  printerHours = round1(printerHours);
  wasteGrams = round1(wasteGrams);

  const finishedBatches = completedBatches + failedBatches;
  const grossMargin = round2(revenue - productionCost);

  return {
    revenue,
    pipeline,
    deliveredOrders: delivered.length,
    averageTicket:
      delivered.length > 0 ? round2(revenue / delivered.length) : 0,
    productionCost,
    grossMargin,
    marginPercent:
      revenue > 0 ? round1((grossMargin / revenue) * 100) : 0,
    consumedGrams,
    printerHours,
    successRate:
      finishedBatches > 0
        ? round1((completedBatches / finishedBatches) * 100)
        : 0,
    wasteGrams,
    finishedBatches,
    completedBatches,
    failedBatches,
    batchesWithoutCost,
  };
}

interface MonthBucket {
  month: string;
  label: string;
  start: Date;
  end: Date;
}

function buildMonthBuckets(range: ResolvedReportRange): MonthBucket[] {
  const lastMonth = new Date(range.to.getFullYear(), range.to.getMonth(), 1);
  const earliest = new Date(
    lastMonth.getFullYear(),
    lastMonth.getMonth() - 11,
    1,
  );
  let firstMonth = range.from
    ? new Date(range.from.getFullYear(), range.from.getMonth(), 1)
    : new Date(lastMonth.getFullYear(), lastMonth.getMonth() - 5, 1);

  if (firstMonth < earliest) {
    firstMonth = earliest;
  }

  const buckets: MonthBucket[] = [];

  for (
    let cursor = firstMonth;
    cursor <= lastMonth;
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)
  ) {
    const end = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    buckets.push({
      month: `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`,
      label: shortMonthFormatter.format(cursor).replace(/\./g, ""),
      start: cursor,
      end,
    });
  }

  return buckets;
}

export function buildMonthlyRevenue(
  orders: Order[],
  range: ResolvedReportRange,
): MonthlyRevenuePoint[] {
  const buckets = buildMonthBuckets(range);
  const points = buckets.map<MonthlyRevenuePoint>((bucket) => ({
    month: bucket.month,
    label: bucket.label,
    revenue: 0,
  }));

  for (const order of orders) {
    if (
      order.status !== "entregado" ||
      !isWithin(order.deliveredAt, range.from, range.to)
    ) {
      continue;
    }

    const deliveredAt = new Date(order.deliveredAt as string);
    const index = buckets.findIndex(
      (bucket) => deliveredAt >= bucket.start && deliveredAt < bucket.end,
    );

    if (index >= 0) {
      points[index].revenue = round2(points[index].revenue + order.total);
    }
  }

  return points;
}

export function groupOrdersByStatus(
  orders: Order[],
  range: ResolvedReportRange,
): StatusSlice[] {
  const inRange = orders.filter((order) =>
    isWithin(order.createdAt, range.from, range.to),
  );

  return ORDER_STATUSES.map((status) => ({
    status,
    label: ORDER_STATUS_LABELS[status],
    count: inRange.filter((order) => order.status === status).length,
  }));
}

export function aggregateMaterialUsage(
  batches: ProductionBatch[],
  range: ResolvedReportRange,
): MaterialUsage[] {
  const usage = new Map<string, number>();

  for (const batch of batches) {
    if (
      !isFinishedBatch(batch.status) ||
      !isWithin(batchFinishedAt(batch), range.from, range.to)
    ) {
      continue;
    }

    const material = batch.material?.trim() || "Sin material";
    const grams = consumedGramsForBatch(batch);

    if (grams <= 0) {
      continue;
    }

    usage.set(material, round1((usage.get(material) ?? 0) + grams));
  }

  return Array.from(usage, ([material, grams]) => ({ material, grams })).sort(
    (a, b) => b.grams - a.grams,
  );
}

export function aggregateTopCustomers(
  orders: Order[],
  range: ResolvedReportRange,
): TopCustomer[] {
  const customers = new Map<string, TopCustomer>();

  for (const order of orders) {
    if (
      order.status !== "entregado" ||
      !isWithin(order.deliveredAt, range.from, range.to)
    ) {
      continue;
    }

    const customer = order.customer.trim();
    const key = customer.toLocaleLowerCase("es-MX");
    const current = customers.get(key);

    if (current) {
      current.orders += 1;
      current.revenue = round2(current.revenue + order.total);
      if (
        order.deliveredAt &&
        (!current.lastDelivery || order.deliveredAt > current.lastDelivery)
      ) {
        current.lastDelivery = order.deliveredAt;
      }
    } else {
      customers.set(key, {
        customer,
        orders: 1,
        revenue: round2(order.total),
        lastDelivery: order.deliveredAt,
      });
    }
  }

  return Array.from(customers.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
}

export function aggregateTopModels(
  orders: Order[],
  range: ResolvedReportRange,
): TopModel[] {
  const models = new Map<string, TopModel>();

  for (const order of orders) {
    if (
      order.status !== "entregado" ||
      !isWithin(order.deliveredAt, range.from, range.to)
    ) {
      continue;
    }

    const modelName = order.modelName.trim();
    const key = modelName.toLocaleLowerCase("es-MX");
    const current = models.get(key);

    if (current) {
      current.units += order.quantity;
      current.revenue = round2(current.revenue + order.total);
    } else {
      models.set(key, {
        modelName,
        units: order.quantity,
        revenue: round2(order.total),
      });
    }
  }

  return Array.from(models.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
}

export function collectWasteBatches(
  batches: ProductionBatch[],
  range: ResolvedReportRange,
): WasteBatch[] {
  return batches
    .filter(
      (batch) =>
        batch.status === "fallido" &&
        batch.wasteGrams > 0 &&
        isWithin(batchFinishedAt(batch), range.from, range.to),
    )
    .sort((a, b) => b.wasteGrams - a.wasteGrams)
    .slice(0, 5)
    .map((batch) => ({
      id: batch.id,
      code: batch.code,
      modelName: batch.modelName,
      wasteGrams: batch.wasteGrams,
      reason: batch.wasteReason,
      finishedAt: batch.finishedAt,
    }));
}

const numberFormatter = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 0,
});

const decimalFormatter = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 1,
});

const compactCurrencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatReportNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatCompactCurrency(value: number): string {
  return compactCurrencyFormatter.format(value);
}

export function formatReportDecimal(value: number): string {
  return decimalFormatter.format(value);
}

export function formatPercent(value: number): string {
  return `${decimalFormatter.format(value)}%`;
}

export function formatGrams(value: number): string {
  return `${numberFormatter.format(value)} g`;
}

const reportDateFormatter = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function formatReportDate(iso: string | null | undefined): string {
  if (!iso) {
    return "—";
  }

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return reportDateFormatter.format(date);
}

export function formatBatchStatus(status: string): string {
  return BATCH_STATUS_LABELS[status as BatchStatus] ?? status;
}

export function formatOrderStatus(status: string): string {
  return ORDER_STATUS_LABELS[status as OrderStatus] ?? status;
}

function csvDate(iso: string | null | undefined): string {
  if (!iso) {
    return "";
  }

  return iso.slice(0, 10);
}

type CsvValue = string | number | null | undefined;

function escapeCsvCell(value: CsvValue): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "number") {
    return String(value);
  }

  let text = value;

  // Evita inyección de fórmulas al abrir el CSV en Excel.
  if (/^[=+\-@]/.test(text)) {
    text = `'${text}`;
  }

  if (/[",\r\n;]/.test(text)) {
    text = `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

export function toCsv(headers: string[], rows: CsvValue[][]): string {
  const lines = [headers, ...rows].map((row) =>
    row.map(escapeCsvCell).join(","),
  );

  return `\uFEFF${lines.join("\r\n")}`;
}

export function ordersToCsv(orders: Order[]): string {
  const headers = [
    "Código",
    "Cliente",
    "Modelo",
    "Color",
    "Cantidad",
    "Precio unitario",
    "Total",
    "Estado",
    "Fecha de entrega",
    "Entregado",
    "Creado",
  ];

  const rows = orders.map((order) => [
    order.code,
    order.customer,
    order.modelName,
    order.filamentColor,
    order.quantity,
    order.unitPrice,
    order.total,
    formatOrderStatus(order.status),
    order.deliveryDate,
    csvDate(order.deliveredAt),
    csvDate(order.createdAt),
  ]);

  return toCsv(headers, rows);
}

export function batchesToCsv(batches: ProductionBatch[]): string {
  const headers = [
    "Código",
    "Modelo",
    "Impresora",
    "Material",
    "Copias",
    "Gramos por unidad",
    "Camas",
    "Minutos por cama",
    "Estado",
    "Gramos aplicados",
    "Merma",
    "Motivo de merma",
    "Finalizado",
    "Creado",
  ];

  const rows = batches.map((batch) => [
    batch.code,
    batch.modelName,
    batch.printerName,
    batch.material,
    batch.copies,
    batch.gramsPerUnit,
    batch.beds,
    batch.minutesPerBed,
    formatBatchStatus(batch.status),
    batch.appliedGrams,
    batch.wasteGrams,
    batch.wasteReason,
    csvDate(batch.finishedAt),
    csvDate(batch.createdAt),
  ]);

  return toCsv(headers, rows);
}

export function summaryToCsv(data: ReportData): string {
  const { kpis } = data;

  return toCsv(
    ["Métrica", "Valor"],
    [
      ["Periodo", data.label],
      ["Desde", data.from ? csvDate(data.from) : "Todo el historial"],
      ["Hasta", csvDate(data.to)],
      ["Ingresos entregados", kpis.revenue],
      ["Pipeline activo", kpis.pipeline],
      ["Pedidos entregados", kpis.deliveredOrders],
      ["Ticket promedio", kpis.averageTicket],
      ["Costo de producción", kpis.productionCost],
      ["Margen bruto", kpis.grossMargin],
      ["Margen %", kpis.marginPercent],
      ["Gramos consumidos", kpis.consumedGrams],
      ["Horas de impresora", kpis.printerHours],
      ["Tasa de éxito %", kpis.successRate],
      ["Merma en gramos", kpis.wasteGrams],
      ["Lotes finalizados", kpis.finishedBatches],
      ["Lotes sin costo de material", kpis.batchesWithoutCost],
    ],
  );
}
