"use client";

import { useState, type FormEvent } from "react";
import { createOrder, updateOrder } from "@/app/(app)/pedidos/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import {
  computeTotal,
  formatCurrency,
  ORDER_STATUS_LABELS,
  ORDER_STATUSES,
} from "@/lib/order-utils";
import type { Order, OrderStatus } from "@/types/orders";

interface OrderFormModalProps {
  onClose: () => void;
  order: Order | null;
}

const labelClass =
  "text-xs font-medium tracking-wide text-zinc-600 uppercase dark:text-zinc-300";

export function OrderFormModal({ onClose, order }: OrderFormModalProps) {
  const [customer, setCustomer] = useState(order?.customer ?? "");
  const [modelName, setModelName] = useState(order?.modelName ?? "");
  const [filamentColor, setFilamentColor] = useState(
    order?.filamentColor ?? "",
  );
  const [quantity, setQuantity] = useState(String(order?.quantity ?? 1));
  const [unitPrice, setUnitPrice] = useState(String(order?.unitPrice ?? 0));
  const [deliveryDate, setDeliveryDate] = useState(order?.deliveryDate ?? "");
  const [status, setStatus] = useState<OrderStatus>(order?.status ?? "cotizado");
  const [notes, setNotes] = useState(order?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const total = computeTotal(Number(unitPrice) || 0, Number(quantity) || 0);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const input = {
      customer,
      modelName,
      filamentColor: filamentColor.trim() === "" ? null : filamentColor,
      quantity: Number(quantity),
      unitPrice: Number(unitPrice),
      deliveryDate: deliveryDate.trim() === "" ? null : deliveryDate,
      status,
      notes: notes.trim() === "" ? null : notes,
    };

    const result = order
      ? await updateOrder(order.id, input)
      : await createOrder(input);

    if (!result.success) {
      setError(result.error);
      setBusy(false);
      return;
    }

    setBusy(false);
    onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={order ? "Editar pedido" : "Nuevo pedido"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Cliente</span>
            <Input
              value={customer}
              onChange={(event) => setCustomer(event.target.value)}
              placeholder="Juan Pérez"
              required
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Modelo</span>
            <Input
              value={modelName}
              onChange={(event) => setModelName(event.target.value)}
              placeholder="Figura Gnomo"
              required
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Color de filamento</span>
            <Input
              value={filamentColor}
              onChange={(event) => setFilamentColor(event.target.value)}
              placeholder="Rojo Fuego"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Cantidad</span>
            <Input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              required
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Precio por unidad (MXN)</span>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={unitPrice}
              onChange={(event) => setUnitPrice(event.target.value)}
              required
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Total (MXN)</span>
            <Input
              value={formatCurrency(total)}
              readOnly
              aria-readonly="true"
              tabIndex={-1}
              className="cursor-default bg-zinc-100 font-semibold dark:bg-zinc-800"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Fecha de entrega</span>
            <Input
              type="date"
              value={deliveryDate}
              onChange={(event) => setDeliveryDate(event.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Estado</span>
            <Select
              value={status}
              onChange={(event) => setStatus(event.target.value as OrderStatus)}
            >
              {ORDER_STATUSES.map((option) => (
                <option key={option} value={option}>
                  {ORDER_STATUS_LABELS[option]}
                </option>
              ))}
            </Select>
          </label>

          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className={labelClass}>Notas</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              placeholder="Detalles del pedido, acabado, color..."
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-brand focus-visible:ring-2 focus-visible:ring-brand/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
          </label>
        </div>

        {error ? (
          <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={busy}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? "Guardando..." : order ? "Guardar cambios" : "Crear pedido"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
