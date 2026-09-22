"use client";

import {
  ClipboardList,
  PackageCheck,
  Printer,
  SquareCheck,
  type LucideIcon,
} from "lucide-react";
import { OrderNotes } from "@/components/orders/order-notes";
import { OrderStatusMenu } from "@/components/orders/order-status-menu";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  formatCurrency,
  formatOrderCode,
  formatOrderDate,
} from "@/lib/order-utils";
import type { Order, OrderStatus } from "@/types/orders";

interface OrderListProps {
  orders: Order[];
  onEdit: (order: Order) => void;
  onDelete: (order: Order) => void;
  onStatusChange: (order: Order, status: OrderStatus) => void;
}

const statusIcons: Record<OrderStatus, LucideIcon> = {
  cotizado: ClipboardList,
  imprimiendo: Printer,
  entregado: PackageCheck,
};

function OrderIcon({ status }: { status: OrderStatus }) {
  const Icon = statusIcons[status] ?? SquareCheck;

  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
      <Icon className="size-5" aria-hidden="true" />
    </span>
  );
}

export function OrderList({
  orders,
  onEdit,
  onDelete,
  onStatusChange,
}: OrderListProps) {
  return (
    <>
      <ul className="hidden flex-col gap-2 sm:flex">
        {orders.map((order) => (
          <li key={order.id}>
            <Card className="flex items-center gap-4 p-4">
              <OrderIcon status={order.status} />

              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate font-medium text-zinc-800 dark:text-zinc-100">
                  Pedido {formatOrderCode(order.code)} · Cliente:{" "}
                  {order.customer}
                </span>
                <span className="truncate text-sm text-zinc-500 dark:text-zinc-400">
                  {order.modelName}
                  {order.filamentColor ? ` · ${order.filamentColor}` : ""} ·{" "}
                  {order.quantity} ud.
                </span>
                <OrderNotes notes={order.notes} className="mt-0.5" />
              </div>

              <div className="hidden items-center gap-4 text-sm text-zinc-600 lg:flex dark:text-zinc-300">
                <span>Fecha: {formatOrderDate(order.deliveryDate)}</span>
                <StatusBadge status={order.status} />
                <span className="font-semibold text-zinc-800 dark:text-zinc-100">
                  {formatCurrency(order.total)}
                </span>
              </div>

              <OrderStatusMenu
                order={order}
                onStatusChange={(status) => onStatusChange(order, status)}
                onEdit={() => onEdit(order)}
                onDelete={() => onDelete(order)}
              />
            </Card>
          </li>
        ))}
      </ul>

      <ul className="flex flex-col gap-2 sm:hidden">
        {orders.map((order) => (
          <li key={order.id}>
            <Card className="flex flex-col gap-3 p-4 text-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <OrderIcon status={order.status} />
                  <div className="flex min-w-0 flex-col">
                    <span className="font-medium text-zinc-800 dark:text-zinc-100">
                      {formatOrderCode(order.code)} · {order.customer}
                    </span>
                    <span className="truncate text-zinc-500 dark:text-zinc-400">
                      {order.modelName}
                      {order.filamentColor ? ` · ${order.filamentColor}` : ""} ·{" "}
                      {order.quantity} ud.
                    </span>
                  </div>
                </div>
                <OrderStatusMenu
                  order={order}
                  onStatusChange={(status) => onStatusChange(order, status)}
                  onEdit={() => onEdit(order)}
                  onDelete={() => onDelete(order)}
                />
              </div>

              <OrderNotes notes={order.notes} />

              <div className="flex items-center justify-between gap-3">
                <span className="text-zinc-500 dark:text-zinc-400">
                  {formatOrderDate(order.deliveryDate)}
                </span>
                <span className="flex items-center gap-2">
                  <StatusBadge status={order.status} />
                  <span className="font-semibold text-zinc-800 dark:text-zinc-100">
                    {formatCurrency(order.total)}
                  </span>
                </span>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </>
  );
}
