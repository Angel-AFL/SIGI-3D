"use client";

import { useState, type DragEvent, type FormEvent } from "react";
import { FileBox, UploadCloud } from "lucide-react";
import { createModel, updateModel } from "@/app/(app)/modelos/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { generateThumbnail, parseStl } from "@/lib/stl-client";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { MODEL_MATERIALS } from "@/lib/viewer-utils";
import type { Model3D } from "@/types/viewer";

interface ModelFormModalProps {
  onClose: () => void;
  model: Model3D | null;
  userId: string;
}

const MAX_FILE_BYTES = 50 * 1024 * 1024;

const labelClass =
  "text-xs font-medium tracking-wide text-zinc-600 uppercase dark:text-zinc-300";

export function ModelFormModal({ onClose, model, userId }: ModelFormModalProps) {
  const [name, setName] = useState(model?.name ?? "");
  const [material, setMaterial] = useState(model?.material ?? "");
  const [estimatedMinutes, setEstimatedMinutes] = useState(
    model?.estimatedMinutes ? String(model.estimatedMinutes) : "",
  );
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) {
      setFile(dropped);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedMaterial = material.trim();

    if (!trimmedName || !trimmedMaterial) {
      setError("Nombre y material son obligatorios.");
      return;
    }

    const minutes =
      estimatedMinutes.trim() === "" ? null : Number(estimatedMinutes);

    setBusy(true);

    if (model) {
      const result = await updateModel(model.id, {
        name: trimmedName,
        material: trimmedMaterial,
        estimatedMinutes: minutes,
      });

      if (!result.success) {
        setError(result.error);
        setBusy(false);
        return;
      }

      setBusy(false);
      onClose();
      return;
    }

    if (!file) {
      setError("Selecciona un archivo STL.");
      setBusy(false);
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      setError("El archivo supera el límite de 50 MB.");
      setBusy(false);
      return;
    }

    const supabase = createBrowserSupabaseClient();
    const modelId = crypto.randomUUID();
    const basePath = `${userId}/${modelId}`;
    const filePath = `${basePath}/model.stl`;
    const thumbPath = `${basePath}/thumb.png`;

    let dimensions = null;
    let thumbnailBlob: Blob | null = null;

    try {
      const buffer = await file.arrayBuffer();
      const parsed = parseStl(buffer);
      dimensions = parsed.dimensions;
      thumbnailBlob = await generateThumbnail(parsed.geometry);
      parsed.geometry.dispose();
    } catch {
      setError("El archivo no es un STL válido.");
      setBusy(false);
      return;
    }

    const { error: uploadError } = await supabase.storage
      .from("models")
      .upload(filePath, file, { contentType: "model/stl", upsert: false });

    if (uploadError) {
      setError(`No se pudo subir el archivo: ${uploadError.message}`);
      setBusy(false);
      return;
    }

    let uploadedThumbnail = false;

    if (thumbnailBlob) {
      const { error: thumbError } = await supabase.storage
        .from("models")
        .upload(thumbPath, thumbnailBlob, {
          contentType: "image/png",
          upsert: false,
        });

      uploadedThumbnail = !thumbError;
    }

    const result = await createModel({
      name: trimmedName,
      material: trimmedMaterial,
      estimatedMinutes: minutes,
      dimensions,
      filePath,
      fileName: file.name,
      fileSizeBytes: file.size,
      thumbnailPath: uploadedThumbnail ? thumbPath : null,
    });

    if (!result.success) {
      await supabase.storage
        .from("models")
        .remove(uploadedThumbnail ? [filePath, thumbPath] : [filePath]);
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
      title={model ? "Editar modelo" : "Cargar modelo 3D"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Nombre</span>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Soporte"
              required
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Material</span>
            <Input
              list="model-materials"
              value={material}
              onChange={(event) => setMaterial(event.target.value)}
              placeholder="PLA"
              required
            />
            <datalist id="model-materials">
              {MODEL_MATERIALS.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </label>

          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className={labelClass}>Tiempo estimado (min)</span>
            <Input
              type="number"
              min="0"
              step="5"
              value={estimatedMinutes}
              onChange={(event) => setEstimatedMinutes(event.target.value)}
              placeholder="Opcional"
            />
          </label>
        </div>

        {!model ? (
          <label
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed px-4 py-8 text-center transition-colors ${
              dragging
                ? "border-brand bg-brand/5 dark:border-sky-500"
                : "border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800/50"
            }`}
          >
            {file ? (
              <>
                <FileBox className="size-8 text-brand dark:text-sky-300" aria-hidden="true" />
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                  {file.name}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </>
            ) : (
              <>
                <UploadCloud className="size-8 text-zinc-400" aria-hidden="true" />
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                  Arrastra un archivo .stl o haz clic para elegirlo
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  Máximo 50 MB
                </span>
              </>
            )}
            <input
              type="file"
              accept=".stl,model/stl,application/sla"
              className="sr-only"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </label>
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
            {busy
              ? "Procesando..."
              : model
                ? "Guardar cambios"
                : "Cargar modelo"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
