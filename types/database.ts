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
          price_per_kg: number | null;
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
          price_per_kg?: number | null;
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
          price_per_kg?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          code: number;
          customer: string;
          model_name: string;
          filament_color: string | null;
          quantity: number;
          unit_price: number;
          total: number;
          delivery_date: string | null;
          status: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          code: number;
          customer: string;
          model_name: string;
          filament_color?: string | null;
          quantity?: number;
          unit_price?: number;
          total?: number;
          delivery_date?: string | null;
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          code?: number;
          customer?: string;
          model_name?: string;
          filament_color?: string | null;
          quantity?: number;
          unit_price?: number;
          total?: number;
          delivery_date?: string | null;
          status?: string;
          notes?: string | null;
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
          weight_grams: number | null;
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
          weight_grams?: number | null;
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
          weight_grams?: number | null;
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
      printers: {
        Row: {
          id: string;
          user_id: string;
          code: number;
          name: string;
          status: string;
          bed_x: number | null;
          bed_y: number | null;
          bed_z: number | null;
          nozzle_diameter: number;
          cost_per_hour: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          code: number;
          name: string;
          status?: string;
          bed_x?: number | null;
          bed_y?: number | null;
          bed_z?: number | null;
          nozzle_diameter?: number;
          cost_per_hour?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          code?: number;
          name?: string;
          status?: string;
          bed_x?: number | null;
          bed_y?: number | null;
          bed_z?: number | null;
          nozzle_diameter?: number;
          cost_per_hour?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      production_batches: {
        Row: {
          id: string;
          user_id: string;
          code: number;
          printer_id: string | null;
          model_id: string | null;
          filament_id: string | null;
          copies: number;
          units_per_bed: number;
          beds: number;
          material: string | null;
          grams_per_unit: number;
          minutes_per_bed: number;
          status: string;
          waste_grams: number;
          waste_reason: string | null;
          inventory_applied: boolean;
          applied_grams: number;
          started_at: string | null;
          finished_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          code: number;
          printer_id?: string | null;
          model_id?: string | null;
          filament_id?: string | null;
          copies?: number;
          units_per_bed?: number;
          beds?: number;
          material?: string | null;
          grams_per_unit?: number;
          minutes_per_bed?: number;
          status?: string;
          waste_grams?: number;
          waste_reason?: string | null;
          inventory_applied?: boolean;
          applied_grams?: number;
          started_at?: string | null;
          finished_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          code?: number;
          printer_id?: string | null;
          model_id?: string | null;
          filament_id?: string | null;
          copies?: number;
          units_per_bed?: number;
          beds?: number;
          material?: string | null;
          grams_per_unit?: number;
          minutes_per_bed?: number;
          status?: string;
          waste_grams?: number;
          waste_reason?: string | null;
          inventory_applied?: boolean;
          applied_grams?: number;
          started_at?: string | null;
          finished_at?: string | null;
          notes?: string | null;
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
