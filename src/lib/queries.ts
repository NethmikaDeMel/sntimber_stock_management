import { createServerClient } from "@/lib/supabase/server";
import type {
  DashboardStats,
  SpeciesChartPoint,
  VelocityPoint,
  InventoryItemRow,
} from "@/types/supabase";
import type { LowStockAlert } from "@/types/timber";

/**
 * Fetch the four dashboard KPI numbers in parallel.
 * All queries run server-side — no data.ts imports.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createServerClient();

  const [stockResult, lowStockResult, salesResult] = await Promise.all([
    // Total stock volume across all items
    supabase
      .from("inventory_items")
      .select("current_stock"),

    // Count of items at or below threshold
    supabase
      .from("inventory_items")
      .select("id", { count: "exact", head: true })
      .filter("current_stock", "lte", "low_stock_threshold"),

    // Sales count in last 7 days
    supabase
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("transaction_type", "SALE")
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  const totalStockVolume =
    stockResult.data?.reduce((sum, r) => sum + (r.current_stock ?? 0), 0) ?? 0;

  return {
    totalStockVolume: Math.round(totalStockVolume),
    lowStockCount: lowStockResult.count ?? 0,
    recentSalesCount: salesResult.count ?? 0,
  };
}

/**
 * Fetch items currently at or below their low-stock threshold,
 * joined with their product name and species.
 */
export async function getLowStockAlerts(): Promise<LowStockAlert[]> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("inventory_items")
    .select(`
      current_stock,
      low_stock_threshold,
      stock_unit,
      dimension_summary,
      products ( name, species, timber_class )
    `)
    .filter("current_stock", "lte", "low_stock_threshold")
    .order("current_stock", { ascending: true })
    .limit(20);

  if (error || !data) {
    console.error("[getLowStockAlerts] error:", error);
    return [];
  }

  return data.map((row) => ({
    species: (row.products as { species: string } | null)?.species ?? "Unknown",
    timberClass:
      ((row.products as { timber_class: string } | null)?.timber_class as "dimensional" | "plank") ??
      "dimensional",
    sizeLabel: row.dimension_summary,
    current: row.current_stock,
    threshold: row.low_stock_threshold,
    unit: row.stock_unit,
  }));
}

/**
 * Aggregate stock totals per species, split by dimensional vs plank.
 * Used to populate the bar chart.
 */
export async function getStockChartData(): Promise<SpeciesChartPoint[]> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("inventory_items")
    .select(`
      current_stock,
      products ( species, timber_class )
    `);

  if (error || !data) {
    console.error("[getStockChartData] error:", error);
    return [];
  }

  // Aggregate in JS — fine at this scale; use a DB view for larger datasets
  const map: Record<string, { dimensional: number; plank: number }> = {};

  for (const row of data) {
    const product = row.products as { species: string; timber_class: string } | null;
    if (!product) continue;
    const { species, timber_class } = product;
    if (!map[species]) map[species] = { dimensional: 0, plank: 0 };
    if (timber_class === "dimensional") {
      map[species].dimensional += row.current_stock ?? 0;
    } else {
      map[species].plank += row.current_stock ?? 0;
    }
  }

  return Object.entries(map).map(([name, vals]) => ({
    name,
    dimensional: Math.round(vals.dimensional),
    plank: Math.round(vals.plank),
  }));
}

/**
 * Transaction velocity for the last 7 days — grouped by day + type.
 * Used for the area chart.
 */
export async function getVelocityData(): Promise<VelocityPoint[]> {
  const supabase = await createServerClient();

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("transactions")
    .select("transaction_type, created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: true });

  if (error || !data) {
    console.error("[getVelocityData] error:", error);
    return [];
  }

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const map: Record<string, { restocks: number; sales: number; waste: number }> = {};

  // Seed the last 7 days in order
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = days[d.getDay()];
    if (!map[key]) map[key] = { restocks: 0, sales: 0, waste: 0 };
  }

  for (const tx of data) {
    const d = new Date(tx.created_at);
    const key = days[d.getDay()];
    if (!map[key]) map[key] = { restocks: 0, sales: 0, waste: 0 };
    if (tx.transaction_type === "RESTOCK" || tx.transaction_type === "CORRECTION")
      map[key].restocks++;
    else if (tx.transaction_type === "SALE")
      map[key].sales++;
    else if (tx.transaction_type === "WASTE_CUT")
      map[key].waste++;
  }

  return Object.entries(map).map(([day, vals]) => ({ day, ...vals }));
}

/**
 * Fetch all inventory items for a given species, joined with their product.
 * Used by the [species] stock page.
 */
export async function getInventoryBySpecies(species: string): Promise<InventoryItemRow[]> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("inventory_items")
    .select(`
      *,
      products!inner ( id, name, species, timber_class, created_at, updated_at )
    `)
    .ilike("products.species", species)
    .order("thickness", { ascending: true });

  if (error) {
    console.error("[getInventoryBySpecies] error:", error);
    return [];
  }

  return (data ?? []) as InventoryItemRow[];
}

/**
 * Paginated transaction log for a specific inventory item.
 */
export async function getTransactionLog(
  inventoryItemId: string,
  page = 1,
  pageSize = 10
) {
  const supabase = await createServerClient();

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("transactions")
    .select("*", { count: "exact" })
    .eq("inventory_item_id", inventoryItemId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("[getTransactionLog] error:", error);
    return { rows: [], total: 0 };
  }

  return { rows: data ?? [], total: count ?? 0 };
}

/**
 * Fetch all products from the catalog.
 */
export async function getAllProducts() {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("species", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("[getAllProducts] error:", error);
    return [];
  }

  return data ?? [];
}

/**
 * Fetch all inventory variations with their joined product name.
 */
export async function getAllInventoryItems() {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("inventory_items")
    .select(`
      *,
      products ( name, species, timber_class )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getAllInventoryItems] error:", error);
    return [];
  }

  return data ?? [];
}
