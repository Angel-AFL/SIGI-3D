import {
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Factory,
  Package,
  Receipt,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/order-utils";
import { formatGrams, formatPercent } from "@/lib/report-utils";
import type { ReportKpis as ReportKpisData } from "@/types/reports";

interface KpiItem {
  icon: LucideIcon;
  label: string;
  value: string;
  hint: string;
  tone: string;
}

export function ReportKpis({ kpis }: { kpis: ReportKpisData }) {
  const hasProduction = kpis.finishedBatches > 0;
  const positiveMargin = kpis.grossMargin >= 0;

  const items: KpiItem[] = [
    {
      icon: Wallet,
      label: "Ingresos entregados",
      value: formatCurrency(kpis.revenue),
      hint:
        kpis.deliveredOrders === 0
          ? "Sin pedidos entregados"
          : `${kpis.deliveredOrders} pedido${kpis.deliveredOrders === 1 ? "" : "s"} entregado${kpis.deliveredOrders === 1 ? "" : "s"}`,
      tone: "bg-brand/10 text-brand dark:bg-brand/20 dark:text-sky-300",
    },
    {
      icon: TrendingUp,
      label: "Margen bruto",
      value: hasProduction
        ? `${formatCurrency(kpis.grossMargin)} (${formatPercent(kpis.marginPercent)})`
        : "—",
      hint: hasProduction
        ? "Ingresos menos costo estimado"
        : "Sin lotes finalizados en el periodo",
      tone: !hasProduction
        ? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
        : positiveMargin
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
          : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
    },
    {
      icon: Factory,
      label: "Costo de producción",
      value: formatCurrency(kpis.productionCost),
      hint: `${kpis.finishedBatches} lote${kpis.finishedBatches === 1 ? "" : "s"} finalizado${kpis.finishedBatches === 1 ? "" : "s"}`,
      tone: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    },
    {
      icon: Receipt,
      label: "Ticket promedio",
      value: formatCurrency(kpis.averageTicket),
      hint: "Por pedido entregado",
      tone: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    },
    {
      icon: ClipboardCheck,
      label: "Pipeline activo",
      value: formatCurrency(kpis.pipeline),
      hint: "Pedidos cotizados o en impresión",
      tone: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
    },
    {
      icon: Package,
      label: "Filamento consumido",
      value: formatGrams(kpis.consumedGrams),
      hint: `Merma: ${formatGrams(kpis.wasteGrams)}`,
      tone: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
    },
    {
      icon: Clock,
      label: "Horas de impresora",
      value: `${kpis.printerHours.toLocaleString("es-MX", { maximumFractionDigits: 1 })} h`,
      hint: "Solo lotes finalizados",
      tone: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
    },
    {
      icon: CheckCircle2,
      label: "Tasa de éxito",
      value: hasProduction ? formatPercent(kpis.successRate) : "—",
      hint: `Merma: ${formatGrams(kpis.wasteGrams)}`,
      tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(({ icon: Icon, label, value, hint, tone }) => (
        <Card key={label} className="flex items-center gap-3 p-4">
          <span
            className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${tone}`}
          >
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="text-[11px] font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
              {label}
            </span>
            <span className="truncate text-lg font-bold text-zinc-900 dark:text-zinc-50">
              {value}
            </span>
            <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">
              {hint}
            </span>
          </span>
        </Card>
      ))}
    </div>
  );
}
