import type { LucideIcon } from "lucide-react";

interface ModulePlaceholderProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function ModulePlaceholder({
  icon: Icon,
  title,
  description,
}: ModulePlaceholderProps) {
  return (
    <section className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        {title}
      </h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{description}</p>

      <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700">
        <Icon
          className="size-10 text-zinc-400 dark:text-zinc-500"
          aria-hidden="true"
        />
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Módulo en construcción
        </p>
      </div>
    </section>
  );
}
