"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { computeTotal, ORDER_STATUSES } from "@/lib/order-utils";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  OrderActionResult,
  OrderInput,
  OrderStatus,
} from "@/types/orders";

type ValidatedInput = {
  customer: string;
  modelName: string;
  filamentColor: string | null;
  quantity: number;
  unitPrice: number;
  deliveryDate: string | null;
  status: OrderStatus;
  notes: string | null;
};

function toColumns(value: ValidatedInput) {
  return {
    customer: value.customer,
    model_name: value.modelName,
    filament_color: value.filamentColor,
    quantity: value.quantity,
    unit_price: value.unitPrice,
    total: computeTotal(value.unitPrice, value.quantity),
    delivery_date: value.deliveryDate,
    status: value.status,
    notes: value.notes,
  };
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

function toStatus(value: unknown): OrderStatus | null {
  return ORDER_STATUSES.includes(value as OrderStatus)
    ? (value as OrderStatus)
    : null;
}

function toDeliveryDate(value: unknown): string | null | false {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  return value;
}

function validateInput(
  input: OrderInput,
): { ok: true; value: ValidatedInput } | { ok: false; error: string } {
  const customer = input.customer?.trim();
  const modelName = input.modelName?.trim();
  const filamentColor = input.filamentColor?.trim()
    ? input.filamentColor.trim()
    : null;
  const notes = input.notes?.trim() ? input.notes.trim() : null;
  const quantity = toNumber(input.quantity);
  const unitPrice = toNumber(input.unitPrice);
  const status = toStatus(input.status);
  const deliveryDate = toDeliveryDate(input.deliveryDate);

  if (!customer || !modelName) {
    return { ok: false, error: "El cliente y el modelo son obligatorios." };
  }

  if (quantity === null || !Number.isInteger(quantity) || quantity <= 0) {
    return { ok: false, error: "La cantidad debe ser un entero mayor a 0." };
  }

  if (unitPrice === null || unitPrice < 0) {
    return {
      ok: false,
      error: "El precio por unidad debe ser un número mayor o igual a 0.",
    };
  }

  if (status === null) {
    return { ok: false, error: "El estado del pedido no es válido." };
  }

  if (deliveryDate === false) {
    return { ok: false, error: "La fecha de entrega no es válida." };
  }

  return {
    ok: true,
    value: {
      customer,
      modelName,
      filamentColor,
      quantity,
      unitPrice,
      deliveryDate,
      status,
      notes,
    },
  };
}

export async function createOrder(
  input: OrderInput,
): Promise<OrderActionResult> {
  const validation = validateInput(input);
  if (!validation.ok) {
    return { success: false, error: validation.error };
  }

  const user = await requireUser();
  const supabase = await createServerSupabaseClient();

  const { data: last } = await supabase
    .from("orders")
    .select("code")
    .eq("user_id", user.id)
    .order("code", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("orders").insert({
    user_id: user.id,
    code: (last?.code ?? 0) + 1,
    ...toColumns(validation.value),
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/pedidos");
  return { success: true };
}

export async function updateOrder(
  id: string,
  input: OrderInput,
): Promise<OrderActionResult> {
  const validation = validateInput(input);
  if (!validation.ok) {
    return { success: false, error: validation.error };
  }

  const user = await requireUser();
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("orders")
    .update({
      ...toColumns(validation.value),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/pedidos");
  return { success: true };
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<OrderActionResult> {
  const nextStatus = toStatus(status);

  if (nextStatus === null) {
    return { success: false, error: "El estado del pedido no es válido." };
  }

  const user = await requireUser();
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("orders")
    .update({ status: nextStatus, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/pedidos");
  return { success: true };
}

export async function deleteOrder(id: string): Promise<OrderActionResult> {
  const user = await requireUser();
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("orders")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/pedidos");
  return { success: true };
}
