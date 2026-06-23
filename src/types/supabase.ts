/**
 * Generated database types — mirrors the Supabase schema exactly.
 *
 * To regenerate after schema changes:
 *   npx supabase gen types typescript --project-id <ref> > src/types/supabase.ts
 *
 * Table overview:
 *   products          — base product catalog (timber species + class)
 *   inventory_items   — physical dimensional variations with live stock balance
 *   transactions      — append-only ledger of every stock movement
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type TimberClass = "dimensional" | "plank";
export type TransactionType = "RESTOCK" | "SALE" | "WASTE_CUT" | "CORRECTION";
export type StockUnit = "linear_ft" | "sq_ft" | "pieces";

// ─── Row shapes (what comes back from SELECT) ─────────────────────────────────

export interface ProductRow {
  id: string;                    // uuid
  name: string;                  // "Jak Premium"
  species: string;               // "Jak"
  timber_class: TimberClass;
  created_at: string;            // timestamptz ISO
  updated_at: string;
}

export interface InventoryItemRow {
  id: string;                    // uuid
  product_id: string;            // FK → products.id
  thickness: number;             // inches
  width: number | null;          // inches, null for PLANK
  length_ft: number | null;      // feet, null unless Jak DIMENSIONAL
  current_stock: number;
  low_stock_threshold: number;
  stock_unit: StockUnit;
  dimension_summary: string;     // pre-computed e.g. '3" × 4" × 2\''
  created_at: string;
  updated_at: string;
  // joined
  products?: ProductRow;
}

export interface TransactionRow {
  id: string;                    // uuid
  inventory_item_id: string;     // FK → inventory_items.id
  transaction_type: TransactionType;
  quantity_changed: number;      // POSITIVE = inflow, NEGATIVE = outflow
  pieces: number;                // piece count (for length-tracked items)
  stock_after: number;           // snapshot of current_stock after this tx
  reference_notes: string | null;
  created_by: string | null;     // auth.users uuid
  created_at: string;
  // joined
  inventory_items?: Pick<InventoryItemRow, "id" | "dimension_summary" | "stock_unit">;
}

// ─── Insert shapes (what you send on INSERT) ──────────────────────────────────

export interface ProductInsert {
  name: string;
  species: string;
  timber_class: TimberClass;
}

export interface InventoryItemInsert {
  product_id: string;
  thickness: number;
  width?: number | null;
  length_ft?: number | null;
  current_stock?: number;
  low_stock_threshold: number;
  stock_unit: StockUnit;
  dimension_summary: string;
}

export interface TransactionInsert {
  inventory_item_id: string;
  transaction_type: TransactionType;
  quantity_changed: number;   // enforce sign convention at call site
  pieces: number;
  stock_after: number;
  reference_notes?: string | null;
}

// ─── Update shapes ────────────────────────────────────────────────────────────

export interface ProductUpdate {
  name?: string;
  species?: string;
  timber_class?: TimberClass;
}

export interface InventoryItemUpdate {
  thickness?: number;
  width?: number | null;
  length_ft?: number | null;
  low_stock_threshold?: number;
  dimension_summary?: string;
}

// ─── Database map (used by createBrowserClient / createServerClient generics) ─

export interface Database {
  public: {
    Tables: {
      products: {
        Row: ProductRow;
        Insert: ProductInsert;
        Update: ProductUpdate;
      };
      inventory_items: {
        Row: InventoryItemRow;
        Insert: InventoryItemInsert;
        Update: InventoryItemUpdate;
      };
      transactions: {
        Row: TransactionRow;
        Insert: TransactionInsert;
        Update: never;          // ledger is append-only — no updates
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      timber_class: TimberClass;
      transaction_type: TransactionType;
      stock_unit: StockUnit;
    };
  };
}

// ─── Dashboard aggregate helpers (returned by RPC / manual aggregation) ───────

export interface DashboardStats {
  totalStockVolume: number;
  lowStockCount: number;
  recentSalesCount: number;    // last 7 days
}

export interface SpeciesChartPoint {
  species: string;
  dimensional: number;
  plank: number;
}

export interface VelocityPoint {
  day: string;                 // "Mon" … "Sun"
  restocks: number;
  sales: number;
  waste: number;
}
