export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      push_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          endpoint?: string;
          p256dh?: string;
          auth?: string;
          user_agent?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      filaments: {
        Row: {
          id: string;
          user_id: string;
          code: number;
          material: string;
          color: string;
          brand: string;
          weight_current_g: number;
          weight_initial_g: number | null;
          location: string | null;
          min_stock_g: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          code: number;
          material: string;
          color: string;
          brand: string;
          weight_current_g?: number;
          weight_initial_g?: number | null;
          location?: string | null;
          min_stock_g?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          code?: number;
          material?: string;
          color?: string;
          brand?: string;
          weight_current_g?: number;
          weight_initial_g?: number | null;
          location?: string | null;
          min_stock_g?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      models: {
        Row: {
          id: string;
          user_id: string;
          code: number;
          name: string;
          material: string;
          estimated_minutes: number | null;
          dimensions_x: number | null;
          dimensions_y: number | null;
          dimensions_z: number | null;
          file_path: string;
          file_name: string;
          file_size_bytes: number | null;
          thumbnail_path: string | null;
          last_viewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          code: number;
          name: string;
          material: string;
          estimated_minutes?: number | null;
          dimensions_x?: number | null;
          dimensions_y?: number | null;
          dimensions_z?: number | null;
          file_path: string;
          file_name: string;
          file_size_bytes?: number | null;
          thumbnail_path?: string | null;
          last_viewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          code?: number;
          name?: string;
          material?: string;
          estimated_minutes?: number | null;
          dimensions_x?: number | null;
          dimensions_y?: number | null;
          dimensions_z?: number | null;
          file_path?: string;
          file_name?: string;
          file_size_bytes?: number | null;
          thumbnail_path?: string | null;
          last_viewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
