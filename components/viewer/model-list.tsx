"use client";

/* eslint-disable @next/next/no-img-element */

import { Box } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Model3D } from "@/types/viewer";

interface ModelListProps {
  models: Model3D[];
  selectedId: string | null;
  onSelect: (model: Model3D) => void;
}

export function ModelList({ models, selectedId, onSelect }: ModelListProps) {
  return (
    <div className="flex max-h-[26rem] flex-col gap-2 overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-2 lg:max-h-[32rem] dark:border-zinc-800 dark:bg-zinc-900">
      {models.map((model) => {
        const isSelected = model.id === selectedId;

        return (
          <button
            key={model.id}
            type="button"
            onClick={() => onSelect(model)}
            aria-pressed={isSelected}
            className={cn(
              "flex items-center gap-3 rounded-xl border px-2.5 py-2 text-left transition-colors",
              isSelected
                ? "border-brand bg-brand/5 dark:border-sky-500 dark:bg-sky-500/10"
                : "border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800",
            )}
          >
            <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
              {model.thumbnailUrl ? (
                <img
                  src={model.thumbnailUrl}
                  alt=""
                  loading="lazy"
                  className="size-full object-cover"
                />
              ) : (
                <Box className="size-5" aria-hidden="true" />
              )}
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                #{String(model.code).padStart(3, "0")}
              </span>
              <span className="block truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">
                {model.name}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
