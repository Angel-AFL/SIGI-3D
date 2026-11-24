import type { Metadata } from "next";
import { ReportKpis } from "@/components/reports/report-kpis";
import { ReportsToolbar } from "@/components/reports/reports-toolbar";
import { ReportsView } from "@/components/reports/reports-view";
import { parseReportRange } from "@/lib/report-utils";
import { getReportData } from "@/lib/reports";

export const metadata: Metadata = {
  title: "Reportes",
};

export default async function ReportesPage({
  searchParams,
}: {
  searchParams: Promise<{ rango?: string | string[] }>;
}) {
  const { rango } = await searchParams;
  const range = parseReportRange(rango);
  const data = await getReportData(range);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Reportes
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Rentabilidad y producción de {data.label.toLowerCase()}.
        </p>
      </div>

      <ReportsToolbar range={range} />
      <ReportKpis kpis={data.kpis} />
      <ReportsView data={data} />
    </div>
  );
}
