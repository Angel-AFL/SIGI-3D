"use client";

import { useEffect, useState } from "react";
import { Bot, X } from "lucide-react";

export function ChatWidget() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleOpen() {
      setOpen(true);
    }

    window.addEventListener("sigi:open-chat", handleOpen);
    return () => window.removeEventListener("sigi:open-chat", handleOpen);
  }, []);

  return (
    <div className="fixed right-4 bottom-20 z-40 flex flex-col items-end gap-3 lg:right-6 lg:bottom-6">
      {open ? (
        <div className="w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Bot className="size-5 text-brand dark:text-sky-300" aria-hidden="true" />
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                IA Asistente
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar asistente"
              className="text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
          <p className="px-4 py-6 text-sm text-zinc-500 dark:text-zinc-400">
            El asistente DeepSeek estará disponible próximamente.
          </p>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Abrir IA Asistente (DeepSeek)"
        aria-expanded={open}
        className="flex size-14 items-center justify-center rounded-full bg-brand text-white shadow-lg transition-colors hover:bg-brand-hover"
      >
        <Bot className="size-6" aria-hidden="true" />
      </button>
    </div>
  );
}
