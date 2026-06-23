// ─── Species ─────────────────────────────────────────────────────────────────
export type TimberSpeciesId =
  | "jak"
  | "mahogany"
  | "albesia"
  | "teak"
  | "pine"
  | "rubber";

export interface TimberSpecies {
  id: TimberSpeciesId;
  label: string;
  /** If true, stock is tracked per distinct length (Jak behaviour) */
  tracksLengths: boolean;
}

// ─── Timber Classes ───────────────────────────────────────────────────────────
export type TimberClass = "dimensional" | "plank";

// ─── Size Profiles ────────────────────────────────────────────────────────────
export interface DimensionalSize {
  id: string;        // e.g. "3x4"
  label: string;     // e.g. "3\" × 4\""
}

export interface PlankThickness {
  id: string;        // e.g. "075"
  label: string;     // e.g. '3/4"'
}

// ─── Stock Entries ────────────────────────────────────────────────────────────
export interface BulkStockEntry {
  sizeId: string;
  totalQuantity: number;
  unit: "linear_ft" | "sq_ft" | "pieces";
  safetyThreshold: number;
}

export interface LengthProfile {
  lengthFt: number;   // e.g. 2 = "2ft Profile"
  pieces: number;
  unit: "pieces";
  safetyThreshold: number;
}

export interface LengthTrackedEntry {
  sizeId: string;
  profiles: LengthProfile[];
}

// ─── Transactions ─────────────────────────────────────────────────────────────
export type TransactionType = "RESTOCK" | "SALE" | "WASTE_CUT" | "CORRECTION";

export interface Transaction {
  id: string;
  timestamp: string;        // ISO string
  type: TransactionType;
  pieces: number;
  quantityImpacted: number;
  unit: string;
  referenceNotes: string;
  /** optional – set for length-tracked items */
  lengthFt?: number;
}

// ─── Stock Context (used by Action Modal) ─────────────────────────────────────
export interface ActionContext {
  species: TimberSpecies;
  timberClass: TimberClass;
  sizeId: string;
  sizeLabel: string;
  defaultType: TransactionType;
  /** Only for length-tracked items */
  lengthFt?: number;
  unit: "linear_ft" | "sq_ft" | "pieces";
  /** UUID of the inventory_items row — required for Supabase mutations */
  inventoryItemId?: string;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export interface StatCard {
  label: string;
  value: string | number;
  subtext: string;
  trend?: "up" | "down" | "neutral";
  icon: string;
}

export interface LowStockAlert {
  species: string;
  timberClass: TimberClass;
  sizeLabel: string;
  current: number;
  threshold: number;
  unit: string;
}

export interface ChartDataPoint {
  name: string;
  dimensional: number;
  plank: number;
}

export interface TransactionVelocityPoint {
  day: string;
  restocks: number;
  sales: number;
  waste: number;
}

// ─── Stock Settings ───────────────────────────────────────────────────────────

/** Base catalog entry — the "product profile" record */
export interface ProductProfile {
  id: string;
  name: string;         // e.g. "Jak Premium"
  species: string;      // e.g. "Jak"
  timberClass: TimberClass;
  createdAt: string;    // ISO
}

/** A single physical variation row in the inventory layout */
export interface InventoryVariation {
  id: string;
  productId: string;    // FK → ProductProfile.id
  productName: string;  // denormalised for display
  species: string;
  timberClass: TimberClass;
  thickness: number;    // inches, e.g. 3.00
  /** Width in inches — only for DIMENSIONAL; undefined/null for PLANK */
  width?: number;
  /** Length in feet — only for Jak DIMENSIONAL */
  lengthFt?: number;
  currentStock: number;
  alertThreshold: number;
  /** Human-readable dimension string built at save time */
  dimensionSummary: string;
}

/** Form state for the Product form */
export interface ProductFormState {
  id: string | null;
  name: string;
  species: string;
  timberClass: TimberClass | "";
}

/** Form state for the Inventory Variation form */
export interface VariationFormState {
  id: string | null;
  productId: string;
  thickness: string;
  width: string;
  lengthFt: string;
  alertThreshold: string;
}
