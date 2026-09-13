import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  actionLabel: string;
  actionHref: string;
  tone?: "brand" | "warning";
  className?: string;
}

const toneStyles: Record<NonNullable<StatCardProps["tone"]>, string> = {
  brand: "bg-brand/10 text-brand dark:bg-brand/20 dark:text-sky-300",
  warning:
    "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
};

export function StatCard({
  icon: Icon,
  label,
  value,
  actionLabel,
  actionHref,
  tone = "brand",
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "flex flex-col items-center gap-4 p-6 text-center",
        className,
      )}
    >
      <span
        className={cn(
          "flex size-16 items-center justify-center rounded-2xl",
          toneStyles[tone],
        )}
      >
        <Icon className="size-8" aria-hidden="true" />
      </span>
      <p className="text-sm font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-200">
        {label}:{" "}
        <span className="text-base font-bold text-brand dark:text-sky-300">
          {value}
        </span>
      </p>
      <Link
        href={actionHref}
        className="text-sm font-medium text-zinc-600 underline underline-offset-4 transition-colors hover:text-brand dark:text-zinc-300 dark:hover:text-sky-300"
      >
        {actionLabel}
      </Link>
    </Card>
  );
}
