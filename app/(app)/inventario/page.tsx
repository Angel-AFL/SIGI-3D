import type { Metadata } from "next";
import { InventoryStats } from "@/components/inventory/inventory-stats";
import { InventoryView } from "@/components/inventory/inventory-view";
import { getFilaments } from "@/lib/inventory";
import { getFilamentStatus } from "@/lib/inventory-utils";

export const metadata: Metadata = {
  title: "Inventario",
};

export default async function InventarioPage() {
  const filaments = await getFilaments();

  const stats = {
    total: filaments.length,
    lowStock: filaments.filter(
      (filament) =>
        getFilamentStatus(filament.weightCurrentG, filament.minStockG) !==
        "en_stock",
    ).length,
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Inventario
      </h1>

      <InventoryStats stats={stats} />

      <InventoryView filaments={filaments} />
    </div>
  );
}
