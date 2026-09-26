import "server-only";

import { getFilaments } from "@/lib/inventory";
import { getFilamentStatus } from "@/lib/inventory-utils";
import { isActiveOrder } from "@/lib/order-utils";
import { getOrders } from "@/lib/orders";
import { getProductionStats } from "@/lib/production";
import type {
  DashboardData,
  StockAlert,
  UpcomingOrder,
} from "@/types/dashboard";

const MAX_UPCOMING_ORDERS = 5;

export async function getDashboardData(): Promise<DashboardData> {
  const [orders, filaments, production] = await Promise.all([
    getOrders(),
    getFilaments(),
    getProductionStats(),
  ]);

  const pedidosEnCola: UpcomingOrder[] = orders
    .filter((order) => isActiveOrder(order) && order.deliveryDate !== null)
    .sort((a, b) => (a.deliveryDate ?? "").localeCompare(b.deliveryDate ?? ""))
    .slice(0, MAX_UPCOMING_ORDERS)
    .map((order) => ({
      id: order.id,
      cliente: order.customer,
      modelo: order.modelName,
      color: order.filamentColor ?? "Sin especificar",
      fechaEntrega: order.deliveryDate as string,
      estado: order.status,
    }));

  const alertas: StockAlert[] = filaments
    .filter(
      (filament) =>
        getFilamentStatus(filament.weightCurrentG, filament.minStockG) !==
        "en_stock",
    )
    .map((filament) => ({
      id: filament.id,
      material: filament.material,
      color: filament.color,
      marca: filament.brand,
      gramosRestantes: filament.weightCurrentG,
      estado: getFilamentStatus(filament.weightCurrentG, filament.minStockG),
    }));

  return {
    lotesActivos: production.queuedBatches + production.printingBatches,
    alertasStock: alertas.length,
    pedidosEnCola,
    alertas,
  };
}
