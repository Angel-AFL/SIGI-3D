export interface ModelDimensions {
  x: number;
  y: number;
  z: number;
}

export interface Model3D {
  id: string;
  code: number;
  name: string;
  material: string;
  estimatedMinutes: number | null;
  dimensions: ModelDimensions | null;
  fileName: string;
  fileSizeBytes: number | null;
  fileUrl: string | null;
  thumbnailUrl: string | null;
  lastViewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Model3DInput {
  name: string;
  material: string;
  estimatedMinutes: number | null;
  dimensions: ModelDimensions | null;
  filePath: string;
  fileName: string;
  fileSizeBytes: number | null;
  thumbnailPath: string | null;
}

export interface Model3DUpdateInput {
  name: string;
  material: string;
  estimatedMinutes: number | null;
}

export interface Model3DStats {
  total: number;
  recentViews: number;
}

export type ModelActionResult =
  | { success: true }
  | { success: false; error: string };
