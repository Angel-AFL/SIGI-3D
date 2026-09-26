import type { Metadata } from "next";
import { ProductionStats } from "@/components/production/production-stats";
import { ProductionView } from "@/components/production/production-view";
import { getProductionData } from "@/lib/production";

export const metadata: Metadata = {
  title: "Producción",
};

export default async function ProduccionPage() {
  const data = await getProductionData();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Producción
      </h1>

      <ProductionStats stats={data.stats} />

      <ProductionView
        printers={data.printers}
        batches={data.batches}
        modelOptions={data.modelOptions}
        filamentOptions={data.filamentOptions}
      />
    </div>
  );
}
