"use client";

import { OrderNotes } from "@/components/orders/order-notes";
import { OrderStatusMenu } from "@/components/orders/order-status-menu";
import { Card } from "@/components/ui/card";
import {
  formatCurrency,
  formatOrderCode,
  formatOrderDate,
} from "@/lib/order-utils";
import type { Order, OrderStatus } from "@/types/orders";

interface OrderCardProps {
  order: Order;
  onStatusChange: (status: OrderStatus) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function OrderCard({
  order,
  onStatusChange,
  onEdit,
  onDelete,
}: OrderCardProps) {
  return (
    <Card
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData("text/plain", order.id);
        event.dataTransfer.effectAllowed = "move";
      }}
      className="flex cursor-grab flex-col gap-2 p-3 text-sm active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
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
        <OrderStatusMenu
          order={order}
          onStatusChange={onStatusChange}
          onEdit={onEdit}
          onDelete={onDelete}
          className="-mt-1 -mr-1"
        />
      </div>

      <OrderNotes notes={order.notes} />

      <div className="flex items-center justify-between gap-2 text-zinc-500 dark:text-zinc-400">
        <span>{formatOrderDate(order.deliveryDate)}</span>
        <span className="font-semibold text-zinc-800 dark:text-zinc-100">
          {formatCurrency(order.total)}
        </span>
      </div>
    </Card>
  );
}
