import type { Metadata } from "next";
import { OrdersStats } from "@/components/orders/orders-stats";
import { OrdersView } from "@/components/orders/orders-view";
import { isActiveOrder, isPendingDelivery } from "@/lib/order-utils";
import { getOrders } from "@/lib/orders";
import type { OrderStats } from "@/types/orders";

export const metadata: Metadata = {
  title: "Pedidos",
};

export default async function PedidosPage() {
  const orders = await getOrders();

  const stats: OrderStats = {
    active: orders.filter(isActiveOrder).length,
    pendingDeliveries: orders.filter(isPendingDelivery).length,
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Pedidos
      </h1>

      <OrdersStats stats={stats} />

      <OrdersView orders={orders} />
    </div>
  );
}
