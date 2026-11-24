import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Factory } from "lucide-react";
import { UpcomingOrders } from "@/components/dashboard/upcoming-orders";
import { StatCard } from "@/components/ui/stat-card";
import { getDashboardData } from "@/lib/dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Dashboard
        </h1>
        <Link
          href="/reportes"
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
        >
          Ver reportes
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          icon={Factory}
          label="Lotes activos"
          value={data.lotesActivos}
          actionLabel="Ver detalles"
          actionHref="/produccion"
        />
        <StatCard
          icon={AlertTriangle}
          tone="warning"
          label="Alertas de stock"
          value={data.alertasStock}
          actionLabel="Verificar stock"
          actionHref="/inventario"
        />
      </div>

      <UpcomingOrders orders={data.pedidosEnCola} />
    </div>
  );
}
