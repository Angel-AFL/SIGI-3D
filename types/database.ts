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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
