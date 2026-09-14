import type { StockStatus } from "@/types/dashboard";

export type FilamentStatus = StockStatus;

export interface Filament {
  id: string;
  code: number;
  material: string;
  color: string;
  brand: string;
  weightCurrentG: number;
  weightInitialG: number | null;
  location: string | null;
  minStockG: number;
  createdAt: string;
  updatedAt: string;
}

export interface FilamentInput {
  material: string;
  color: string;
  brand: string;
  weightCurrentG: number;
  weightInitialG: number | null;
  location: string | null;
  minStockG: number;
}

export interface InventoryStats {
  total: number;
  lowStock: number;
}

export type FilamentActionResult =
  | { success: true }
  | { success: false; error: string };
