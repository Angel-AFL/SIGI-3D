import type { Metadata } from "next";
import { ClipboardList } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export const metadata: Metadata = {
  title: "Pedidos",
};

export default function PedidosPage() {
  return (
    <ModulePlaceholder
      icon={ClipboardList}
      title="Pedidos"
      description="Tablero Kanban para el ciclo de vida de los pedidos: cotizado, imprimiendo y entregado."
    />
  );
}
