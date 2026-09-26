export type OrderStatus = "cotizado" | "imprimiendo" | "entregado";

export type StockStatus = "en_stock" | "bajo_stock" | "agotado";

export interface UpcomingOrder {
  id: string;
  cliente: string;
  modelo: string;
  color: string;
  fechaEntrega: string;
  estado: OrderStatus;
}

export interface StockAlert {
  id: string;
  material: string;
  color: string;
  marca: string;
  gramosRestantes: number;
  estado: StockStatus;
}

export interface DashboardData {
  lotesActivos: number;
  alertasStock: number;
  pedidosEnCola: UpcomingOrder[];
  alertas: StockAlert[];
}
