import type { Metadata } from "next";
import { Package } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export const metadata: Metadata = {
  title: "Inventario",
};

export default function InventarioPage() {
  return (
    <ModulePlaceholder
      icon={Package}
      title="Inventario"
      description="Gestión de filamentos, colores y cálculo de gramaje restante."
    />
  );
}
