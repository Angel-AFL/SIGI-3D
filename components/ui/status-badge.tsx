import { cn } from "@/lib/utils";
import type { OrderStatus, StockStatus } from "@/types/dashboard";

type Status = OrderStatus | StockStatus;

const statusStyles: Record<Status, { label: string; className: string }> = {
  cotizado: {
    label: "Cotizado",
    className:
      "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
  },
  en_cola: {
    label: "En cola",
    className:
      "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200",
  },
  imprimiendo: {
    label: "Imprimiendo",
    className:
      "border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-200",
  },
  entregado: {
    label: "Entregado",
    className:
      "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-200",
  },
  en_stock: {
    label: "En stock",
    className:
      "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-200",
  },
  bajo_stock: {
    label: "Bajo stock",
    className:
      "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200",
  },
  agotado: {
    label: "Agotado",
    className:
      "border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-950 dark:text-red-200",
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: Status;
  className?: string;
}) {
  const { label, className: tone } = statusStyles[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        tone,
        className,
      )}
    >
      {label}
    </span>
  );
}
