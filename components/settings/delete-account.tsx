"use client";

import { useActionState, useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteAccount, type DeleteAccountState } from "@/app/ajustes/actions";
import { clearAuthCaches } from "@/lib/auth-cache";

const initialState: DeleteAccountState = {};

function releaseDeviceResources() {
  clearAuthCaches();

  navigator.serviceWorker?.ready
    .then((registration) => registration.pushManager.getSubscription())
    .then((subscription) => subscription?.unsubscribe())
    .catch(() => {
      // Best effort: el service worker y las suscripciones se limpian igualmente
      // al eliminar la cuenta en el servidor.
    });
}

export function DeleteAccount({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState(
    deleteAccount,
    initialState,
  );
  const [confirmation, setConfirmation] = useState("");

  const matches =
    confirmation.trim().toLowerCase() === email.trim().toLowerCase();

  return (
    <form
      action={formAction}
      onSubmit={releaseDeviceResources}
      className="flex flex-col gap-3"
    >
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Esta acción es permanente. Se eliminarán tu cuenta y todos tus datos:
        inventario, pedidos, modelos, producción y notificaciones. No se puede
        deshacer.
      </p>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="confirmation"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Escribe <span className="font-mono">{email}</span> para confirmar
        </label>
        <input
          id="confirmation"
          name="confirmation"
          type="text"
          autoComplete="off"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-red-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>

      {state.error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending || !matches}
        className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-lg bg-red-600 px-4 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:pointer-events-none disabled:opacity-50"
      >
        <Trash2 className="size-4" aria-hidden="true" />
        {pending ? "Eliminando…" : "Eliminar mi cuenta"}
      </button>
    </form>
  );
}
