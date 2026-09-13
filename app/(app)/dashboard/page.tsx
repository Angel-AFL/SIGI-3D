import type { Metadata } from "next";
import { AlertTriangle, Printer } from "lucide-react";
import { UpcomingOrders } from "@/components/dashboard/upcoming-orders";
import { StatCard } from "@/components/ui/stat-card";
import { getDashboardData } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Dashboard
      </h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          icon={Printer}
          label="Impresiones activas"
          value={data.impresionesActivas}
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
