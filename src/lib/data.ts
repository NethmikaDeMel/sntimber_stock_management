import type {
  TimberSpecies,
  DimensionalSize,
  PlankThickness,
  BulkStockEntry,
  LengthTrackedEntry,
  Transaction,
  LowStockAlert,
  ChartDataPoint,
  TransactionVelocityPoint,
} from "@/types/timber";

// ─── Species Master List ──────────────────────────────────────────────────────
export const SPECIES: TimberSpecies[] = [
  { id: "jak",      label: "Jak",      tracksLengths: true  },
  { id: "mahogany", label: "Mahogany", tracksLengths: false },
  { id: "albesia",  label: "Albesia",  tracksLengths: false },
  { id: "teak",     label: "Teak",     tracksLengths: false },
  { id: "pine",     label: "Pine",     tracksLengths: false },
  { id: "rubber",   label: "Rubber",   tracksLengths: false },
];

// ─── Size Definitions ─────────────────────────────────────────────────────────
export const DIMENSIONAL_SIZES: DimensionalSize[] = [
  { id: "3x4", label: '3" × 4"' },
  { id: "3x5", label: '3" × 5"' },
  { id: "3x6", label: '3" × 6"' },
  { id: "4x4", label: '4" × 4"' },
  { id: "4x6", label: '4" × 6"' },
  { id: "6x6", label: '6" × 6"' },
];

export const PLANK_THICKNESSES: PlankThickness[] = [
  { id: "034", label: '3/4"' },
  { id: "078", label: '7/8"' },
  { id: "100", label: '1"'   },
  { id: "125", label: '1-1/4"' },
  { id: "150", label: '1-1/2"' },
];

// ─── Bulk Stock (Standard species) ────────────────────────────────────────────
export const BULK_DIMENSIONAL_STOCK: Record<string, BulkStockEntry[]> = {
  mahogany: [
    { sizeId: "3x4", totalQuantity: 620, unit: "linear_ft", safetyThreshold: 200 },
    { sizeId: "3x5", totalQuantity: 480, unit: "linear_ft", safetyThreshold: 200 },
    { sizeId: "3x6", totalQuantity: 150, unit: "linear_ft", safetyThreshold: 200 },
    { sizeId: "4x4", totalQuantity: 330, unit: "linear_ft", safetyThreshold: 150 },
    { sizeId: "4x6", totalQuantity: 275, unit: "linear_ft", safetyThreshold: 150 },
    { sizeId: "6x6", totalQuantity: 90,  unit: "linear_ft", safetyThreshold: 100 },
  ],
  albesia: [
    { sizeId: "3x4", totalQuantity: 900, unit: "linear_ft", safetyThreshold: 300 },
    { sizeId: "3x5", totalQuantity: 750, unit: "linear_ft", safetyThreshold: 250 },
    { sizeId: "3x6", totalQuantity: 600, unit: "linear_ft", safetyThreshold: 200 },
    { sizeId: "4x4", totalQuantity: 420, unit: "linear_ft", safetyThreshold: 200 },
    { sizeId: "4x6", totalQuantity: 310, unit: "linear_ft", safetyThreshold: 150 },
    { sizeId: "6x6", totalQuantity: 180, unit: "linear_ft", safetyThreshold: 100 },
  ],
  teak: [
    { sizeId: "3x4", totalQuantity: 200, unit: "linear_ft", safetyThreshold: 150 },
    { sizeId: "3x5", totalQuantity: 170, unit: "linear_ft", safetyThreshold: 120 },
    { sizeId: "3x6", totalQuantity: 95,  unit: "linear_ft", safetyThreshold: 100 },
    { sizeId: "4x4", totalQuantity: 140, unit: "linear_ft", safetyThreshold: 100 },
    { sizeId: "4x6", totalQuantity: 80,  unit: "linear_ft", safetyThreshold: 80  },
    { sizeId: "6x6", totalQuantity: 45,  unit: "linear_ft", safetyThreshold: 50  },
  ],
  pine: [
    { sizeId: "3x4", totalQuantity: 1100, unit: "linear_ft", safetyThreshold: 400 },
    { sizeId: "3x5", totalQuantity: 850,  unit: "linear_ft", safetyThreshold: 300 },
    { sizeId: "3x6", totalQuantity: 700,  unit: "linear_ft", safetyThreshold: 250 },
    { sizeId: "4x4", totalQuantity: 500,  unit: "linear_ft", safetyThreshold: 200 },
    { sizeId: "4x6", totalQuantity: 380,  unit: "linear_ft", safetyThreshold: 150 },
    { sizeId: "6x6", totalQuantity: 220,  unit: "linear_ft", safetyThreshold: 100 },
  ],
  rubber: [
    { sizeId: "3x4", totalQuantity: 340, unit: "linear_ft", safetyThreshold: 150 },
    { sizeId: "3x5", totalQuantity: 280, unit: "linear_ft", safetyThreshold: 120 },
    { sizeId: "3x6", totalQuantity: 190, unit: "linear_ft", safetyThreshold: 100 },
    { sizeId: "4x4", totalQuantity: 210, unit: "linear_ft", safetyThreshold: 100 },
    { sizeId: "4x6", totalQuantity: 130, unit: "linear_ft", safetyThreshold: 80  },
    { sizeId: "6x6", totalQuantity: 75,  unit: "linear_ft", safetyThreshold: 50  },
  ],
};

