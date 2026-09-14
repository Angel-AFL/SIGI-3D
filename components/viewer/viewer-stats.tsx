import { Boxes, History } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Model3DStats } from "@/types/viewer";

export function ViewerStats({ stats }: { stats: Model3DStats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card className="flex items-center gap-4 p-6">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand dark:bg-brand/20 dark:text-sky-300">
          <Boxes className="size-7" aria-hidden="true" />
        </span>
        <p className="text-sm font-semibold tracking-wide text-zinc-700 uppercase dark:text-zinc-200">
          Modelos cargados:{" "}
          <span className="text-xl font-bold text-brand dark:text-sky-300">
            {stats.total}
          </span>
        </p>
      </Card>

      <Card className="flex items-center gap-4 p-6">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
          <History className="size-7" aria-hidden="true" />
        </span>
        <p className="text-sm font-semibold tracking-wide text-zinc-700 uppercase dark:text-zinc-200">
          Vistas recientes:{" "}
          <span className="text-xl font-bold text-sky-700 dark:text-sky-300">
            {stats.recentViews}
          </span>
        </p>
      </Card>
    </div>
  );
}
