"use client";

import { useEffect, useRef, useState } from "react";
import { EllipsisVertical, Pencil, Trash2 } from "lucide-react";
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/lib/order-utils";
import { cn } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types/orders";

interface OrderStatusMenuProps {
  order: Order;
  onStatusChange: (status: OrderStatus) => void;
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}

export function OrderStatusMenu({
  order,
  onStatusChange,
  onEdit,
  onDelete,
  className,
}: OrderStatusMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Acciones del pedido ${order.code}`}
        className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
      >
        <EllipsisVertical className="size-4" aria-hidden="true" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-1 w-48 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
        >
          <p className="px-3 py-1 text-[10px] font-semibold tracking-wide text-zinc-400 uppercase dark:text-zinc-500">
            Mover a
          </p>
          {ORDER_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              role="menuitem"
              disabled={status === order.status}
              onClick={() => {
                setOpen(false);
                onStatusChange(status);
              }}
              className={cn(
                "flex w-full items-center px-3 py-2 text-left text-sm transition-colors",
                status === order.status
                  ? "cursor-default font-medium text-brand dark:text-sky-300"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
              )}
            >
              {ORDER_STATUS_LABELS[status]}
            </button>
          ))}

          <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Pencil className="size-4" aria-hidden="true" />
            Editar
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Eliminar
          </button>
        </div>
      ) : null}
    </div>
  );
}
