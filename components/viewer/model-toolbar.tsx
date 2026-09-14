"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

interface ModelToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  material: string;
  onMaterialChange: (value: string) => void;
  materials: string[];
}

export function ModelToolbar({
  query,
  onQueryChange,
  material,
  onMaterialChange,
  materials,
}: ModelToolbarProps) {
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
          placeholder="Buscar modelos..."
          aria-label="Buscar modelos"
          className="pl-9"
        />
      </div>

      <Select
        value={material}
        onChange={(event) => onMaterialChange(event.target.value)}
        aria-label="Filtrar por material"
        className="sm:w-48"
      >
        <option value="todos">Filtra: Todos</option>
        {materials.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
    </div>
  );
}
