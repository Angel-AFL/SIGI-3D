"use client";

import { useOffline } from "next/offline";

export function OfflineBanner() {
  const isOffline = useOffline();

  if (!isOffline) {
    return null;
  }

  return (
    <div
      role="status"
      className="fixed inset-x-0 top-0 z-50 bg-amber-500 px-4 py-2 text-center text-sm font-medium text-amber-950"
    >
      Sin conexión. Las solicitudes pendientes se reintentarán al volver a estar
      en línea.
    </div>
  );
}
