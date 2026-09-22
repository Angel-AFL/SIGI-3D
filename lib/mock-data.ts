import type { DashboardData } from "@/types/dashboard";

const dashboardData: DashboardData = {
  impresionesActivas: 2,
  alertasStock: 1,
  pedidosEnCola: [
    {
      id: "001",
      cliente: "María P.",
      modelo: "Figura Gnomo",
      color: "Rojo",
      fechaEntrega: "2026-10-26",
      estado: "cotizado",
    },
    {
      id: "002",
      cliente: "María A.",
      modelo: "Figura Gnomo",
      color: "Rojo",
      fechaEntrega: "2026-10-27",
      estado: "imprimiendo",
    },
    {
      id: "003",
      cliente: "María A.",
      modelo: "Figura Gnomo",
      color: "Prata",
      fechaEntrega: "2026-10-28",
      estado: "cotizado",
    },
    {
      id: "004",
      cliente: "María P.",
      modelo: "Figura Gnomo",
      color: "Sento",
      fechaEntrega: "2026-10-29",
      estado: "cotizado",
    },
    {
      id: "005",
      cliente: "María P.",
      modelo: "Figura Gnomo",
      color: "Rojo",
      fechaEntrega: "2026-10-30",
      estado: "cotizado",
    },
  ],
  alertas: [
    {
      id: "002",
      material: "PETG",
      color: "Azul Mar",
      marca: "eSun",
      gramosRestantes: 210,
      estado: "bajo_stock",
    },
  ],
};

export async function getDashboardData(): Promise<DashboardData> {
  return dashboardData;
}
