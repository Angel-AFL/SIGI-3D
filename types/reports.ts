import type { OrderStatus } from "@/types/dashboard";

export type ReportRange = "mes" | "30d" | "90d" | "anio" | "todo";

export type ReportDataset = "pedidos" | "lotes" | "resumen";

export interface ReportKpis {
  revenue: number;
  pipeline: number;
  deliveredOrders: number;
  averageTicket: number;
  productionCost: number;
  grossMargin: number;
  marginPercent: number;
  consumedGrams: number;
  printerHours: number;
  successRate: number;
  wasteGrams: number;
  finishedBatches: number;
  completedBatches: number;
  failedBatches: number;
  batchesWithoutCost: number;
}

export interface MonthlyRevenuePoint {
  month: string;
  label: string;
  revenue: number;
}

export interface StatusSlice {
  status: OrderStatus;
  label: string;
  count: number;
}

export interface MaterialUsage {
  material: string;
  grams: number;
}

export interface TopCustomer {
  customer: string;
  orders: number;
  revenue: number;
  lastDelivery: string | null;
}

export interface TopModel {
  modelName: string;
  units: number;
  revenue: number;
}

export interface WasteBatch {
  id: string;
  code: number;
  modelName: string | null;
  wasteGrams: number;
  reason: string | null;
  finishedAt: string | null;
}

export interface ReportData {
  range: ReportRange;
  label: string;
  from: string | null;
  to: string;
  kpis: ReportKpis;
  monthlyRevenue: MonthlyRevenuePoint[];
  ordersByStatus: StatusSlice[];
  materialUsage: MaterialUsage[];
  topCustomers: TopCustomer[];
  topModels: TopModel[];
  wasteBatches: WasteBatch[];
}
