"use client";

import { useMemo, useState } from "react";
import { Bot, Plus } from "lucide-react";
import { deleteModel, markModelViewed } from "@/app/(app)/modelos/actions";
import { ModelDetails } from "@/components/viewer/model-details";
import { ModelFormModal } from "@/components/viewer/model-form-modal";
import { ModelList } from "@/components/viewer/model-list";
import { ModelToolbar } from "@/components/viewer/model-toolbar";
import { StlViewer } from "@/components/viewer/stl-viewer";
import { ViewerStats } from "@/components/viewer/viewer-stats";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import type { Model3D, Model3DStats } from "@/types/viewer";

interface ViewerViewProps {
  models: Model3D[];
  userId: string;
  ownerEmail: string;
  stats: Model3DStats;
}

export function ViewerView({
  models,
  userId,
  ownerEmail,
  stats,
}: ViewerViewProps) {
  const [query, setQuery] = useState("");
  const [material, setMaterial] = useState("todos");
  const [selectedId, setSelectedId] = useState<string | null>(
    models[0]?.id ?? null,
  );
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Model3D | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Model3D | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const materials = useMemo(
    () => Array.from(new Set(models.map((model) => model.material))).sort(),
    [models],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();

    return models.filter((model) => {
      const matchesMaterial = material === "todos" || model.material === material;

      if (!matchesMaterial) {
        return false;
      }

      if (term === "") {
        return true;
      }

      return [model.name, model.material, String(model.code)]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [models, query, material]);

  const selected = useMemo(
    () =>
      filtered.find((model) => model.id === selectedId) ??
      filtered[0] ??
      null,
    [filtered, selectedId],
  );

  const recentViews = useMemo(
    () =>
      models.filter(
        (model) => model.lastViewedAt !== null || viewedIds.has(model.id),
      ).length,
    [models, viewedIds],
  );

  function handleSelect(model: Model3D) {
    setSelectedId(model.id);

    if (!model.lastViewedAt && !viewedIds.has(model.id)) {
      setViewedIds((prev) => new Set(prev).add(model.id));
      void markModelViewed(model.id);
    }
  }

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(model: Model3D) {
    setEditing(model);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);
    setDeleteError(null);

    const result = await deleteModel(deleteTarget.id);

    if (!result.success) {
      setDeleteError(result.error);
      setDeleting(false);
      return;
    }

    if (selectedId === deleteTarget.id) {
      setSelectedId(null);
    }

    setDeleting(false);
    setDeleteTarget(null);
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold tracking-wide text-zinc-700 uppercase dark:text-zinc-200">
          Galería de modelos
        </h2>
        <Button size="sm" onClick={openCreate}>
          <Plus className="size-4" aria-hidden="true" />
          Cargar modelo
        </Button>
      </div>

      <ViewerStats stats={{ total: stats.total, recentViews }} />

      {models.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
          <p>Todavía no hay modelos cargados.</p>
          <Button size="sm" onClick={openCreate}>
            <Plus className="size-4" aria-hidden="true" />
            Cargar modelo
          </Button>
        </Card>
      ) : (
        <>
          <ModelToolbar
            query={query}
            onQueryChange={setQuery}
            material={material}
            onMaterialChange={setMaterial}
            materials={materials}
          />

          {filtered.length === 0 || !selected ? (
            <Card className="p-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
              No hay modelos que coincidan con la búsqueda.
            </Card>
          ) : (
            <div className="grid gap-4 lg:grid-cols-[16rem_minmax(0,1fr)] xl:grid-cols-[16rem_minmax(0,1fr)_18rem]">
              <ModelList
                models={filtered}
                selectedId={selected.id}
                onSelect={handleSelect}
              />

              <div className="relative">
                {selected.fileUrl ? (
                  <StlViewer url={selected.fileUrl} name={selected.name} />
                ) : (
                  <Card className="flex h-[24rem] items-center justify-center p-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    Vista previa no disponible para este modelo.
                  </Card>
                )}

                <button
                  type="button"
                  onClick={() =>
                    window.dispatchEvent(new CustomEvent("sigi:open-chat"))
                  }
                  aria-label="Abrir IA Asistente (DeepSeek)"
                  className="absolute right-3 bottom-3 flex flex-col items-center gap-1"
                >
                  <span className="flex size-12 items-center justify-center rounded-full bg-brand text-white shadow-lg transition-colors hover:bg-brand-hover">
                    <Bot className="size-6" aria-hidden="true" />
                  </span>
                  <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-zinc-600 backdrop-blur dark:bg-zinc-900/90 dark:text-zinc-300">
                    IA Asistente
                  </span>
                </button>
              </div>

              <div className="col-span-full xl:col-span-1">
                <ModelDetails
                  model={selected}
                  ownerEmail={ownerEmail}
                  onEdit={openEdit}
                  onDelete={(model) => {
                    setDeleteError(null);
                    setDeleteTarget(model);
                  }}
                />
              </div>
            </div>
          )}
        </>
      )}

      {formOpen ? (
        <ModelFormModal
          key={editing?.id ?? "new"}
          onClose={() => setFormOpen(false)}
          model={editing}
          userId={userId}
        />
      ) : null}

      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar modelo"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            ¿Seguro que quieres eliminar{" "}
            <span className="font-medium">
              #{String(deleteTarget?.code ?? 0).padStart(3, "0")} ·{" "}
              {deleteTarget?.name}
            </span>
            ? Se borrará el archivo STL y su miniatura. Esta acción no se puede
            deshacer.
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
