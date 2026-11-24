import Link from "next/link";
import { Download } from "lucide-react";
import { REPORT_RANGES, REPORT_RANGE_LABELS } from "@/lib/report-utils";
import { cn } from "@/lib/utils";
import type { ReportDataset, ReportRange } from "@/types/reports";

function ExportLink({
  dataset,
  range,
  label,
}: {
  dataset: ReportDataset;
  range: ReportRange;
  label: string;
}) {
  return (
    <a
      href={`/reportes/export?dataset=${dataset}&rango=${range}`}
      className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
    >
      <Download className="size-4" aria-hidden="true" />
      {label}
    </a>
  );
}

export function ReportsToolbar({ range }: { range: ReportRange }) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <nav
        aria-label="Periodo del reporte"
        className="flex flex-wrap gap-1 rounded-2xl border border-zinc-200 bg-white p-1 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        {REPORT_RANGES.map((value) => {
          const active = value === range;

          return (
            <Link
              key={value}
              href={`/reportes?rango=${value}`}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-brand text-white"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
              )}
            >
              {REPORT_RANGE_LABELS[value]}
            </Link>
          );
        })}
      </nav>

      <div
        className="flex flex-wrap items-center gap-2"
        aria-label="Exportar reportes"
      >
        <ExportLink dataset="pedidos" range={range} label="Pedidos CSV" />
        <ExportLink dataset="lotes" range={range} label="Lotes CSV" />
        <ExportLink dataset="resumen" range={range} label="Resumen CSV" />
      </div>
    </div>
  );
}
