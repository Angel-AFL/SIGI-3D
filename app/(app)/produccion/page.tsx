import type { Metadata } from "next";
import { Factory } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export const metadata: Metadata = {
  title: "Producción",
};

export default function ProduccionPage() {
  return (
    <ModulePlaceholder
      icon={Factory}
      title="Producción"
      description="Lotes por camas de impresión, seguimiento de máquinas y registro de mermas."
    />
  );
}
