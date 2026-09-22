import type { OrderStatus } from "@/types/dashboard";

export type { OrderStatus };

export interface Order {
  id: string;
  code: number;
  customer: string;
  modelName: string;
  filamentColor: string | null;
  quantity: number;
  unitPrice: number;
  total: number;
  deliveryDate: string | null;
  status: OrderStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderInput {
  customer: string;
  modelName: string;
  filamentColor: string | null;
  quantity: number;
  unitPrice: number;
  deliveryDate: string | null;
  status: OrderStatus;
  notes: string | null;
}

export interface OrderStats {
  active: number;
  pendingDeliveries: number;
}

export type OrderActionResult =
  | { success: true }
  | { success: false; error: string };
