import { formatPercent, formatReportNumber } from "@/lib/report-utils";
import type { StatusSlice } from "@/types/reports";

const segmentStyles: Record<string, string> = {
  cotizado: "bg-amber-400 dark:bg-amber-300",
  imprimiendo: "bg-blue-500 dark:bg-blue-400",
  entregado: "bg-emerald-500 dark:bg-emerald-400",
};

export function StatusBreakdown({ slices }: { slices: StatusSlice[] }) {
  const total = slices.reduce((sum, slice) => sum + slice.count, 0);

  if (total === 0) {
    return (
      <p className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Sin pedidos creados en el periodo.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div
        className="flex h-3 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"
        role="img"
        aria-label={`Distribución de ${total} pedidos por estado`}
      >
        {slices.map((slice) =>
          slice.count > 0 ? (
            <div
              key={slice.status}
              className={segmentStyles[slice.status]}
              style={{ width: `${(slice.count / total) * 100}%` }}
            />
          ) : null,
        )}
      </div>

      <ul className="flex flex-col gap-3">
        {slices.map((slice) => {
          const percent = (slice.count / total) * 100;

          return (
            <li
              key={slice.status}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="flex items-center gap-2 text-zinc-700 dark:text-zinc-200">
                <span
                  className={`size-2.5 rounded-full ${segmentStyles[slice.status]}`}
                  aria-hidden="true"
                />
                {slice.label}
              </span>
              <span className="flex items-baseline gap-2">
                <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                  {formatReportNumber(slice.count)}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {formatPercent(percent)}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
