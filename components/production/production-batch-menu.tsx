"use client";

import { useEffect, useRef, useState } from "react";
import {
  EllipsisVertical,
  Pencil,
  TriangleAlert,
  Trash2,
} from "lucide-react";
import {
  BATCH_STATUS_LABELS,
  formatCode,
} from "@/lib/production-utils";
import { cn } from "@/lib/utils";
import type { BatchStatus, ProductionBatch } from "@/types/production";

interface ProductionBatchMenuProps {
  batch: ProductionBatch;
  onStatusChange: (status: BatchStatus) => void;
  onMarkFailed: () => void;
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}

const MOVE_STATUSES: BatchStatus[] = ["en_cola", "imprimiendo", "completado"];

const itemClass =
  "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800";

export function ProductionBatchMenu({
  batch,
  onStatusChange,
  onMarkFailed,
  onEdit,
  onDelete,
  className,
}: ProductionBatchMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function close() {
    setOpen(false);
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Acciones del lote ${formatCode(batch.code)}`}
        className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
      >
        <EllipsisVertical className="size-4" aria-hidden="true" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-1 w-52 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
        >
          <p className="px-3 py-1 text-[10px] font-semibold tracking-wide text-zinc-400 uppercase dark:text-zinc-500">
            Mover a
          </p>
          {MOVE_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              role="menuitem"
              disabled={status === batch.status}
              onClick={() => {
                close();
                onStatusChange(status);
              }}
              className={cn(
                "flex w-full items-center px-3 py-2 text-left text-sm transition-colors",
                status === batch.status
                  ? "cursor-default font-medium text-brand dark:text-sky-300"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
              )}
            >
              {BATCH_STATUS_LABELS[status]}
            </button>
          ))}

          <button
            type="button"
            role="menuitem"
            disabled={batch.status === "fallido"}
            onClick={() => {
              close();
              onMarkFailed();
            }}
            className={cn(
              itemClass,
              "disabled:cursor-default disabled:opacity-50",
            )}
          >
            <TriangleAlert className="size-4" aria-hidden="true" />
            Marcar como fallido
          </button>

          <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              close();
              onEdit();
            }}
            className={itemClass}
          >
            <Pencil className="size-4" aria-hidden="true" />
            Editar lote
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              close();
              onDelete();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Eliminar lote
          </button>
        </div>
      ) : null}
    </div>
  );
}
