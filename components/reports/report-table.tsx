import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ReportColumn<T> {
  header: string;
  cell: (row: T) => ReactNode;
  align?: "left" | "right";
}

interface ReportTableProps<T> {
  title: string;
  description?: string;
  columns: ReportColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  emptyLabel: string;
}

export function ReportTable<T>({
  title,
  description,
  columns,
  rows,
  getRowKey,
  emptyLabel,
}: ReportTableProps<T>) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-zinc-200 p-5 dark:border-zinc-800">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {description}
          </p>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <p className="p-5 text-sm text-zinc-500 dark:text-zinc-400">
          {emptyLabel}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
            <thead className="bg-zinc-50 dark:bg-zinc-950">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.header}
                    scope="col"
                    className={cn(
                      "px-5 py-3 text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400",
                      column.align === "right" ? "text-right" : "text-left",
                    )}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {rows.map((row) => (
                <tr key={getRowKey(row)}>
                  {columns.map((column) => (
                    <td
                      key={column.header}
                      className={cn(
                        "px-5 py-3 text-zinc-700 dark:text-zinc-200",
                        column.align === "right" ? "text-right" : "text-left",
                      )}
                    >
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
