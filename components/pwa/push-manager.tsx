"use client";

import { useEffect, useState } from "react";
import {
  sendNotification,
  subscribeUser,
  unsubscribeUser,
} from "@/app/actions";
import { useClientValue } from "@/hooks/use-client-value";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export function PushManager() {
  const isSupported = useClientValue(
    () => "serviceWorker" in navigator && "PushManager" in window,
    false,
  );
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null,
  );
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [isBrave, setIsBrave] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      return;
    }

    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then(setSubscription)
      .catch((error) => {
        console.error("Error al leer la suscripción push:", error);
      });
  }, []);

  useEffect(() => {
    const nav = navigator as Navigator & {
      brave?: { isBrave?: () => Promise<boolean> };
    };

    Promise.resolve(nav.brave?.isBrave?.() ?? /Brave/.test(nav.userAgent))
      .then(setIsBrave)
      .catch(() => {});
  }, []);

  async function subscribeToPush() {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) {
      setFeedback("Falta NEXT_PUBLIC_VAPID_PUBLIC_KEY en las variables de entorno.");
      return;
    }

    setBusy(true);
    setFeedback(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      setSubscription(sub);

      const result = await subscribeUser({
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.toJSON().keys?.p256dh ?? "",
          auth: sub.toJSON().keys?.auth ?? "",
        },
        userAgent: navigator.userAgent,
      });

      if (!result.success) {
        setFeedback(`No se pudo guardar la suscripción: ${result.error}`);
      }
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "No se pudo activar las notificaciones.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function unsubscribeFromPush() {
    setBusy(true);
    setFeedback(null);

    try {
      const endpoint = subscription?.endpoint;
      await subscription?.unsubscribe();
      setSubscription(null);

      if (endpoint) {
        const result = await unsubscribeUser(endpoint);
        if (!result.success) {
          setFeedback(`No se pudo eliminar la suscripción: ${result.error}`);
        }
      }
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "No se pudo desactivar las notificaciones.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function sendTestNotification() {
    setBusy(true);
    setFeedback(null);

    try {
      const result = await sendNotification(message);
      if (result.success) {
        setMessage("");
        setFeedback(`Notificación enviada a ${result.sent} dispositivo(s).`);
      } else {
        setFeedback(`Error: ${result.error}`);
      }
    } finally {
      setBusy(false);
    }
  }

  if (!isSupported) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Este navegador no soporta notificaciones push.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {isBrave ? (
        <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
          Brave bloquea las notificaciones push por defecto. Activa{" "}
          <span className="font-medium">
            &quot;Use Google services for push messaging&quot;
          </span>{" "}
          en <code className="font-mono">brave://settings/privacy</code> y
          reinicia el navegador. Mientras tanto, puedes usar Chrome o Edge.
        </p>
      ) : null}

      {subscription ? (
        <>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Este dispositivo está suscrito a las notificaciones.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              placeholder="Mensaje de prueba"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-[#083858] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
            <button
              type="button"
              onClick={sendTestNotification}
              disabled={busy || message.trim().length === 0}
              className="rounded-md bg-[#083858] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0a4a73] disabled:opacity-50"
            >
              Enviar prueba
            </button>
            <button
              type="button"
              onClick={unsubscribeFromPush}
              disabled={busy}
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Desuscribirse
            </button>
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={subscribeToPush}
          disabled={busy}
          className="self-start rounded-md bg-[#083858] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0a4a73] disabled:opacity-50"
        >
          Activar notificaciones
        </button>
      )}

      {feedback ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{feedback}</p>
      ) : null}
    </div>
  );
}
