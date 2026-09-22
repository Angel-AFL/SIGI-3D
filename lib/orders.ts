import "server-only";

import { requireUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ORDER_STATUSES } from "@/lib/order-utils";
import type { Database } from "@/types/database";
import type { Order, OrderStatus } from "@/types/orders";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];

function toOrderStatus(value: string): OrderStatus {
  return ORDER_STATUSES.includes(value as OrderStatus)
    ? (value as OrderStatus)
    : "cotizado";
}

export function mapOrder(row: OrderRow): Order {
  return {
    id: row.id,
    code: row.code,
    customer: row.customer,
    modelName: row.model_name,
    filamentColor: row.filament_color,
    quantity: row.quantity,
    unitPrice: row.unit_price,
    total: row.total,
    deliveryDate: row.delivery_date,
    status: toOrderStatus(row.status),
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getOrders(): Promise<Order[]> {
  const user = await requireUser();
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("code", { ascending: true });

  if (error) {
    throw new Error(`No se pudieron cargar los pedidos: ${error.message}`);
  }

  return data.map(mapOrder);
}
