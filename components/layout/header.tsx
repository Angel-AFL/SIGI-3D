"use client";

import Link from "next/link";
import { Wifi, WifiOff } from "lucide-react";
import { useOffline } from "next/offline";
import { UserMenu } from "@/components/auth/user-menu";
import { cn } from "@/lib/utils";

export function Header({ email }: { email: string }) {
  const isOffline = useOffline();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-4 sm:px-6 dark:border-zinc-800 dark:bg-zinc-900">
      <Link
        href="/dashboard"
        className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
      >
        SIGI <span className="text-brand dark:text-sky-300">3D</span>
      </Link>

      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex items-center gap-1.5 text-sm font-medium",
            isOffline
              ? "text-amber-600 dark:text-amber-400"
              : "text-zinc-500 dark:text-zinc-400",
          )}
        >
          {isOffline ? (
            <WifiOff className="size-4" aria-hidden="true" />
          ) : (
            <Wifi className="size-4" aria-hidden="true" />
          )}
          {isOffline ? "Sin conexión" : "Online"}
        </span>

        <UserMenu email={email} />
      </div>
    </header>
  );
}
