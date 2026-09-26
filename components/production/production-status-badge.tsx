import { cn } from "@/lib/utils";
import type { BatchStatus } from "@/types/production";

const statusStyles: Record<
  BatchStatus,
  { label: string; className: string }
> = {
  en_cola: {
    label: "En cola",
    className:
      "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
  },
  imprimiendo: {
    label: "Imprimiendo",
    className:
      "border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-200",
  },
  completado: {
    label: "Completado",
    className:
      "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-200",
  },
  fallido: {
    label: "Fallido",
    className:
      "border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-950 dark:text-red-200",
  },
};

export function ProductionStatusBadge({
  status,
  className,
}: {
  status: BatchStatus;
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
