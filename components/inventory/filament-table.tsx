"use client";

import { FilamentRowActions } from "@/components/inventory/filament-row-actions";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatGrams, getFilamentStatus } from "@/lib/inventory-utils";
import type { Filament } from "@/types/inventory";

interface FilamentTableProps {
  filaments: Filament[];
  onEdit: (filament: Filament) => void;
  onConsume: (filament: Filament) => void;
  onDelete: (filament: Filament) => void;
}

function formatCode(code: number): string {
  return `[${String(code).padStart(3, "0")}]`;
}

export function FilamentTable({
  filaments,
  onEdit,
  onConsume,
  onDelete,
}: FilamentTableProps) {
  return (
    <>
      <Card className="hidden overflow-hidden sm:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-100 text-xs tracking-wide text-zinc-500 uppercase dark:bg-zinc-800 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Material</th>
              <th className="px-4 py-3 font-medium">Color</th>
              <th className="px-4 py-3 font-medium">Marca</th>
              <th className="px-4 py-3 font-medium">Peso actual (g)</th>
              <th className="px-4 py-3 font-medium">Ubicación</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filaments.map((filament) => (
              <tr
                key={filament.id}
                className="text-zinc-700 dark:text-zinc-200"
              >
                <td className="px-4 py-3 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                  {formatCode(filament.code)}
                </td>
                <td className="px-4 py-3 font-medium">{filament.material}</td>
                <td className="px-4 py-3">{filament.color}</td>
                <td className="px-4 py-3">{filament.brand}</td>
                <td className="px-4 py-3">
                  {formatGrams(filament.weightCurrentG)}
                </td>
                <td className="px-4 py-3">
                  {filament.location ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    status={getFilamentStatus(
                      filament.weightCurrentG,
                      filament.minStockG,
                    )}
                  />
                </td>
                <td className="px-4 py-3">
                  <FilamentRowActions
                    onEdit={() => onEdit(filament)}
                    onConsume={() => onConsume(filament)}
                    onDelete={() => onDelete(filament)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <ul className="flex flex-col gap-2 sm:hidden">
        {filaments.map((filament) => (
          <li key={filament.id}>
            <Card className="flex flex-col gap-3 p-4 text-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col">
                  <span className="font-medium text-zinc-800 dark:text-zinc-100">
                    {formatCode(filament.code)} {filament.material} ·{" "}
                    {filament.color}
                  </span>
                  <span className="truncate text-zinc-500 dark:text-zinc-400">
                    {filament.brand}
                    {filament.location ? ` · ${filament.location}` : ""}
                  </span>
                </div>
                <StatusBadge
                  status={getFilamentStatus(
                    filament.weightCurrentG,
                    filament.minStockG,
                  )}
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-zinc-600 dark:text-zinc-300">
                  {formatGrams(filament.weightCurrentG)}
                </span>
                <FilamentRowActions
                  onEdit={() => onEdit(filament)}
                  onConsume={() => onConsume(filament)}
                  onDelete={() => onDelete(filament)}
                />
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </>
  );
}
