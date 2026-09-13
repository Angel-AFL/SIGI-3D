import type { Metadata } from "next";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { PushManager } from "@/components/pwa/push-manager";

export const metadata: Metadata = {
  title: "Ajustes",
};

export default function AjustesPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Ajustes de la aplicación
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Instala SIGI 3D en tu dispositivo y activa las notificaciones.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
          Instalación
        </h2>
        <InstallPrompt />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
          Notificaciones push
        </h2>
        <PushManager />
      </section>
    </main>
  );
}
