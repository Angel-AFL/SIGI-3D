"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { StockStatus } from "@/types/dashboard";

export type StatusFilter = "todos" | StockStatus;

interface InventoryToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  status: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
}

export function InventoryToolbar({
  query,
  onQueryChange,
  status,
  onStatusChange,
}: InventoryToolbarProps) {
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
          placeholder="Buscar material..."
          aria-label="Buscar material"
          className="pl-9"
        />
      </div>

      <Select
        value={status}
        onChange={(event) =>
          onStatusChange(event.target.value as StatusFilter)
        }
        aria-label="Filtrar por estado"
        className="sm:w-48"
      >
        <option value="todos">Filtra: Todos</option>
        <option value="en_stock">En stock</option>
        <option value="bajo_stock">Bajo stock</option>
        <option value="agotado">Agotado</option>
      </Select>
    </div>
  );
}