export const BULK_PLANK_STOCK: Record<string, BulkStockEntry[]> = {
  mahogany: [
    { sizeId: "034", totalQuantity: 450, unit: "sq_ft", safetyThreshold: 150 },
    { sizeId: "078", totalQuantity: 380, unit: "sq_ft", safetyThreshold: 120 },
    { sizeId: "100", totalQuantity: 290, unit: "sq_ft", safetyThreshold: 100 },
    { sizeId: "125", totalQuantity: 180, unit: "sq_ft", safetyThreshold: 80  },
    { sizeId: "150", totalQuantity: 120, unit: "sq_ft", safetyThreshold: 60  },
  ],
  albesia: [
    { sizeId: "034", totalQuantity: 800, unit: "sq_ft", safetyThreshold: 250 },
    { sizeId: "078", totalQuantity: 650, unit: "sq_ft", safetyThreshold: 200 },
    { sizeId: "100", totalQuantity: 500, unit: "sq_ft", safetyThreshold: 150 },
    { sizeId: "125", totalQuantity: 300, unit: "sq_ft", safetyThreshold: 100 },
    { sizeId: "150", totalQuantity: 200, unit: "sq_ft", safetyThreshold: 80  },
  ],
  teak: [
    { sizeId: "034", totalQuantity: 180, unit: "sq_ft", safetyThreshold: 100 },
    { sizeId: "078", totalQuantity: 140, unit: "sq_ft", safetyThreshold: 80  },
    { sizeId: "100", totalQuantity: 90,  unit: "sq_ft", safetyThreshold: 70  },
    { sizeId: "125", totalQuantity: 60,  unit: "sq_ft", safetyThreshold: 50  },
    { sizeId: "150", totalQuantity: 40,  unit: "sq_ft", safetyThreshold: 40  },
  ],
  pine: [
    { sizeId: "034", totalQuantity: 1200, unit: "sq_ft", safetyThreshold: 400 },
    { sizeId: "078", totalQuantity: 950,  unit: "sq_ft", safetyThreshold: 300 },
    { sizeId: "100", totalQuantity: 700,  unit: "sq_ft", safetyThreshold: 250 },
    { sizeId: "125", totalQuantity: 450,  unit: "sq_ft", safetyThreshold: 150 },
    { sizeId: "150", totalQuantity: 300,  unit: "sq_ft", safetyThreshold: 100 },
  ],
  rubber: [
    { sizeId: "034", totalQuantity: 320, unit: "sq_ft", safetyThreshold: 120 },
    { sizeId: "078", totalQuantity: 260, unit: "sq_ft", safetyThreshold: 100 },
    { sizeId: "100", totalQuantity: 190, unit: "sq_ft", safetyThreshold: 80  },
    { sizeId: "125", totalQuantity: 130, unit: "sq_ft", safetyThreshold: 60  },
    { sizeId: "150", totalQuantity: 80,  unit: "sq_ft", safetyThreshold: 40  },
  ],
};

