"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LogOut, Settings, User } from "lucide-react";
import { signOut } from "@/app/(auth)/actions";

async function clearAuthCaches() {
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

export function UserMenu({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Cuenta"
        aria-expanded={open}
        className="flex size-9 items-center justify-center rounded-full border border-zinc-300 text-zinc-500 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <User className="size-4" aria-hidden="true" />
      </button>

      {open ? (
        <div className="absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
          <div className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
            <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
              {email}
            </p>
          </div>

          <Link
            href="/ajustes"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <Settings className="size-4" aria-hidden="true" />
            Ajustes
          </Link>

          <form action={signOut} onSubmit={clearAuthCaches}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Cerrar sesión
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
