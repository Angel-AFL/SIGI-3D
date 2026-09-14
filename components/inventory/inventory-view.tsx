"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { deleteFilament } from "@/app/(app)/inventario/actions";
import { ConsumeModal } from "@/components/inventory/consume-modal";
import { FilamentFormModal } from "@/components/inventory/filament-form-modal";
import { FilamentTable } from "@/components/inventory/filament-table";
import {
  InventoryToolbar,
  type StatusFilter,
} from "@/components/inventory/inventory-toolbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { getFilamentStatus } from "@/lib/inventory-utils";
import type { Filament } from "@/types/inventory";

export function InventoryView({ filaments }: { filaments: Filament[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("todos");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Filament | null>(null);
  const [consumeTarget, setConsumeTarget] = useState<Filament | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Filament | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();

    return filaments.filter((filament) => {
      const matchesStatus =
        status === "todos" ||
        getFilamentStatus(filament.weightCurrentG, filament.minStockG) === status;

      if (!matchesStatus) {
        return false;
      }

      if (term === "") {
        return true;
      }

      return [
        filament.material,
        filament.color,
        filament.brand,
        filament.location ?? "",
        String(filament.code),
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [filaments, query, status]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(filament: Filament) {
    setEditing(filament);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);
    setDeleteError(null);

    const result = await deleteFilament(deleteTarget.id);

    if (!result.success) {
      setDeleteError(result.error);
      setDeleting(false);
      return;
    }

    setDeleting(false);
    setDeleteTarget(null);
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold tracking-wide text-zinc-700 uppercase dark:text-zinc-200">
          Detalle de inventario (Vista completa)
        </h2>
        <Button size="sm" onClick={openCreate}>
          <Plus className="size-4" aria-hidden="true" />
          Nuevo carrete
        </Button>
      </div>

      <InventoryToolbar
        query={query}
        onQueryChange={setQuery}
        status={status}
        onStatusChange={setStatus}
      />

      {filaments.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
          <p>Todavía no hay carretes registrados.</p>
          <Button size="sm" onClick={openCreate}>
            <Plus className="size-4" aria-hidden="true" />
            Añadir carrete
          </Button>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="p-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          No hay carretes que coincidan con la búsqueda.
        </Card>
      ) : (
        <FilamentTable
          filaments={filtered}
          onEdit={openEdit}
          onConsume={setConsumeTarget}
          onDelete={(filament) => {
            setDeleteError(null);
            setDeleteTarget(filament);
          }}
        />
      )}

      {formOpen ? (
        <FilamentFormModal
          key={editing?.id ?? "new"}
          onClose={() => setFormOpen(false)}
          filament={editing}
        />
      ) : null}

      {consumeTarget ? (
        <ConsumeModal
          key={consumeTarget.id}
          onClose={() => setConsumeTarget(null)}
          filament={consumeTarget}
        />
      ) : null}

      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar carrete"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            ¿Seguro que quieres eliminar{" "}
            <span className="font-medium">
              {deleteTarget?.material} · {deleteTarget?.color}
            </span>
            ? Esta acción no se puede deshacer.
          </p>

          {deleteError ? (
            <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
              {deleteError}
            </p>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
