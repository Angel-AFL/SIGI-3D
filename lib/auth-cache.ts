/**
 * Limpia las cachés de páginas autenticadas del service worker. Debe invocarse
 * antes de cerrar sesión o eliminar la cuenta para no servir HTML privado.
 */
export async function clearAuthCaches() {
  if (!("caches" in window)) {
    return;
  }

  try {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => key.startsWith("sigi-pages"))
        .map((key) => caches.delete(key)),
    );
  } catch {
    // Best effort: si falla, el service worker no servirá HTML autenticado.
  }

  navigator.serviceWorker?.controller?.postMessage({ type: "CLEAR_AUTH_CACHE" });
}
