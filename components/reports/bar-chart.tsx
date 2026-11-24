import { cn } from "@/lib/utils";

export interface BarChartItem {
  label: string;
  value: number;
  hint?: string;
}

interface BarChartProps {
  items: BarChartItem[];
  formatValue: (value: number) => string;
  orientation?: "vertical" | "horizontal";
  tone?: "brand" | "amber" | "emerald";
  emptyLabel?: string;
}

const toneStyles = {
  brand: "bg-brand/80 dark:bg-sky-400",
  amber: "bg-amber-500 dark:bg-amber-400",
  emerald: "bg-emerald-500 dark:bg-emerald-400",
};

export function BarChart({
  items,
  formatValue,
  orientation = "vertical",
  tone = "brand",
  emptyLabel = "Sin datos en el periodo.",
}: BarChartProps) {
  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
        {emptyLabel}
      </p>
    );
  }

  const max = Math.max(...items.map((item) => item.value), 1);

  if (orientation === "horizontal") {
    return (
      <ul className="flex flex-col gap-4">
        {items.map((item) => {
          const percent = Math.max((item.value / max) * 100, 0);

          return (
            <li key={item.label}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="font-medium text-zinc-700 dark:text-zinc-200">
                  {item.label}
                </span>
                <span className="shrink-0 font-semibold text-zinc-900 dark:text-zinc-50">
                  {formatValue(item.value)}
                </span>
              </div>
              <div
                className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"
                role="img"
                aria-label={`${item.label}: ${formatValue(item.value)}`}
              >
                <div
                  className={cn("h-full rounded-full", toneStyles[tone])}
                  style={{ width: `${percent}%` }}
                />
              </div>
              {item.hint ? (
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {item.hint}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className="flex h-56 items-end gap-2 sm:gap-3">
      {items.map((item) => {
        const percent = Math.max((item.value / max) * 100, item.value > 0 ? 4 : 1);

        return (
          <div
            key={item.label}
            className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
          >
            <span className="text-[11px] font-semibold text-zinc-700 sm:text-xs dark:text-zinc-200">
              {formatValue(item.value)}
            </span>
            <div className="flex w-full flex-1 items-end">
              <div
                className={cn(
                  "w-full rounded-t-lg transition-colors",
                  toneStyles[tone],
                )}
                style={{ height: `${percent}%` }}
                title={`${item.label}: ${formatValue(item.value)}`}
                aria-hidden="true"
              />
            </div>
            <span className="w-full truncate text-center text-[11px] text-zinc-500 dark:text-zinc-400">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
