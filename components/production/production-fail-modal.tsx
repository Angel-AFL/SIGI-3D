"use client";

import { useState, type FormEvent } from "react";
import { markBatchFailed } from "@/app/(app)/produccion/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { formatCode } from "@/lib/production-utils";
import type { ProductionBatch } from "@/types/production";

interface ProductionFailModalProps {
  batch: ProductionBatch;
  onClose: () => void;
}

const labelClass =
  "text-xs font-medium tracking-wide text-zinc-600 uppercase dark:text-zinc-300";

export function ProductionFailModal({
  batch,
  onClose,
}: ProductionFailModalProps) {
  const [wasteGrams, setWasteGrams] = useState(
    String(Math.round(batch.copies * batch.gramsPerUnit)),
  );
  const [reason, setReason] = useState(batch.wasteReason ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const result = await markBatchFailed(
      batch.id,
      Number(wasteGrams),
      reason.trim() === "" ? null : reason,
    );

    if (!result.success) {
      setError(result.error);
      setBusy(false);
      return;
    }

    setBusy(false);
    onClose();
  }

  return (
    <Modal open onClose={onClose} title="Marcar lote como fallido">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Lote <span className="font-medium">{formatCode(batch.code)}</span>. La
          merma se descontará del filamento seleccionado.
        </p>

        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Merma (g)</span>
          <Input
            type="number"
            min="0"
            step="0.1"
            value={wasteGrams}
            onChange={(event) => setWasteGrams(event.target.value)}
            required
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Motivo</span>
          <Input
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Atasco, warping, falta de material..."
          />
        </label>

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
          <Button
            type="submit"
            disabled={busy}
            className="bg-red-600 hover:bg-red-700"
          >
            {busy ? "Guardando..." : "Marcar fallido"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
