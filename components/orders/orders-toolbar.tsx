"use client";

import { LayoutList, Search, SquareKanban } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/lib/order-utils";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/orders";

export type StatusFilter = "todos" | OrderStatus;
export type OrdersViewMode = "lista" | "kanban";

interface OrdersToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  status: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  view: OrdersViewMode;
  onViewChange: (value: OrdersViewMode) => void;
}

const viewOptions: Array<{
  value: OrdersViewMode;
  label: string;
  icon: typeof LayoutList;
}> = [
  { value: "lista", label: "Lista", icon: LayoutList },
  { value: "kanban", label: "Kanban", icon: SquareKanban },
];

export function OrdersToolbar({
  query,
  onQueryChange,
  status,
  onStatusChange,
  view,
  onViewChange,
}: OrdersToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Buscar pedido o cliente..."
          aria-label="Buscar pedido o cliente"
          className="pl-9"
        />
      </div>

      <Select
        value={status}
        onChange={(event) => onStatusChange(event.target.value as StatusFilter)}
        aria-label="Filtrar por estado"
        className="sm:w-48"
      >
        <option value="todos">Filtra: Todos</option>
        {ORDER_STATUSES.map((option) => (
          <option key={option} value={option}>
            {ORDER_STATUS_LABELS[option]}
          </option>
        ))}
      </Select>

      <div
        role="group"
        aria-label="Cambiar vista"
        className="flex shrink-0 rounded-lg border border-zinc-300 p-0.5 dark:border-zinc-700"
      >
        {viewOptions.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => onViewChange(value)}
            aria-pressed={view === value}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors sm:flex-none",
              view === value
                ? "bg-brand text-white"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
