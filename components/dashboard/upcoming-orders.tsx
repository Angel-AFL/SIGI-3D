import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatShortDate } from "@/lib/utils";
import type { UpcomingOrder } from "@/types/dashboard";

export function UpcomingOrders({ orders }: { orders: UpcomingOrder[] }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold tracking-wide text-zinc-700 uppercase dark:text-zinc-200">
          Próximos pedidos en cola
        </h2>
        <Link href="/pedidos" className={buttonClasses("secondary", "sm")}>
          Ver pedidos
        </Link>
      </div>

      {orders.length === 0 ? (
        <Card className="p-6 text-sm text-zinc-500 dark:text-zinc-400">
          No hay pedidos en cola.
        </Card>
      ) : (
        <>
          <Card className="hidden overflow-hidden sm:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-100 text-xs tracking-wide text-zinc-500 uppercase dark:bg-zinc-800 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Modelo 3D</th>
                  <th className="px-4 py-3 font-medium">Color</th>
                  <th className="px-4 py-3 font-medium">Fecha entrega</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="text-zinc-700 dark:text-zinc-200"
                  >
                    <td className="px-4 py-3 font-medium">{order.cliente}</td>
                    <td className="px-4 py-3">{order.modelo}</td>
                    <td className="px-4 py-3">{order.color}</td>
                    <td className="px-4 py-3">
                      {formatShortDate(order.fechaEntrega)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.estado} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <ul className="flex flex-col gap-2 sm:hidden">
            {orders.map((order) => (
              <li key={order.id}>
                <Card className="flex items-center justify-between gap-3 p-3 text-sm">
                  <span className="flex min-w-0 flex-col">
                    <span className="font-medium text-zinc-800 dark:text-zinc-100">
                      {order.cliente}
                    </span>
                    <span className="truncate text-zinc-500 dark:text-zinc-400">
                      {order.modelo} · {order.color}
                    </span>
                  </span>
                  <span className="flex flex-col items-end gap-1">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {formatShortDate(order.fechaEntrega)}
                    </span>
                    <StatusBadge status={order.estado} />
                  </span>
                </Card>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
