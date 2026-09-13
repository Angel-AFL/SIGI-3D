import type { Metadata } from "next";
import { Eye } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export const metadata: Metadata = {
  title: "Visor 3D",
};

export default function ModelosPage() {
  return (
    <ModulePlaceholder
      icon={Eye}
      title="Visor 3D"
      description="Galería y previsualización de modelos STL sin software de terceros."
    />
  );
}