// ─── Jak – Length-tracked (Premium Exception) ─────────────────────────────────
export const JAK_DIMENSIONAL_STOCK: LengthTrackedEntry[] = [
  {
    sizeId: "3x4",
    profiles: [
      { lengthFt: 2, pieces: 48, unit: "pieces", safetyThreshold: 20 },
      { lengthFt: 4, pieces: 36, unit: "pieces", safetyThreshold: 15 },
      { lengthFt: 6, pieces: 24, unit: "pieces", safetyThreshold: 10 },
      { lengthFt: 8, pieces: 12, unit: "pieces", safetyThreshold: 8  },
    ],
  },
  {
    sizeId: "3x5",
    profiles: [
      { lengthFt: 2, pieces: 40, unit: "pieces", safetyThreshold: 15 },
      { lengthFt: 4, pieces: 28, unit: "pieces", safetyThreshold: 12 },
      { lengthFt: 6, pieces: 18, unit: "pieces", safetyThreshold: 8  },
      { lengthFt: 8, pieces: 8,  unit: "pieces", safetyThreshold: 6  },
    ],
  },
  {
    sizeId: "3x6",
    profiles: [
      { lengthFt: 4, pieces: 22, unit: "pieces", safetyThreshold: 10 },
      { lengthFt: 6, pieces: 16, unit: "pieces", safetyThreshold: 8  },
      { lengthFt: 8, pieces: 6,  unit: "pieces", safetyThreshold: 5  },
    ],
  },
  {
    sizeId: "4x4",
    profiles: [
      { lengthFt: 2, pieces: 30, unit: "pieces", safetyThreshold: 12 },
      { lengthFt: 4, pieces: 20, unit: "pieces", safetyThreshold: 10 },
      { lengthFt: 6, pieces: 14, unit: "pieces", safetyThreshold: 6  },
    ],
  },
  {
    sizeId: "4x6",
    profiles: [
      { lengthFt: 4, pieces: 15, unit: "pieces", safetyThreshold: 8  },
      { lengthFt: 6, pieces: 10, unit: "pieces", safetyThreshold: 6  },
      { lengthFt: 8, pieces: 4,  unit: "pieces", safetyThreshold: 4  },
    ],
  },
  {
    sizeId: "6x6",
    profiles: [
      { lengthFt: 4, pieces: 10, unit: "pieces", safetyThreshold: 5 },
      { lengthFt: 6, pieces: 6,  unit: "pieces", safetyThreshold: 4 },
    ],
  },
];

export const JAK_PLANK_STOCK: LengthTrackedEntry[] = [
  {
    sizeId: "034",
    profiles: [
      { lengthFt: 4, pieces: 60, unit: "pieces", safetyThreshold: 20 },
      { lengthFt: 6, pieces: 45, unit: "pieces", safetyThreshold: 15 },
      { lengthFt: 8, pieces: 30, unit: "pieces", safetyThreshold: 10 },
    ],
  },
  {
    sizeId: "078",
    profiles: [
      { lengthFt: 4, pieces: 50, unit: "pieces", safetyThreshold: 18 },
      { lengthFt: 6, pieces: 38, unit: "pieces", safetyThreshold: 12 },
      { lengthFt: 8, pieces: 22, unit: "pieces", safetyThreshold: 8  },
    ],
  },
  {
    sizeId: "100",
    profiles: [
      { lengthFt: 4, pieces: 35, unit: "pieces", safetyThreshold: 15 },
      { lengthFt: 6, pieces: 28, unit: "pieces", safetyThreshold: 10 },
      { lengthFt: 8, pieces: 15, unit: "pieces", safetyThreshold: 6  },
    ],
  },
  {
    sizeId: "125",
    profiles: [
      { lengthFt: 4, pieces: 25, unit: "pieces", safetyThreshold: 10 },
      { lengthFt: 6, pieces: 18, unit: "pieces", safetyThreshold: 8  },
    ],
  },
  {
    sizeId: "150",
    profiles: [
      { lengthFt: 4, pieces: 18, unit: "pieces", safetyThreshold: 8 },
      { lengthFt: 6, pieces: 12, unit: "pieces", safetyThreshold: 6 },
    ],
  },
];

