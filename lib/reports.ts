import "server-only";

import { getOrders } from "@/lib/orders";
import { getProductionData } from "@/lib/production";
import {
  aggregateMaterialUsage,
  aggregateTopCustomers,
  aggregateTopModels,
  batchesToCsv,
  buildMonthlyRevenue,
  collectWasteBatches,
  computeReportKpis,
  groupOrdersByStatus,
  isWithin,
  ordersToCsv,
  resolveReportRange,
  summaryToCsv,
  type ResolvedReportRange,
} from "@/lib/report-utils";
import type { Order } from "@/types/orders";
import type { ProductionBatch, ProductionData } from "@/types/production";
import type { ReportData, ReportDataset, ReportRange } from "@/types/reports";

interface ReportSources {
  orders: Order[];
  production: ProductionData;
  resolved: ResolvedReportRange;
}

async function loadSources(range: ReportRange): Promise<ReportSources> {
  const resolved = resolveReportRange(range);
  const [orders, production] = await Promise.all([
    getOrders(),
    getProductionData(),
  ]);

  return { orders, production, resolved };
}

function buildReportData(
  sources: ReportSources,
  range: ReportRange,
): ReportData {
  const { orders, production, resolved } = sources;
  const priceByFilamentId = new Map(
    production.filamentOptions.map((filament) => [
      filament.id,
      filament.pricePerKg,
    ]),
  );
  const costPerHourByPrinterId = new Map(
    production.printers.map((printer) => [printer.id, printer.costPerHour]),
  );

  return {
    range,
    label: resolved.label,
    from: resolved.from?.toISOString() ?? null,
    to: resolved.to.toISOString(),
    kpis: computeReportKpis(
      orders,
      production.batches,
      resolved,
      priceByFilamentId,
      costPerHourByPrinterId,
    ),
    monthlyRevenue: buildMonthlyRevenue(orders, resolved),
    ordersByStatus: groupOrdersByStatus(orders, resolved),
    materialUsage: aggregateMaterialUsage(production.batches, resolved),
    topCustomers: aggregateTopCustomers(orders, resolved),
    topModels: aggregateTopModels(orders, resolved),
    wasteBatches: collectWasteBatches(production.batches, resolved),
  };
}

export async function getReportData(range: ReportRange): Promise<ReportData> {
  const sources = await loadSources(range);
  return buildReportData(sources, range);
}

function ordersForExport(
  orders: Order[],
  resolved: ResolvedReportRange,
): Order[] {
  return orders
    .filter(
      (order) =>
        isWithin(order.createdAt, resolved.from, resolved.to) ||
        isWithin(order.deliveredAt, resolved.from, resolved.to),
    )
    .sort((a, b) => a.code - b.code);
}

function batchesForExport(
  batches: ProductionBatch[],
  resolved: ResolvedReportRange,
): ProductionBatch[] {
  return batches
    .filter(
      (batch) =>
        isWithin(batch.createdAt, resolved.from, resolved.to) ||
        isWithin(
          batch.finishedAt ?? batch.updatedAt,
          resolved.from,
          resolved.to,
        ),
    )
    .sort((a, b) => a.code - b.code);
}

export interface ReportCsv {
  filename: string;
  csv: string;
}

export async function getReportCsv(
  dataset: ReportDataset,
  range: ReportRange,
): Promise<ReportCsv> {
  const sources = await loadSources(range);
  const { resolved } = sources;
  const from = resolved.from
    ? resolved.from.toISOString().slice(0, 10)
    : "inicio";
  const to = resolved.to.toISOString().slice(0, 10);
  const filename = `sigi-reporte-${dataset}-${from}_${to}.csv`;

  if (dataset === "pedidos") {
    return {
      filename,
      csv: ordersToCsv(ordersForExport(sources.orders, resolved)),
    };
  }

  if (dataset === "lotes") {
    return {
      filename,
      csv: batchesToCsv(
        batchesForExport(sources.production.batches, resolved),
      ),
    };
  }

  return {
    filename,
    csv: summaryToCsv(buildReportData(sources, range)),
  };
}
