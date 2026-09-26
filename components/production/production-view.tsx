"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import {
  deleteBatch,
  deletePrinterProfile,
  updateBatchStatus,
} from "@/app/(app)/produccion/actions";
import { ProductionBatchFormModal } from "@/components/production/production-batch-form-modal";
import { ProductionBatchList } from "@/components/production/production-batch-list";
import { ProductionFailModal } from "@/components/production/production-fail-modal";
import { ProductionPrinterFormModal } from "@/components/production/production-printer-form-modal";
import { ProductionPrinterList } from "@/components/production/production-printer-list";
import {
  ProductionToolbar,
  type BatchStatusFilter,
} from "@/components/production/production-toolbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { formatCode } from "@/lib/production-utils";
import type {
  BatchStatus,
  PrinterProfile,
  ProductionBatch,
  ProductionFilamentOption,
  ProductionModelOption,
} from "@/types/production";

interface ProductionViewProps {
  printers: PrinterProfile[];
  batches: ProductionBatch[];
  modelOptions: ProductionModelOption[];
  filamentOptions: ProductionFilamentOption[];
}

type DeleteTarget =
  | { type: "printer"; printer: PrinterProfile }
  | { type: "batch"; batch: ProductionBatch };

export function ProductionView({
  printers,
  batches: initialBatches,
  modelOptions,
  filamentOptions,
}: ProductionViewProps) {
  const [batches, applyOptimisticStatus] = useOptimistic(
    initialBatches,
    (state, update: { id: string; status: BatchStatus }) =>
      state.map((batch) =>
        batch.id === update.id ? { ...batch, status: update.status } : batch,
      ),
  );
  const [, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<BatchStatusFilter>("todos");
  const [printerFormOpen, setPrinterFormOpen] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<PrinterProfile | null>(
    null,
  );
  const [batchFormOpen, setBatchFormOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<ProductionBatch | null>(null);
  const [failTarget, setFailTarget] = useState<ProductionBatch | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();

    return batches.filter((batch) => {
      const matchesStatus = status === "todos" || batch.status === status;

      if (!matchesStatus) {
        return false;
      }

      if (term === "") {
        return true;
      }

      return [
        String(batch.code),
        batch.modelName ?? "",
        batch.printerName ?? "",
        batch.material ?? "",
        batch.notes ?? "",
        batch.filamentLabel ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [batches, query, status]);

  function openCreatePrinter() {
    setEditingPrinter(null);
    setPrinterFormOpen(true);
  }

  function openEditPrinter(printer: PrinterProfile) {
    setEditingPrinter(printer);
    setPrinterFormOpen(true);
  }

  function openCreateBatch() {
    setEditingBatch(null);
    setBatchFormOpen(true);
  }

  function openEditBatch(batch: ProductionBatch) {
    setEditingBatch(batch);
    setBatchFormOpen(true);
  }

  function handleStatusChange(batch: ProductionBatch, nextStatus: BatchStatus) {
    setStatusError(null);

    startTransition(async () => {
      applyOptimisticStatus({ id: batch.id, status: nextStatus });

      const result = await updateBatchStatus(batch.id, nextStatus);

      if (!result.success) {
        setStatusError(result.error);
      }
    });
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);
    setDeleteError(null);

    const result =
      deleteTarget.type === "printer"
        ? await deletePrinterProfile(deleteTarget.printer.id)
        : await deleteBatch(deleteTarget.batch.id);

    if (!result.success) {
      setDeleteError(result.error);
      setDeleting(false);
      return;
    }

    setDeleting(false);
    setDeleteTarget(null);
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold tracking-wide text-zinc-700 uppercase dark:text-zinc-200">
            Lotes de producción
          </h2>
          <Button size="sm" onClick={openCreateBatch}>
            <Plus className="size-4" aria-hidden="true" />
            Nuevo lote
          </Button>
        </div>

        {batches.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 p-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
            <p>Todavía no hay lotes planificados.</p>
            <Button size="sm" onClick={openCreateBatch}>
              <Plus className="size-4" aria-hidden="true" />
              Planificar lote
            </Button>
          </Card>
        ) : (
          <>
            <ProductionToolbar
              query={query}
              onQueryChange={setQuery}
              status={status}
              onStatusChange={setStatus}
            />

            {statusError ? (
              <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                {statusError}
              </p>
            ) : null}

            {filtered.length === 0 ? (
              <Card className="p-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                No hay lotes que coincidan con la búsqueda.
              </Card>
            ) : (
              <ProductionBatchList
                batches={filtered}
                printers={printers}
                filamentOptions={filamentOptions}
                onStatusChange={handleStatusChange}
                onMarkFailed={setFailTarget}
                onEdit={openEditBatch}
                onDelete={(batch) => {
                  setDeleteError(null);
                  setDeleteTarget({ type: "batch", batch });
                }}
              />
            )}
          </>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold tracking-wide text-zinc-700 uppercase dark:text-zinc-200">
            Perfiles de impresora
          </h2>
          <Button size="sm" variant="secondary" onClick={openCreatePrinter}>
            <Plus className="size-4" aria-hidden="true" />
            Nuevo perfil
          </Button>
        </div>

        {printers.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 p-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
            <p>
              Registra tu impresora con el tamaño de cama para calcular cuántas
              piezas caben por lote.
            </p>
            <Button size="sm" onClick={openCreatePrinter}>
              <Plus className="size-4" aria-hidden="true" />
              Registrar impresora
            </Button>
          </Card>
        ) : (
          <ProductionPrinterList
            printers={printers}
            onEdit={openEditPrinter}
            onDelete={(printer) => {
              setDeleteError(null);
              setDeleteTarget({ type: "printer", printer });
            }}
          />
        )}
      </section>

      {printerFormOpen ? (
        <ProductionPrinterFormModal
          key={editingPrinter?.id ?? "new-printer"}
          onClose={() => setPrinterFormOpen(false)}
          printer={editingPrinter}
        />
      ) : null}

      {batchFormOpen ? (
        <ProductionBatchFormModal
          key={editingBatch?.id ?? "new-batch"}
          onClose={() => setBatchFormOpen(false)}
          batch={editingBatch}
          printers={printers}
          models={modelOptions}
          filaments={filamentOptions}
        />
      ) : null}

      {failTarget ? (
        <ProductionFailModal
          key={failTarget.id}
          batch={failTarget}
          onClose={() => setFailTarget(null)}
        />
      ) : null}

      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title={
          deleteTarget?.type === "batch"
            ? "Eliminar lote"
            : "Eliminar perfil de impresora"
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            {deleteTarget?.type === "batch" ? (
              <>
                ¿Seguro que quieres eliminar el lote{" "}
                <span className="font-medium">
                  {formatCode(deleteTarget.batch.code)}
                </span>
                ? Si ya había descontado filamento, se devolverá al carrete.
              </>
            ) : deleteTarget ? (
              <>
                ¿Seguro que quieres eliminar el perfil{" "}
                <span className="font-medium">
                  {formatCode(deleteTarget.printer.code)} ·{" "}
                  {deleteTarget.printer.name}
                </span>
                ? Los lotes quedarán sin impresora asignada.
              </>
            ) : null}
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
    </div>
  );
}
