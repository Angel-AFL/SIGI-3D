import { StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";

export function OrderNotes({
  notes,
  className,
}: {
  notes: string | null;
  className?: string;
}) {
  if (!notes) {
    return null;
  }

  return (
    <span
      className={cn(
        "flex items-start gap-1.5 text-xs text-zinc-500 dark:text-zinc-400",
        className,
      )}
    >
      <StickyNote className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
      <span className="line-clamp-2">{notes}</span>
    </span>
  );
}
