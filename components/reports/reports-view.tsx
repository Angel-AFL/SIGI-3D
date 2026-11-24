import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { BarChart } from "@/components/reports/bar-chart";
import { ReportTable } from "@/components/reports/report-table";
import { StatusBreakdown } from "@/components/reports/status-breakdown";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/order-utils";
import { formatCode } from "@/lib/production-utils";
import {
  formatCompactCurrency,
  formatGrams,
  formatPercent,
  formatReportDate,
  formatReportNumber,
} from "@/lib/report-utils";
import type { ReportData } from "@/types/reports";

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card className="p-5">
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
        {title}
      </h2>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {description}
      </p>
      <div className="mt-5">{children}</div>
    </Card>
  );
}

function ProductionSummary({ data }: { data: ReportData }) {
  const { kpis } = data;
  const items = [
    { label: "Completados", value: formatReportNumber(kpis.completedBatches) },
    { label: "Fallidos", value: formatReportNumber(kpis.failedBatches) },
    {
      label: "Tasa de éxito",
      value: kpis.finishedBatches > 0 ? formatPercent(kpis.successRate) : "—",
    },
    { label: "Merma", value: formatGrams(kpis.wasteGrams) },
    {
      label: "Horas de impresora",
      value: `${kpis.printerHours.toLocaleString("es-MX", {
        maximumFractionDigits: 1,
      })} h`,
    },
    {
      label: "Lotes sin costo",
      value: formatReportNumber(kpis.batchesWithoutCost),
    },
  ];

  return (
    <dl className="grid grid-cols-2 gap-4">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-[11px] font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
            {item.label}
          </dt>
          <dd className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-50">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function ReportsView({ data }: { data: ReportData }) {
  const { kpis } = data;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard
          title="Ingresos por mes"
          description="Pedidos entregados, agrupados por fecha de entrega."
        >
          <BarChart
            items={data.monthlyRevenue.map((point) => ({
              label: point.label,
              value: point.revenue,
            }))}
            formatValue={formatCompactCurrency}
            emptyLabel="Sin ingresos registrados en el periodo."
          />
        </ChartCard>

        <ChartCard
          title="Pedidos por estado"
          description="Pedidos creados en el periodo."
        >
          <StatusBreakdown slices={data.ordersByStatus} />
        </ChartCard>

        <ChartCard
          title="Consumo por material"
          description="Filamento aplicado en lotes completados y fallidos."
        >
          <BarChart
            orientation="horizontal"
            tone="amber"
            items={data.materialUsage.map((usage) => ({
              label: usage.material,
              value: usage.grams,
            }))}
            formatValue={formatGrams}
            emptyLabel="Sin consumo de filamento en el periodo."
          />
        </ChartCard>

        <ChartCard
          title="Resumen de producción"
          description="Lotes finalizados y su resultado."
        >
          <ProductionSummary data={data} />
        </ChartCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ReportTable
          title="Top clientes"
          description="Clientes con mayores ingresos entregados."
          columns={[
            {
              header: "Cliente",
              cell: (row) => (
                <span className="font-medium text-zinc-900 dark:text-zinc-50">
                  {row.customer}
                </span>
              ),
            },
            {
              header: "Pedidos",
              align: "right",
              cell: (row) => formatReportNumber(row.orders),
            },
            {
              header: "Ingresos",
              align: "right",
              cell: (row) => formatCurrency(row.revenue),
            },
            {
              header: "Última entrega",
              align: "right",
              cell: (row) => formatReportDate(row.lastDelivery),
            },
          ]}
          rows={data.topCustomers}
          getRowKey={(row) => row.customer}
          emptyLabel="Aún no hay entregas en el periodo."
        />

        <ReportTable
          title="Top modelos"
          description="Modelos con mayores ingresos entregados."
          columns={[
            {
              header: "Modelo",
              cell: (row) => (
                <span className="font-medium text-zinc-900 dark:text-zinc-50">
                  {row.modelName}
                </span>
              ),
            },
            {
              header: "Piezas",
              align: "right",
              cell: (row) => formatReportNumber(row.units),
            },
            {
              header: "Ingresos",
              align: "right",
              cell: (row) => formatCurrency(row.revenue),
            },
          ]}
          rows={data.topModels}
          getRowKey={(row) => row.modelName}
          emptyLabel="Aún no hay entregas en el periodo."
        />
      </div>

      <ReportTable
        title="Lotes con mayor merma"
        description="Filamento perdido en lotes fallidos."
        columns={[
          {
            header: "Lote",
            cell: (row) => (
              <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
                {formatCode(row.code)}
              </span>
            ),
          },
          {
            header: "Modelo",
            cell: (row) => row.modelName ?? "Sin modelo",
          },
          {
            header: "Merma",
            align: "right",
            cell: (row) => formatGrams(row.wasteGrams),
          },
          {
            header: "Motivo",
            cell: (row) => row.reason ?? "Sin motivo",
          },
          {
            header: "Finalizado",
            align: "right",
            cell: (row) => formatReportDate(row.finishedAt),
          },
        ]}
        rows={data.wasteBatches}
        getRowKey={(row) => row.id}
        emptyLabel="Sin mermas registradas en el periodo."
      />

      <div className="flex flex-col gap-3">
        {kpis.batchesWithoutCost > 0 ? (
          <Card className="flex items-start gap-3 border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            <AlertTriangle
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <p>
              {kpis.batchesWithoutCost} lote
              {kpis.batchesWithoutCost === 1 ? "" : "s"} no tiene
              {kpis.batchesWithoutCost === 1 ? "" : "n"} precio de material
              registrado en su carrete. El costo de producción y el margen
              pueden estar subestimados.
            </p>
          </Card>
        ) : null}

        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Los costos de producción son estimados con los precios actuales de
          los carretes de filamento y el costo por hora de cada impresora. Los
          ingresos se agrupan por la fecha de entrega del pedido.
        </p>
      </div>
    </div>
  );
}
