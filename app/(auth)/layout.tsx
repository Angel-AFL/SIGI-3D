import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-50 px-6 py-12 dark:bg-black">
      <Link
        href="/"
        className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
      >
        SIGI <span className="text-brand dark:text-sky-300">3D</span>
      </Link>

      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {children}
      </div>
    </main>
  );
}