// ─── Sample Transaction Log ───────────────────────────────────────────────────
export const SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: "t001",
    timestamp: "2026-06-02T08:15:00Z",
    type: "RESTOCK",
    pieces: 24,
    quantityImpacted: 240,
    unit: "linear_ft",
    referenceNotes: "INV-2026-0441",
  },
  {
    id: "t002",
    timestamp: "2026-06-02T09:42:00Z",
    type: "SALE",
    pieces: 8,
    quantityImpacted: 80,
    unit: "linear_ft",
    referenceNotes: "BILL-8821 – Kumar Construction",
  },
  {
    id: "t003",
    timestamp: "2026-06-01T14:30:00Z",
    type: "WASTE_CUT",
    pieces: 3,
    quantityImpacted: 18,
    unit: "linear_ft",
    referenceNotes: "Miscut – width tolerance failure",
  },
  {
    id: "t004",
    timestamp: "2026-06-01T11:10:00Z",
    type: "SALE",
    pieces: 12,
    quantityImpacted: 144,
    unit: "linear_ft",
    referenceNotes: "BILL-8820 – Silva Homes",
  },
  {
    id: "t005",
    timestamp: "2026-05-31T16:00:00Z",
    type: "RESTOCK",
    pieces: 40,
    quantityImpacted: 400,
    unit: "linear_ft",
    referenceNotes: "PO-2026-0388 – Hettiarachchi Sawmill",
  },
  {
    id: "t006",
    timestamp: "2026-05-31T10:20:00Z",
    type: "CORRECTION",
    pieces: 2,
    quantityImpacted: 20,
    unit: "linear_ft",
    referenceNotes: "Inventory count correction – Q2 audit",
  },
  {
    id: "t007",
    timestamp: "2026-05-30T15:45:00Z",
    type: "SALE",
    pieces: 6,
    quantityImpacted: 60,
    unit: "linear_ft",
    referenceNotes: "BILL-8817 – Perera & Sons",
  },
  {
    id: "t008",
    timestamp: "2026-05-30T09:05:00Z",
    type: "RESTOCK",
    pieces: 20,
    quantityImpacted: 200,
    unit: "linear_ft",
    referenceNotes: "INV-2026-0430",
  },
];

// ─── Dashboard Data ───────────────────────────────────────────────────────────
export const LOW_STOCK_ALERTS: LowStockAlert[] = [
  { species: "Teak",     timberClass: "dimensional", sizeLabel: '3" × 6"', current: 95,  threshold: 100, unit: "linear_ft" },
  { species: "Teak",     timberClass: "plank",       sizeLabel: '1-1/2"',  current: 40,  threshold: 40,  unit: "sq_ft"    },
  { species: "Mahogany", timberClass: "dimensional", sizeLabel: '6" × 6"', current: 90,  threshold: 100, unit: "linear_ft" },
  { species: "Teak",     timberClass: "dimensional", sizeLabel: '4" × 6"', current: 80,  threshold: 80,  unit: "linear_ft" },
  { species: "Jak",      timberClass: "dimensional", sizeLabel: '6" × 6" – 6ft', current: 6, threshold: 4,   unit: "pieces"   },
];

export const STOCK_CHART_DATA: ChartDataPoint[] = [
  { name: "Jak",      dimensional: 174, plank: 208 },
  { name: "Mahogany", dimensional: 1545, plank: 1540 },
  { name: "Albesia",  dimensional: 2160, plank: 3450 },
  { name: "Teak",     dimensional: 730,  plank: 510  },
  { name: "Pine",     dimensional: 3750, plank: 3600 },
  { name: "Rubber",   dimensional: 1225, plank: 980  },
];

export const VELOCITY_DATA: TransactionVelocityPoint[] = [
  { day: "Mon", restocks: 3, sales: 8, waste: 1 },
  { day: "Tue", restocks: 5, sales: 12, waste: 2 },
  { day: "Wed", restocks: 2, sales: 6,  waste: 0 },
  { day: "Thu", restocks: 7, sales: 15, waste: 3 },
  { day: "Fri", restocks: 4, sales: 18, waste: 1 },
  { day: "Sat", restocks: 1, sales: 10, waste: 0 },
  { day: "Sun", restocks: 0, sales: 4,  waste: 0 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function unitLabel(unit: string): string {
  switch (unit) {
    case "linear_ft": return "Linear Ft";
    case "sq_ft":     return "Sq. Ft";
    case "pieces":    return "Pcs";
    default:          return unit;
  }
}

export function getSpecies(id: string): TimberSpecies | undefined {
  return SPECIES.find((s) => s.id === id);
}
