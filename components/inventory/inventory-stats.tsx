import { AlertTriangle, Package } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { InventoryStats as InventoryStatsData } from "@/types/inventory";

export function InventoryStats({ stats }: { stats: InventoryStatsData }) {
  const hasAlerts = stats.lowStock > 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card className="flex items-center gap-4 p-6">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand dark:bg-brand/20 dark:text-sky-300">
          <Package className="size-7" aria-hidden="true" />
        </span>
        <p className="text-sm font-semibold tracking-wide text-zinc-700 uppercase dark:text-zinc-200">
          Carretes totales:{" "}
          <span className="text-xl font-bold text-brand dark:text-sky-300">
            {stats.total}
          </span>
        </p>
      </Card>

      <Card
        className={cn(
          "flex items-center gap-4 p-6",
          hasAlerts && "border-amber-300 dark:border-amber-700",
        )}
      >
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
          <AlertTriangle className="size-7" aria-hidden="true" />
        </span>
        <p className="text-sm font-semibold tracking-wide text-zinc-700 uppercase dark:text-zinc-200">
          Alerta stock bajo:{" "}
          <span className="text-xl font-bold text-amber-700 dark:text-amber-300">
            {stats.lowStock}
          </span>
        </p>
      </Card>
    </div>
  );
}
