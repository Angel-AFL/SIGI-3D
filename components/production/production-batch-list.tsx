"use client";

import {
  CircleCheck,
  Clock,
  Printer,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { ProductionBatchMenu } from "@/components/production/production-batch-menu";
import { ProductionStatusBadge } from "@/components/production/production-status-badge";
import { Card } from "@/components/ui/card";
import { formatGrams } from "@/lib/inventory-utils";
import { formatCurrency } from "@/lib/order-utils";
import {
  computeBatchCost,
  formatCode,
  formatDuration,
} from "@/lib/production-utils";
import type {
  BatchStatus,
  PrinterProfile,
  ProductionBatch,
  ProductionFilamentOption,
} from "@/types/production";

interface ProductionBatchListProps {
  batches: ProductionBatch[];
  printers: PrinterProfile[];
  filamentOptions: ProductionFilamentOption[];
  onStatusChange: (batch: ProductionBatch, status: BatchStatus) => void;
  onMarkFailed: (batch: ProductionBatch) => void;
  onEdit: (batch: ProductionBatch) => void;
  onDelete: (batch: ProductionBatch) => void;
}

const statusIcons: Record<BatchStatus, LucideIcon> = {
  en_cola: Clock,
  imprimiendo: Printer,
  completado: CircleCheck,
  fallido: TriangleAlert,
};

function BatchIcon({ status }: { status: BatchStatus }) {
  const Icon = statusIcons[status];

  return (
    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
      <Icon className="size-5" aria-hidden="true" />
    </span>
  );
}

export function ProductionBatchList({
  batches,
  printers,
  filamentOptions,
  onStatusChange,
  onMarkFailed,
  onEdit,
  onDelete,
}: ProductionBatchListProps) {
  const priceByFilamentId = new Map(
    filamentOptions.map((filament) => [filament.id, filament.pricePerKg]),
  );
  const costPerHourByPrinterId = new Map(
    printers.map((printer) => [printer.id, printer.costPerHour]),
  );

  return (
    <ul className="flex flex-col gap-2">
      {batches.map((batch) => {
        const pricePerKg = batch.filamentId
          ? (priceByFilamentId.get(batch.filamentId) ?? null)
          : null;
        const costPerHour = batch.printerId
          ? (costPerHourByPrinterId.get(batch.printerId) ?? 0)
          : 0;
        const cost = computeBatchCost(batch, pricePerKg, costPerHour);
        const modelLabel =
          batch.modelCode !== null && batch.modelName
            ? `Modelo ${formatCode(batch.modelCode)} (${batch.modelName})`
            : (batch.modelName ?? "Modelo no asignado");

        return (
          <li key={batch.id}>
            <Card className="flex items-start gap-4 p-4">
              <BatchIcon status={batch.status} />

              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate font-medium text-zinc-800 dark:text-zinc-100">
                  Lote {formatCode(batch.code)} · {modelLabel} ×{batch.copies}
                </span>

                <span className="truncate text-sm text-zinc-500 dark:text-zinc-400">
                  {batch.printerName ?? "Sin impresora"} · {batch.beds}{" "}
                  {batch.beds === 1 ? "cama" : "camas"} ({batch.unitsPerBed}/cama)
                  {batch.material ? ` · ${batch.material}` : ""}
                </span>

                <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
                  <ProductionStatusBadge status={batch.status} />
                  <span aria-hidden="true">·</span>
                  <span>Tiempo: {formatDuration(batch.beds * batch.minutesPerBed)}</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    Filamento: {formatGrams(batch.copies * batch.gramsPerUnit)}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    Costo:{" "}
                    {cost.totalCost === null
                      ? "—"
                      : formatCurrency(cost.totalCost)}
                  </span>
                </span>

                {batch.status === "fallido" ? (
                  <span className="mt-0.5 text-sm text-red-600 dark:text-red-400">
                    Merma: {formatGrams(batch.wasteGrams)}
                    {batch.wasteReason ? ` · ${batch.wasteReason}` : ""}
                  </span>
                ) : null}
              </div>

              <ProductionBatchMenu
                batch={batch}
                onStatusChange={(status) => onStatusChange(batch, status)}
                onMarkFailed={() => onMarkFailed(batch)}
                onEdit={() => onEdit(batch)}
                onDelete={() => onDelete(batch)}
              />
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
