import type { Order, OrderStatus } from "@/types/orders";

export const ORDER_STATUSES: OrderStatus[] = [
  "cotizado",
  "imprimiendo",
  "entregado",
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  cotizado: "Cotizado",
  imprimiendo: "En impresión",
  entregado: "Entregado",
};

export const ORDER_STATUS_COLUMNS: OrderStatus[] = ORDER_STATUSES;

export function getOrderStatusLabel(status: OrderStatus): string {
  return ORDER_STATUS_LABELS[status];
}

export function isActiveOrder(order: Pick<Order, "status">): boolean {
  return order.status !== "entregado";
}

export function isPendingDelivery(
  order: Pick<Order, "status" | "deliveryDate">,
): boolean {
  return isActiveOrder(order) && order.deliveryDate !== null;
}

const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function computeTotal(unitPrice: number, quantity: number): number {
  return Math.round(unitPrice * quantity * 100) / 100;
}

const dateFormatter = new Intl.DateTimeFormat("es", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function formatOrderDate(isoDate: string | null): string {
  if (!isoDate) {
    return "Sin fecha";
  }

  return dateFormatter.format(new Date(`${isoDate}T00:00:00`));
}

export function formatOrderCode(code: number): string {
  return `#${String(code).padStart(3, "0")}`;
}
