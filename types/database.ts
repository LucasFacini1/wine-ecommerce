/* ------------------------------------------------------------------ *
 *  Tipos do banco (Supabase) — escritos à mão para casar com
 *  supabase/migrations/20260829120000_init.sql.
 *
 *  Depois de linkar o projeto, regere com:
 *    npm run db:types
 *  (npx supabase gen types typescript --linked > types/database.ts)
 * ------------------------------------------------------------------ */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type WineType =
  | "tinto"
  | "branco"
  | "rosé"
  | "espumante"
  | "laranja";

export type OrderStatus =
  | "recebido"
  | "pago"
  | "separado"
  | "despachado"
  | "entregue";

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          slug: string;
          name: string;
          producer: string;
          type: WineType;
          vintage: number | null;
          grapes: string[];
          region: string;
          country: string;
          pairings: string[];
          abv: number;
          price_cents: number;
          description: string;
          tasting_notes: string;
          serving_temp: string;
          stock_qty: number;
          low_stock_threshold: number;
          featured: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          producer: string;
          type: WineType;
          vintage?: number | null;
          grapes?: string[];
          region: string;
          country: string;
          pairings?: string[];
          abv?: number;
          price_cents: number;
          description?: string;
          tasting_notes?: string;
          serving_temp?: string;
          stock_qty?: number;
          low_stock_threshold?: number;
          featured?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          url: string;
          alt: string;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          url: string;
          alt?: string;
          position?: number;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["product_images"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          id: string;
          reference: string;
          customer_name: string;
          customer_email: string;
          customer_cpf: string;
          shipping_cep: string;
          shipping_street: string;
          shipping_number: string;
          shipping_complement: string | null;
          shipping_district: string;
          shipping_city: string;
          shipping_state: string;
          subtotal_cents: number;
          shipping_cents: number;
          total_cents: number;
          status: OrderStatus;
          payment_provider: string;
          payment_ref: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reference?: string;
          customer_name: string;
          customer_email: string;
          customer_cpf: string;
          shipping_cep: string;
          shipping_street: string;
          shipping_number: string;
          shipping_complement?: string | null;
          shipping_district: string;
          shipping_city: string;
          shipping_state: string;
          subtotal_cents: number;
          shipping_cents?: number;
          total_cents: number;
          status?: OrderStatus;
          payment_provider?: string;
          payment_ref?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          name: string;
          producer: string;
          vintage: number | null;
          unit_price_cents: number;
          qty: number;
          image_url: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          name: string;
          producer: string;
          vintage?: number | null;
          unit_price_cents: number;
          qty: number;
          image_url?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["order_items"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      order_events: {
        Row: {
          id: string;
          order_id: string;
          status: OrderStatus;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          status: OrderStatus;
          note?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["order_events"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "order_events_order_id_fkey";
            columns: ["order_id"];
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      admin_users: {
        Row: { user_id: string; email: string | null; created_at: string };
        Insert: { user_id: string; email?: string | null; created_at?: string };
        Update: Partial<
          Database["public"]["Tables"]["admin_users"]["Insert"]
        >;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      advance_order_status: {
        Args: { p_order_id: string; p_note?: string | null };
        Returns: Database["public"]["Tables"]["orders"]["Row"];
      };
      mark_order_paid: {
        Args: { p_order_id: string; p_payment_ref?: string | null };
        Returns: Database["public"]["Tables"]["orders"]["Row"];
      };
    };
    Enums: {
      wine_type: WineType;
      order_status: OrderStatus;
    };
    CompositeTypes: Record<never, never>;
  };
}

/* atalhos úteis */
export type ProductRow = Database["public"]["Tables"]["products"]["Row"];
export type ProductImageRow =
  Database["public"]["Tables"]["product_images"]["Row"];
export type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];
export type OrderEventRow = Database["public"]["Tables"]["order_events"]["Row"];
