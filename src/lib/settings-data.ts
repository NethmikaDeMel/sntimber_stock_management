import type { ProductProfile, InventoryVariation } from "@/types/timber";

// ─── Seed Product Profiles ────────────────────────────────────────────────────
export const SEED_PRODUCTS: ProductProfile[] = [
  { id: "pp-001", name: "Jak Premium",       species: "Jak",      timberClass: "dimensional", createdAt: "2026-01-10T08:00:00Z" },
  { id: "pp-002", name: "Jak Board",         species: "Jak",      timberClass: "plank",       createdAt: "2026-01-10T08:05:00Z" },
  { id: "pp-003", name: "Mahogany Standard", species: "Mahogany", timberClass: "dimensional", createdAt: "2026-01-12T09:00:00Z" },
  { id: "pp-004", name: "Mahogany Plank",    species: "Mahogany", timberClass: "plank",       createdAt: "2026-01-12T09:10:00Z" },
  { id: "pp-005", name: "Albesia Bulk",      species: "Albesia",  timberClass: "dimensional", createdAt: "2026-01-15T10:00:00Z" },
  { id: "pp-006", name: "Albesia Board",     species: "Albesia",  timberClass: "plank",       createdAt: "2026-01-15T10:05:00Z" },
  { id: "pp-007", name: "Teak Select",       species: "Teak",     timberClass: "dimensional", createdAt: "2026-02-01T08:00:00Z" },
  { id: "pp-008", name: "Teak Plank",        species: "Teak",     timberClass: "plank",       createdAt: "2026-02-01T08:05:00Z" },
  { id: "pp-009", name: "Pine Structural",   species: "Pine",     timberClass: "dimensional", createdAt: "2026-02-10T07:30:00Z" },
  { id: "pp-010", name: "Pine Sheet",        species: "Pine",     timberClass: "plank",       createdAt: "2026-02-10T07:35:00Z" },
  { id: "pp-011", name: "Rubber General",    species: "Rubber",   timberClass: "dimensional", createdAt: "2026-03-01T09:00:00Z" },
  { id: "pp-012", name: "Rubber Board",      species: "Rubber",   timberClass: "plank",       createdAt: "2026-03-01T09:05:00Z" },
];

// ─── Seed Inventory Variations ────────────────────────────────────────────────
export const SEED_VARIATIONS: InventoryVariation[] = [
  // Jak Premium – Dimensional (length-tracked)
  {
    id: "iv-001", productId: "pp-001", productName: "Jak Premium",
    species: "Jak", timberClass: "dimensional",
    thickness: 3, width: 4, lengthFt: 2,
    currentStock: 48, alertThreshold: 20,
    dimensionSummary: '3" × 4" × 2\'',
  },
  {
    id: "iv-002", productId: "pp-001", productName: "Jak Premium",
    species: "Jak", timberClass: "dimensional",
    thickness: 3, width: 4, lengthFt: 4,
    currentStock: 36, alertThreshold: 15,
    dimensionSummary: '3" × 4" × 4\'',
  },
  {
    id: "iv-003", productId: "pp-001", productName: "Jak Premium",
    species: "Jak", timberClass: "dimensional",
    thickness: 3, width: 6, lengthFt: 6,
    currentStock: 24, alertThreshold: 10,
    dimensionSummary: '3" × 6" × 6\'',
  },
  // Jak Board – Plank
  {
    id: "iv-004", productId: "pp-002", productName: "Jak Board",
    species: "Jak", timberClass: "plank",
    thickness: 0.75,
    currentStock: 60, alertThreshold: 20,
    dimensionSummary: '3/4" Plank',
  },
  {
    id: "iv-005", productId: "pp-002", productName: "Jak Board",
    species: "Jak", timberClass: "plank",
    thickness: 1,
    currentStock: 35, alertThreshold: 15,
    dimensionSummary: '1" Plank',
  },
  // Mahogany Standard – Dimensional
  {
    id: "iv-006", productId: "pp-003", productName: "Mahogany Standard",
    species: "Mahogany", timberClass: "dimensional",
    thickness: 3, width: 4,
    currentStock: 620, alertThreshold: 200,
    dimensionSummary: '3" × 4"',
  },
  {
    id: "iv-007", productId: "pp-003", productName: "Mahogany Standard",
    species: "Mahogany", timberClass: "dimensional",
    thickness: 3, width: 6,
    currentStock: 150, alertThreshold: 200,
    dimensionSummary: '3" × 6"',
  },
  {
    id: "iv-008", productId: "pp-003", productName: "Mahogany Standard",
    species: "Mahogany", timberClass: "dimensional",
    thickness: 6, width: 6,
    currentStock: 90, alertThreshold: 100,
    dimensionSummary: '6" × 6"',
  },
  // Mahogany Plank
  {
    id: "iv-009", productId: "pp-004", productName: "Mahogany Plank",
    species: "Mahogany", timberClass: "plank",
    thickness: 0.75,
    currentStock: 450, alertThreshold: 150,
    dimensionSummary: '3/4" Plank',
  },
  {
    id: "iv-010", productId: "pp-004", productName: "Mahogany Plank",
    species: "Mahogany", timberClass: "plank",
    thickness: 1,
    currentStock: 290, alertThreshold: 100,
    dimensionSummary: '1" Plank',
  },
  // Teak Select – Dimensional
  {
    id: "iv-011", productId: "pp-007", productName: "Teak Select",
    species: "Teak", timberClass: "dimensional",
    thickness: 3, width: 4,
    currentStock: 200, alertThreshold: 150,
    dimensionSummary: '3" × 4"',
  },
  {
    id: "iv-012", productId: "pp-007", productName: "Teak Select",
    species: "Teak", timberClass: "dimensional",
    thickness: 4, width: 6,
    currentStock: 80, alertThreshold: 80,
    dimensionSummary: '4" × 6"',
  },
  // Pine Structural
  {
    id: "iv-013", productId: "pp-009", productName: "Pine Structural",
    species: "Pine", timberClass: "dimensional",
    thickness: 3, width: 4,
    currentStock: 1100, alertThreshold: 400,
    dimensionSummary: '3" × 4"',
  },
  {
    id: "iv-014", productId: "pp-010", productName: "Pine Sheet",
    species: "Pine", timberClass: "plank",
    thickness: 0.75,
    currentStock: 1200, alertThreshold: 400,
    dimensionSummary: '3/4" Plank',
  },
];

/** Build a readable dimension summary string from form values */
export function buildDimensionSummary(params: {
  timberClass: "dimensional" | "plank";
  thickness: number;
  width?: number;
  lengthFt?: number;
}): string {
  const { timberClass, thickness, width, lengthFt } = params;

  function inchLabel(n: number) {
    if (n === 0.75) return '3/4"';
    if (n === 0.875) return '7/8"';
    if (n === 1.25) return '1-1/4"';
    if (n === 1.5) return '1-1/2"';
    return `${n}"`;
  }

  if (timberClass === "plank") {
    return `${inchLabel(thickness)} Plank`;
  }
  // dimensional
  const base = `${inchLabel(thickness)} × ${inchLabel(width ?? 0)}`;
  return lengthFt ? `${base} × ${lengthFt}'` : base;
}

/** Generate a simple unique id (for client-side mock) */
export function genId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
