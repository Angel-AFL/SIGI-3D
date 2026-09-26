import type { OrderStatus } from "@/types/dashboard";
import type { BatchStatus } from "@/types/production";

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
  stats: AssistantStats;
}
