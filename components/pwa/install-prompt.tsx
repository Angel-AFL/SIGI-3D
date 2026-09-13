"use client";

import { useEffect, useState } from "react";
import { useClientValue } from "@/hooks/use-client-value";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const isIOS = useClientValue(
    () => /iPad|iPhone|iPod/.test(navigator.userAgent),
    false,
  );
  const isStandalone = useClientValue(
    () =>
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as { standalone?: boolean }).standalone === true,
    true,
  );

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (isStandalone) {
    return null;
  }

  if (!deferredPrompt && !isIOS) {
    return null;
  }

  async function install() {
    if (!deferredPrompt) {
      return;
    }
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        Instalar SIGI 3D
      </h3>
      {deferredPrompt ? (
        <button
          type="button"
          onClick={install}
          className="self-start rounded-md bg-[#083858] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0a4a73]"
        >
          Añadir a la pantalla de inicio
        </button>
      ) : (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          En iOS, toca el botón Compartir y luego &quot;Añadir a pantalla de
          inicio&quot;.
        </p>
      )}
    </div>
  );
}
