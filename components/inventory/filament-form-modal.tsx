"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { createFilament, updateFilament } from "@/app/(app)/inventario/actions";
import { FILAMENT_MATERIALS } from "@/lib/inventory-utils";
import type { Filament } from "@/types/inventory";

interface FilamentFormModalProps {
  onClose: () => void;
  filament: Filament | null;
}

const labelClass =
  "text-xs font-medium tracking-wide text-zinc-600 uppercase dark:text-zinc-300";

export function FilamentFormModal({
  onClose,
  filament,
}: FilamentFormModalProps) {
  const [material, setMaterial] = useState(filament?.material ?? "");
  const [color, setColor] = useState(filament?.color ?? "");
  const [brand, setBrand] = useState(filament?.brand ?? "");
  const [weightCurrentG, setWeightCurrentG] = useState(
    String(filament?.weightCurrentG ?? 0),
  );
  const [weightInitialG, setWeightInitialG] = useState(
    filament?.weightInitialG === null || filament?.weightInitialG === undefined
      ? ""
      : String(filament.weightInitialG),
  );
  const [location, setLocation] = useState(filament?.location ?? "");
  const [minStockG, setMinStockG] = useState(String(filament?.minStockG ?? 250));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const input = {
      material,
      color,
      brand,
      weightCurrentG: Number(weightCurrentG),
      weightInitialG: weightInitialG.trim() === "" ? null : Number(weightInitialG),
      location: location.trim() === "" ? null : location,
      minStockG: Number(minStockG),
    };

    const result = filament
      ? await updateFilament(filament.id, input)
      : await createFilament(input);

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
      title={filament ? "Editar carrete" : "Nuevo carrete"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Material</span>
            <Input
              list="filament-materials"
              value={material}
              onChange={(event) => setMaterial(event.target.value)}
              placeholder="PLA"
              required
            />
            <datalist id="filament-materials">
              {FILAMENT_MATERIALS.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Color</span>
            <Input
              value={color}
              onChange={(event) => setColor(event.target.value)}
              placeholder="Rojo Fuego"
              required
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Marca</span>
            <Input
              value={brand}
              onChange={(event) => setBrand(event.target.value)}
              placeholder="Creatity"
              required
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Ubicación</span>
            <Input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Estante A1"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Peso actual (g)</span>
            <Input
              type="number"
              min="0"
              step="1"
              value={weightCurrentG}
              onChange={(event) => setWeightCurrentG(event.target.value)}
              required
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Peso inicial (g)</span>
            <Input
              type="number"
              min="0"
              step="1"
              value={weightInitialG}
              onChange={(event) => setWeightInitialG(event.target.value)}
              placeholder="Opcional"
            />
          </label>

          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className={labelClass}>Mínimo de stock (g)</span>
            <Input
              type="number"
              min="0"
              step="1"
              value={minStockG}
              onChange={(event) => setMinStockG(event.target.value)}
              required
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
            {busy ? "Guardando..." : filament ? "Guardar cambios" : "Crear carrete"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
