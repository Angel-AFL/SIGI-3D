"use client";

import { useState, type FormEvent } from "react";
import {
  createBatch,
  updateBatch,
} from "@/app/(app)/produccion/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { formatGrams } from "@/lib/inventory-utils";
import { formatCurrency } from "@/lib/order-utils";
import {
  BATCH_STATUSES,
  BATCH_STATUS_LABELS,
  computePlan,
  formatCode,
  formatDuration,
  gramsPerUnit as modelGramsPerUnit,
  unitsPerBed as computeUnitsPerBed,
} from "@/lib/production-utils";
import type {
  BatchStatus,
  PrinterProfile,
  ProductionBatch,
  ProductionFilamentOption,
  ProductionModelOption,
} from "@/types/production";

interface ProductionBatchFormModalProps {
  onClose: () => void;
  batch: ProductionBatch | null;
  printers: PrinterProfile[];
  models: ProductionModelOption[];
  filaments: ProductionFilamentOption[];
}

const labelClass =
  "text-xs font-medium tracking-wide text-zinc-600 uppercase dark:text-zinc-300";

const textareaClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-brand focus-visible:ring-2 focus-visible:ring-brand/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500";

export function ProductionBatchFormModal({
  onClose,
  batch,
  printers,
  models,
  filaments,
}: ProductionBatchFormModalProps) {
  const [modelId, setModelId] = useState(batch?.modelId ?? "");
  const [printerId, setPrinterId] = useState(batch?.printerId ?? "");
  const [filamentId, setFilamentId] = useState(batch?.filamentId ?? "");
  const [copies, setCopies] = useState(String(batch?.copies ?? 1));
  const [unitsPerBed, setUnitsPerBed] = useState(
    batch ? String(batch.unitsPerBed) : "",
  );
  const [gramsPerUnit, setGramsPerUnit] = useState(
    batch ? String(batch.gramsPerUnit) : "",
  );
  const [minutesPerBed, setMinutesPerBed] = useState(
    batch ? String(batch.minutesPerBed) : "",
  );
  const [status, setStatus] = useState<BatchStatus>(batch?.status ?? "en_cola");
  const [notes, setNotes] = useState(batch?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const selectedModel = models.find((model) => model.id === modelId) ?? null;
  const selectedPrinter = printers.find((printer) => printer.id === printerId);
  const selectedFilament =
    filaments.find((filament) => filament.id === filamentId) ?? null;

  const plan = computePlan({
    copies: Number(copies) || 0,
    unitsPerBed: unitsPerBed.trim() === "" ? null : Number(unitsPerBed),
    minutesPerBed: Number(minutesPerBed) || 0,
    gramsPerUnit: Number(gramsPerUnit) || 0,
    pricePerKg: selectedFilament?.pricePerKg ?? null,
    costPerHour: selectedPrinter?.costPerHour ?? 0,
  });

  function suggestUnits(model: ProductionModelOption | null, printerIdValue: string) {
    const printer = printers.find((item) => item.id === printerIdValue);
    return computeUnitsPerBed(
      model?.dimensions ?? null,
      printer?.bedX ?? null,
      printer?.bedY ?? null,
      printer?.bedZ ?? null,
    );
  }

  function handleModelChange(value: string) {
    setModelId(value);
    const model = models.find((item) => item.id === value) ?? null;

    if (!model) {
      setGramsPerUnit("");
      setMinutesPerBed("");
      setUnitsPerBed("");
      return;
    }

    const grams = modelGramsPerUnit(model);
    setGramsPerUnit(grams === null ? "" : String(grams));
    setMinutesPerBed(
      model.estimatedMinutes === null ? "" : String(model.estimatedMinutes),
    );
    const units = suggestUnits(model, printerId);
    setUnitsPerBed(units === null ? "" : String(units));
  }

  function handlePrinterChange(value: string) {
    setPrinterId(value);
    const units = suggestUnits(selectedModel, value);
    setUnitsPerBed(units === null ? "" : String(units));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const input = {
      printerId: printerId === "" ? null : printerId,
      modelId: modelId === "" ? null : modelId,
      filamentId: filamentId === "" ? null : filamentId,
      copies: Number(copies),
      unitsPerBed: Number(unitsPerBed),
      material: selectedModel?.material ?? null,
      gramsPerUnit: Number(gramsPerUnit),
      minutesPerBed: Number(minutesPerBed),
      status,
      notes: notes.trim() === "" ? null : notes,
    };

    const result = batch
      ? await updateBatch(batch.id, input)
      : await createBatch(input);

    if (!result.success) {
      setError(result.error);
      setBusy(false);
      return;
    }

    setBusy(false);
    onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={batch ? "Editar lote" : "Nuevo lote de producción"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className={labelClass}>Modelo</span>
            <Select
              value={modelId}
              onChange={(event) => handleModelChange(event.target.value)}
            >
              <option value="">Sin modelo</option>
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  Modelo {formatCode(model.code)} ({model.name})
                </option>
              ))}
            </Select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Copias</span>
            <Input
              type="number"
              min="1"
              step="1"
              value={copies}
              onChange={(event) => setCopies(event.target.value)}
              required
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Estado</span>
            <Select
              value={status}
              onChange={(event) => setStatus(event.target.value as BatchStatus)}
            >
              {BATCH_STATUSES.map((option) => (
                <option key={option} value={option}>
                  {BATCH_STATUS_LABELS[option]}
                </option>
              ))}
            </Select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Impresora</span>
            <Select
              value={printerId}
              onChange={(event) => handlePrinterChange(event.target.value)}
            >
              <option value="">Sin impresora</option>
              {printers.map((printer) => (
                <option key={printer.id} value={printer.id}>
                  {formatCode(printer.code)} {printer.name}
                </option>
              ))}
            </Select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Filamento</span>
            <Select
              value={filamentId}
              onChange={(event) => setFilamentId(event.target.value)}
            >
              <option value="">Sin filamento</option>
              {filaments.map((filament) => (
                <option key={filament.id} value={filament.id}>
                  {formatCode(filament.code)} {filament.material}{" "}
                  {filament.color}
                </option>
              ))}
            </Select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Piezas por cama</span>
            <Input
              type="number"
              min="1"
              step="1"
              value={unitsPerBed}
              onChange={(event) => setUnitsPerBed(event.target.value)}
              placeholder="Auto"
              required
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Gramos por pieza</span>
            <Input
              type="number"
              min="0"
              step="0.1"
              value={gramsPerUnit}
              onChange={(event) => setGramsPerUnit(event.target.value)}
              placeholder="Auto"
              required
            />
          </label>

          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className={labelClass}>Minutos por cama</span>
            <Input
              type="number"
              min="0"
              step="1"
              value={minutesPerBed}
              onChange={(event) => setMinutesPerBed(event.target.value)}
              placeholder="Auto"
              required
            />
          </label>

          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className={labelClass}>Notas</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              placeholder="Parámetros, material, acabado..."
              className={textareaClass}
            />
          </label>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-800/50">
          <p className="mb-2 text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
            Previsualización del lote
          </p>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            <dt className="text-zinc-500 dark:text-zinc-400">Piezas por cama</dt>
            <dd className="text-right font-medium text-zinc-800 dark:text-zinc-100">
              {plan.unitsPerBed ?? "—"}
            </dd>
            <dt className="text-zinc-500 dark:text-zinc-400">Camas</dt>
            <dd className="text-right font-medium text-zinc-800 dark:text-zinc-100">
              {plan.beds ?? "—"}
            </dd>
            <dt className="text-zinc-500 dark:text-zinc-400">Tiempo total</dt>
            <dd className="text-right font-medium text-zinc-800 dark:text-zinc-100">
              {formatDuration(plan.totalMinutes)}
            </dd>
            <dt className="text-zinc-500 dark:text-zinc-400">Filamento total</dt>
            <dd className="text-right font-medium text-zinc-800 dark:text-zinc-100">
              {formatGrams(plan.totalGrams)}
            </dd>
            <dt className="text-zinc-500 dark:text-zinc-400">Costo material</dt>
            <dd className="text-right font-medium text-zinc-800 dark:text-zinc-100">
              {plan.materialCost === null
                ? "—"
                : formatCurrency(plan.materialCost)}
            </dd>
            <dt className="text-zinc-500 dark:text-zinc-400">Costo máquina</dt>
            <dd className="text-right font-medium text-zinc-800 dark:text-zinc-100">
              {formatCurrency(plan.machineCost)}
            </dd>
            <dt className="font-semibold text-zinc-700 dark:text-zinc-200">
              Costo total
            </dt>
            <dd className="text-right font-semibold text-brand dark:text-sky-300">
              {plan.totalCost === null ? "—" : formatCurrency(plan.totalCost)}
            </dd>
          </dl>
        </div>

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
            {busy
              ? "Guardando..."
              : batch
                ? "Guardar cambios"
                : "Crear lote"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
