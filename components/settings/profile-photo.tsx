"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState, useTransition } from "react";
import { ImagePlus, Trash2, User } from "lucide-react";
import { removeAvatar, updateAvatar } from "@/app/ajustes/actions";

export function ProfilePhoto({ avatarUrl }: { avatarUrl: string | null }) {
  const [pending, startTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setPreview(file ? URL.createObjectURL(file) : null);
    setError(null);
  }

  function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await updateAvatar({}, formData);

      if (result.error) {
        setError(result.error);
        return;
      }

      setPreview(null);
      setError(null);
      form.reset();
    });
  }

  function handleRemove() {
    startTransition(async () => {
      const result = await removeAvatar();

      if (result.error) {
        setError(result.error);
        return;
      }

      setPreview(null);
      setError(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    });
  }

  const currentSrc = preview ?? avatarUrl;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-300 bg-zinc-100 text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800">
        {currentSrc ? (
          <img
            src={currentSrc}
            alt="Foto de perfil"
            className="size-full object-cover"
          />
        ) : (
          <User className="size-8" aria-hidden="true" />
        )}
      </div>

      <div className="flex flex-col gap-3">
        <form
          onSubmit={handleUpload}
          className="flex flex-wrap items-center gap-2"
        >
          <input
            ref={inputRef}
            type="file"
            name="avatar"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
            className="w-full text-sm text-zinc-600 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-zinc-700 hover:file:bg-zinc-200 sm:w-auto dark:text-zinc-300 dark:file:bg-zinc-800 dark:file:text-zinc-200 dark:hover:file:bg-zinc-700"
          />
          <button
            type="submit"
            disabled={pending || !preview}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:pointer-events-none disabled:opacity-50"
          >
            <ImagePlus className="size-4" aria-hidden="true" />
            {pending ? "Guardando…" : "Guardar foto"}
          </button>
        </form>

        {avatarUrl ? (
          <button
            type="button"
            onClick={handleRemove}
            disabled={pending}
            className="inline-flex items-center gap-2 self-start text-sm font-medium text-red-600 transition-colors hover:text-red-700 disabled:pointer-events-none disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Eliminar foto
          </button>
        ) : null}

        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          PNG, JPEG o WebP. Tamaño máximo 2 MB.
        </p>

        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : null}
      </div>
    </div>
  );
}
