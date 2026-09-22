"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import {
  deleteOrder,
  updateOrderStatus,
} from "@/app/(app)/pedidos/actions";
import { KanbanBoard } from "@/components/orders/kanban-board";
import { OrderFormModal } from "@/components/orders/order-form-modal";
import { OrderList } from "@/components/orders/order-list";
import {
  OrdersToolbar,
  type OrdersViewMode,
  type StatusFilter,
} from "@/components/orders/orders-toolbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import type { Order, OrderStatus } from "@/types/orders";

export function OrdersView({ orders: initialOrders }: { orders: Order[] }) {
  const [orders, applyOptimisticStatus] = useOptimistic(
    initialOrders,
    (state, update: { id: string; status: OrderStatus }) =>
      state.map((item) =>
        item.id === update.id ? { ...item, status: update.status } : item,
      ),
  );
  const [, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("todos");
  const [view, setView] = useState<OrdersViewMode>("lista");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus = status === "todos" || order.status === status;

      if (!matchesStatus) {
        return false;
      }

      if (term === "") {
        return true;
      }

      return [
        order.customer,
        order.modelName,
        order.filamentColor ?? "",
        order.notes ?? "",
        String(order.code),
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [orders, query, status]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(order: Order) {
    setEditing(order);
    setFormOpen(true);
  }

  function handleStatusChange(order: Order, nextStatus: OrderStatus) {
    setStatusError(null);

    startTransition(async () => {
      applyOptimisticStatus({ id: order.id, status: nextStatus });

      const result = await updateOrderStatus(order.id, nextStatus);

      if (!result.success) {
        setStatusError(result.error);
      }
    });
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);
    setDeleteError(null);

    const result = await deleteOrder(deleteTarget.id);

    if (!result.success) {
      setDeleteError(result.error);
      setDeleting(false);
      return;
    }

    setDeleting(false);
    setDeleteTarget(null);
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold tracking-wide text-zinc-700 uppercase dark:text-zinc-200">
          Pedidos
        </h2>
        <Button size="sm" onClick={openCreate}>
          <Plus className="size-4" aria-hidden="true" />
          Nuevo pedido
        </Button>
      </div>

      {orders.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
          <p>Todavía no hay pedidos registrados.</p>
          <Button size="sm" onClick={openCreate}>
            <Plus className="size-4" aria-hidden="true" />
            Crear pedido
          </Button>
        </Card>
      ) : (
        <>
          <OrdersToolbar
            query={query}
            onQueryChange={setQuery}
            status={status}
            onStatusChange={setStatus}
            view={view}
            onViewChange={setView}
          />

          {statusError ? (
            <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
              {statusError}
            </p>
          ) : null}

          {filtered.length === 0 ? (
            <Card className="p-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
              No hay pedidos que coincidan con la búsqueda.
            </Card>
          ) : view === "kanban" ? (
            <KanbanBoard
              orders={filtered}
              onStatusChange={handleStatusChange}
              onEdit={openEdit}
              onDelete={(order) => {
                setDeleteError(null);
                setDeleteTarget(order);
              }}
            />
          ) : (
            <OrderList
              orders={filtered}
              onEdit={openEdit}
              onDelete={(order) => {
                setDeleteError(null);
                setDeleteTarget(order);
              }}
              onStatusChange={handleStatusChange}
            />
          )}
        </>
      )}

      {formOpen ? (
        <OrderFormModal
          key={editing?.id ?? "new"}
          onClose={() => setFormOpen(false)}
          order={editing}
        />
      ) : null}

      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar pedido"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            ¿Seguro que quieres eliminar el pedido{" "}
            <span className="font-medium">
              #{String(deleteTarget?.code ?? 0).padStart(3, "0")} ·{" "}
              {deleteTarget?.customer}
            </span>
            ? Esta acción no se puede deshacer.
          </p>

          {deleteError ? (
            <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
              {deleteError}
            </p>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
