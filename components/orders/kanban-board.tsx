"use client";

import { useState } from "react";
import { OrderCard } from "@/components/orders/order-card";
import {
  ORDER_STATUS_COLUMNS,
  ORDER_STATUS_LABELS,
} from "@/lib/order-utils";
import { cn } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types/orders";

interface KanbanBoardProps {
  orders: Order[];
  onStatusChange: (order: Order, status: OrderStatus) => void;
  onEdit: (order: Order) => void;
  onDelete: (order: Order) => void;
}

export function KanbanBoard({
  orders,
  onStatusChange,
  onEdit,
  onDelete,
}: KanbanBoardProps) {
  const [dragOver, setDragOver] = useState<OrderStatus | null>(null);

  const byStatus = ORDER_STATUS_COLUMNS.reduce(
    (acc, status) => {
      acc[status] = orders.filter((order) => order.status === status);
      return acc;
    },
    {} as Record<OrderStatus, Order[]>,
  );

  function handleDrop(event: React.DragEvent<HTMLDivElement>, status: OrderStatus) {
    event.preventDefault();
    setDragOver(null);

    const orderId = event.dataTransfer.getData("text/plain");
    const order = orders.find((item) => item.id === orderId);

    if (order && order.status !== status) {
      onStatusChange(order, status);
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {ORDER_STATUS_COLUMNS.map((status) => {
        const columnOrders = byStatus[status];

        return (
          <div
            key={status}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = "move";
              setDragOver(status);
            }}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                setDragOver((current) => (current === status ? null : current));
              }
            }}
            onDrop={(event) => handleDrop(event, status)}
            className={cn(
              "flex flex-col gap-3 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/60 p-3 transition-colors dark:border-zinc-800 dark:bg-zinc-900/40",
              dragOver === status &&
                "border-brand bg-brand/5 dark:border-brand dark:bg-brand/10",
            )}
          >
            <div className="flex items-center justify-between gap-2 px-1">
              <h3 className="text-xs font-semibold tracking-wide text-zinc-600 uppercase dark:text-zinc-300">
                {ORDER_STATUS_LABELS[status]}
              </h3>
              <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                {columnOrders.length}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {columnOrders.length === 0 ? (
                <p className="rounded-xl border border-dashed border-zinc-200 px-3 py-6 text-center text-xs text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
                  Sin pedidos
                </p>
              ) : (
                columnOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onStatusChange={(next) => onStatusChange(order, next)}
                    onEdit={() => onEdit(order)}
                    onDelete={() => onDelete(order)}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
