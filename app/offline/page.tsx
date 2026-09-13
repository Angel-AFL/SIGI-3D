import Link from "next/link";

export const metadata = {
  title: "Sin conexión — SIGI 3D",
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 px-6 text-center dark:bg-black">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Sin conexión
      </h1>
      <p className="max-w-md text-zinc-600 dark:text-zinc-400">
        No pudimos cargar esta página porque no hay conexión a internet. Vuelve a
        intentarlo cuando recuperes la señal.
      </p>
      <Link
        href="/"
        className="rounded-full bg-[#083858] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0a4a73]"
      >
        Reintentar
      </Link>
    </div>
  );
}
