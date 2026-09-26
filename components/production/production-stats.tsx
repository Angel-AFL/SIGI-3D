import { Clock, Hourglass, Layers, Printer } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/order-utils";
import { formatDuration } from "@/lib/production-utils";
import type { ProductionStats as ProductionStatsData } from "@/types/production";

export function ProductionStats({ stats }: { stats: ProductionStatsData }) {
  const cards = [
    {
      icon: Clock,
      label: "Lotes en cola",
      value: String(stats.queuedBatches),
      tone: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
    },
    {
      icon: Printer,
      label: "Imprimiendo",
      value: String(stats.printingBatches),
      tone: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    },
    {
      icon: Layers,
      label: "Filamento requerido",
      value: `${Math.round(stats.requiredGrams).toLocaleString("es")} g`,
      tone: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    },
    {
      icon: Hourglass,
      label: "Tiempo planificado",
      value: formatDuration(stats.plannedMinutes),
      tone: "bg-brand/10 text-brand dark:bg-brand/20 dark:text-sky-300",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ icon: Icon, label, value, tone }) => (
          <Card key={label} className="flex items-center gap-3 p-4">
            <span
              className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${tone}`}
            >
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <span className="flex flex-col">
              <span className="text-[11px] font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                {label}
              </span>
              <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                {value}
              </span>
            </span>
          </Card>
        ))}
      </div>

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Costo estimado de lotes activos:{" "}
        <span className="font-semibold text-zinc-800 dark:text-zinc-100">
          {formatCurrency(stats.estimatedCost)}
        </span>
      </p>
    </div>
  );
}
