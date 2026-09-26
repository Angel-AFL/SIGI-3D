"use client";

import { useState, type FormEvent } from "react";
import {
  createPrinterProfile,
  updatePrinterProfile,
} from "@/app/(app)/produccion/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import {
  PRINTER_STATUSES,
  PRINTER_STATUS_LABELS,
} from "@/lib/production-utils";
import type { PrinterProfile, PrinterStatus } from "@/types/production";

interface ProductionPrinterFormModalProps {
  onClose: () => void;
  printer: PrinterProfile | null;
}

const labelClass =
  "text-xs font-medium tracking-wide text-zinc-600 uppercase dark:text-zinc-300";

const textareaClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-brand focus-visible:ring-2 focus-visible:ring-brand/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500";

function toInputValue(value: number | null): string {
  return value === null ? "" : String(value);
}

export function ProductionPrinterFormModal({
  onClose,
  printer,
}: ProductionPrinterFormModalProps) {
  const [name, setName] = useState(printer?.name ?? "");
  const [status, setStatus] = useState<PrinterStatus>(
    printer?.status ?? "disponible",
  );
  const [bedX, setBedX] = useState(toInputValue(printer?.bedX ?? null));
  const [bedY, setBedY] = useState(toInputValue(printer?.bedY ?? null));
  const [bedZ, setBedZ] = useState(toInputValue(printer?.bedZ ?? null));
  const [nozzleDiameter, setNozzleDiameter] = useState(
    String(printer?.nozzleDiameter ?? 0.4),
  );
  const [costPerHour, setCostPerHour] = useState(
    String(printer?.costPerHour ?? 0),
  );
  const [notes, setNotes] = useState(printer?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const input = {
      name,
      status,
      bedX: bedX.trim() === "" ? null : Number(bedX),
      bedY: bedY.trim() === "" ? null : Number(bedY),
      bedZ: bedZ.trim() === "" ? null : Number(bedZ),
      nozzleDiameter: Number(nozzleDiameter),
      costPerHour: Number(costPerHour),
      notes: notes.trim() === "" ? null : notes,
    };

    const result = printer
      ? await updatePrinterProfile(printer.id, input)
      : await createPrinterProfile(input);

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
      title={printer ? "Editar perfil" : "Nuevo perfil de impresora"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Nombre / modelo</span>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Anycubic Kobra 2 Neo"
              required
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Estado</span>
            <Select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as PrinterStatus)
              }
            >
              {PRINTER_STATUSES.map((option) => (
                <option key={option} value={option}>
                  {PRINTER_STATUS_LABELS[option]}
                </option>
              ))}
            </Select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Cama X (mm)</span>
            <Input
              type="number"
              min="0"
              step="1"
              value={bedX}
              onChange={(event) => setBedX(event.target.value)}
              placeholder="220"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Cama Y (mm)</span>
            <Input
              type="number"
              min="0"
              step="1"
              value={bedY}
              onChange={(event) => setBedY(event.target.value)}
              placeholder="220"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Cama Z (mm)</span>
            <Input
              type="number"
              min="0"
              step="1"
              value={bedZ}
              onChange={(event) => setBedZ(event.target.value)}
              placeholder="250"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Boquilla (mm)</span>
            <Input
              type="number"
              min="0"
              step="0.1"
              value={nozzleDiameter}
              onChange={(event) => setNozzleDiameter(event.target.value)}
              required
            />
          </label>

          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className={labelClass}>Costo por hora (MXN)</span>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={costPerHour}
              onChange={(event) => setCostPerHour(event.target.value)}
              placeholder="0"
            />
          </label>

          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className={labelClass}>Notas</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              placeholder="Boquilla, mantenimiento, ubicación..."
              className={textareaClass}
            />
          </label>
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
              : printer
                ? "Guardar cambios"
                : "Crear perfil"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
