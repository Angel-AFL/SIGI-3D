import type { OrderStatus } from "@/types/dashboard";
import type { BatchStatus, PrinterStatus } from "@/types/production";

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface AssistantOrderSummary {
  code: number;
  customer: string;
  modelName: string;
  quantity: number;
  total: number;
  deliveryDate: string | null;
}

export interface AssistantBatchSummary {
  code: number;
  modelName: string | null;
  printerName: string | null;
  copies: number;
  material: string | null;
  beds: number;
  minutesPerBed: number;
}

export interface AssistantModelSummary {
  code: number;
  name: string;
  material: string;
  estimatedMinutes: number | null;
  weightGrams: number | null;
}

export interface AssistantFilamentSummary {
  code: number;
  material: string;
  color: string;
  brand: string;
  weightCurrentG: number;
  pricePerKg: number | null;
}

export interface AssistantPrinterSummary {
  code: number;
  name: string;
  status: PrinterStatus;
  bedX: number | null;
  bedY: number | null;
  bedZ: number | null;
  nozzleDiameter: number;
  costPerHour: number;
}

export interface AssistantStats {
  pedidosActivos: number;
  entregasPendientes: number;
  lotesEnCola: number;
  lotesImprimiendo: number;
  modelosTotales: number;
  filamentosTotales: number;
  alertasStock: number;
  gramosRequeridos: number;
  costoEstimado: number;
}

export interface AssistantContext {
  generatedAt: string;
  orders: Record<OrderStatus, AssistantOrderSummary[]>;
  batches: Record<BatchStatus, AssistantBatchSummary[]>;
  models: AssistantModelSummary[];
  filaments: AssistantFilamentSummary[];
  printers: AssistantPrinterSummary[];
  stats: AssistantStats;
}

export type AssistantStreamEvent =
  | { type: "text"; value: string }
  | {
      type: "tool";
      name: string;
      label: string;
      status: "running" | "ok" | "error";
      summary?: string;
    }
  | { type: "done" }
  | { type: "error"; message: string };
