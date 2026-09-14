"use client";

import { Pencil, Scale, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilamentRowActionsProps {
  onEdit: () => void;
  onConsume: () => void;
  onDelete: () => void;
}

const actionClass =
  "inline-flex size-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50";

export function FilamentRowActions({
  onEdit,
  onConsume,
  onDelete,
}: FilamentRowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      <button
        type="button"
        onClick={onConsume}
        aria-label="Registrar consumo"
        title="Registrar consumo"
        className={actionClass}
      >
        <Scale className="size-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onEdit}
        aria-label="Editar carrete"
        title="Editar"
        className={actionClass}
      >
        <Pencil className="size-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label="Eliminar carrete"
        title="Eliminar"
        className={cn(actionClass, "hover:text-red-600 dark:hover:text-red-400")}
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
