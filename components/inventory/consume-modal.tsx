"use client";

import { useState, type FormEvent } from "react";
import { consumeFilament } from "@/app/(app)/inventario/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { formatGrams } from "@/lib/inventory-utils";
import type { Filament } from "@/types/inventory";

interface ConsumeModalProps {
  onClose: () => void;
  filament: Filament;
}

export function ConsumeModal({ onClose, filament }: ConsumeModalProps) {
  const [grams, setGrams] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setBusy(true);
    setError(null);

    const result = await consumeFilament(filament.id, Number(grams));

    if (!result.success) {
      setError(result.error);
      setBusy(false);
      return;
    }

    setBusy(false);
    onClose();
  }

  const consumed = Number(grams);
  const remaining = Number.isFinite(consumed)
    ? Math.max(0, filament.weightCurrentG - consumed)
    : null;

  return (
    <Modal open onClose={onClose} title="Registrar consumo">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          {filament.material} · {filament.color} · {filament.brand}
          <span className="mt-1 block text-zinc-500 dark:text-zinc-400">
            Peso actual: {formatGrams(filament.weightCurrentG)}
          </span>
        </p>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium tracking-wide text-zinc-600 uppercase dark:text-zinc-300">
            Gramos consumidos
          </span>
          <Input
            type="number"
            min="1"
            step="1"
            value={grams}
            onChange={(event) => setGrams(event.target.value)}
            placeholder="Ej. 120"
            required
            autoFocus
          />
        </label>

        {remaining !== null ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Peso restante: {formatGrams(remaining)}
          </p>
        ) : null}

        {error ? (
          <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={busy}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? "Registrando..." : "Descontar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

