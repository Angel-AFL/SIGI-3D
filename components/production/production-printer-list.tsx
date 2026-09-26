"use client";

import { Pencil, Printer, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/order-utils";
import { formatCode, PRINTER_STATUS_LABELS } from "@/lib/production-utils";
import { cn } from "@/lib/utils";
import type { PrinterProfile } from "@/types/production";

interface ProductionPrinterListProps {
  printers: PrinterProfile[];
  onEdit: (printer: PrinterProfile) => void;
  onDelete: (printer: PrinterProfile) => void;
}

function bedLabel(printer: PrinterProfile): string {
  if (printer.bedX === null || printer.bedY === null) {
    return "Cama sin definir";
  }

  const z = printer.bedZ !== null ? ` × ${printer.bedZ}` : "";
  return `Cama ${printer.bedX} × ${printer.bedY}${z} mm`;
}

export function ProductionPrinterList({
  printers,
  onEdit,
  onDelete,
}: ProductionPrinterListProps) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {printers.map((printer) => (
        <li key={printer.id}>
          <Card className="flex h-full flex-col gap-2 p-4">
            <div className="flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand dark:bg-brand/20 dark:text-sky-300">
                <Printer className="size-5" aria-hidden="true" />
              </span>

              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-medium text-zinc-800 dark:text-zinc-100">
                  {printer.name}
                </span>
                <span className="truncate text-sm text-zinc-500 dark:text-zinc-400">
                  Perfil {formatCode(printer.code)} · {bedLabel(printer)}
                </span>
                <span className="truncate text-sm text-zinc-500 dark:text-zinc-400">
                  Boquilla {printer.nozzleDiameter} mm ·{" "}
                  {formatCurrency(printer.costPerHour)}/h
                </span>
              </div>

              <span
                className={cn(
                  "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                  printer.status === "disponible"
                    ? "border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-700 dark:bg-sky-950 dark:text-sky-200"
                    : "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
                )}
              >
                {PRINTER_STATUS_LABELS[printer.status]}
              </span>
            </div>

            {printer.notes ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {printer.notes}
              </p>
            ) : null}

            <div className="mt-auto flex gap-2 pt-2">
              <Button
                size="sm"
                variant="secondary"
                className="flex-1"
                onClick={() => onEdit(printer)}
              >
                <Pencil className="size-3.5" aria-hidden="true" />
                Editar
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="flex-1 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                onClick={() => onDelete(printer)}
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
                Eliminar
              </Button>
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
}
