"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { BATCH_STATUSES, BATCH_STATUS_LABELS } from "@/lib/production-utils";
import type { BatchStatus } from "@/types/production";

export type BatchStatusFilter = "todos" | BatchStatus;

interface ProductionToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  status: BatchStatusFilter;
  onStatusChange: (value: BatchStatusFilter) => void;
}

export function ProductionToolbar({
  query,
  onQueryChange,
  status,
  onStatusChange,
}: ProductionToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Buscar lote, modelo o impresora..."
          aria-label="Buscar lote, modelo o impresora"
          className="pl-9"
        />
      </div>

      <Select
        value={status}
        onChange={(event) =>
          onStatusChange(event.target.value as BatchStatusFilter)
        }
        aria-label="Filtrar por estado"
        className="sm:w-48"
      >
        <option value="todos">Filtra: Todos</option>
        {BATCH_STATUSES.map((option) => (
          <option key={option} value={option}>
            {BATCH_STATUS_LABELS[option]}
          </option>
        ))}
      </Select>
    </div>
  );
}
