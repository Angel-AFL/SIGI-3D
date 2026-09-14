"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDimensions, formatEstimatedTime } from "@/lib/viewer-utils";
import type { Model3D } from "@/types/viewer";

interface ModelDetailsProps {
  model: Model3D;
  ownerEmail: string;
  onEdit: (model: Model3D) => void;
  onDelete: (model: Model3D) => void;
}

export function ModelDetails({
  model,
  ownerEmail,
  onEdit,
  onDelete,
}: ModelDetailsProps) {
  const rows: { label: string; value: string }[] = [
    { label: "Modelo", value: `#${String(model.code).padStart(3, "0")} (${model.name})` },
    { label: "Dimensiones", value: formatDimensions(model.dimensions) },
    { label: "Material", value: model.material },
    { label: "Tiempo estimado", value: formatEstimatedTime(model.estimatedMinutes) },
    { label: "Cargado por", value: ownerEmail || "—" },
  ];

  return (
    <Card className="flex flex-col gap-4 p-5">
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
        Detalles del Modelo
      </h2>

      <dl className="flex flex-col gap-3">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-0.5">
            <dt className="text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
              {row.label}
            </dt>
            <dd className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-auto flex gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <Button
          size="sm"
          variant="secondary"
          className="flex-1"
          onClick={() => onEdit(model)}
        >
          <Pencil className="size-3.5" aria-hidden="true" />
          Editar
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className="flex-1 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
          onClick={() => onDelete(model)}
        >
          <Trash2 className="size-3.5" aria-hidden="true" />
          Eliminar
        </Button>
      </div>
    </Card>
  );
}
