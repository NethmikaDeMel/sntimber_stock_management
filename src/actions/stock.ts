"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import type { TransactionType } from "@/types/supabase";

// ─── Sign convention ──────────────────────────────────────────────────────────
// RESTOCK    → positive quantity_changed
// SALE       → negative quantity_changed
// WASTE_CUT  → negative quantity_changed
// CORRECTION → signed by caller (can be + or -)

function toSignedQuantity(type: TransactionType, absQty: number): number {
  switch (type) {
    case "RESTOCK":
    case "CORRECTION":
      return Math.abs(absQty);       // positive
    case "SALE":
    case "WASTE_CUT":
      return -Math.abs(absQty);      // negative
  }
}

// ─── Result type returned to the client ───────────────────────────────────────
export interface ActionResult {
  ok: boolean;
  error?: string;
}

// ─── Core: Log a stock transaction ───────────────────────────────────────────
/**
 * Calls the atomic `apply_stock_transaction` DB function which:
 *   1. Locks the inventory_item row
 *   2. Updates current_stock
 *   3. Inserts a transaction ledger row
 * All in a single DB round-trip to prevent race conditions.
 */
export async function logTransaction(payload: {
  inventoryItemId: string;
  type: TransactionType;
  /** Always pass a POSITIVE number — sign is derived from type */
  quantity: number;
  pieces: number;
  referenceNotes: string;
  /** The species route param — used for revalidatePath */
  species: string;
}): Promise<ActionResult> {
  try {
    const supabase = await createServerClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { ok: false, error: "You must be signed in to log a transaction." };
    }

    const signedQty = toSignedQuantity(payload.type, payload.quantity);

    const { error } = await supabase.rpc("apply_stock_transaction", {
      p_item_id:          payload.inventoryItemId,
      p_type:             payload.type,
      p_quantity_changed: signedQty,
      p_pieces:           payload.pieces,
      p_notes:            payload.referenceNotes || null,
      p_user_id:          user.id,
    });

    if (error) {
      console.error("[logTransaction] Supabase RPC error:", error);
      // Surface a safe message — do not expose raw DB errors to the UI
      if (error.message.includes("Stock cannot go below zero")) {
        return { ok: false, error: "Insufficient stock — quantity would go below zero." };
      }
      return { ok: false, error: "Failed to record transaction. Please try again." };
    }

    // Revalidate the species stock page so the updated balance is reflected
    revalidatePath(`/dashboard/stock/${payload.species}`);
    revalidatePath("/dashboard");

    return { ok: true };
  } catch (err) {
    console.error("[logTransaction] Unexpected error:", err);
    return { ok: false, error: "An unexpected error occurred. Please try again." };
  }
}

// ─── Products: Create ─────────────────────────────────────────────────────────
export async function createProduct(payload: {
  name: string;
  species: string;
  timberClass: "dimensional" | "plank";
}): Promise<ActionResult & { id?: string }> {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from("products")
      .insert({
        name: payload.name.trim(),
        species: payload.species.trim(),
        timber_class: payload.timberClass,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[createProduct] error:", error);
      return { ok: false, error: "Failed to create product. Please try again." };
    }

    revalidatePath("/dashboard/stock-settings");
    return { ok: true, id: data.id };
  } catch (err) {
    console.error("[createProduct] unexpected:", err);
    return { ok: false, error: "An unexpected error occurred." };
  }
}

// ─── Products: Update ─────────────────────────────────────────────────────────
export async function updateProduct(payload: {
  id: string;
  name: string;
  species: string;
  timberClass: "dimensional" | "plank";
}): Promise<ActionResult> {
  try {
    const supabase = await createServerClient();

    const { error } = await supabase
      .from("products")
      .update({
        name: payload.name.trim(),
        species: payload.species.trim(),
        timber_class: payload.timberClass,
      })
      .eq("id", payload.id);

    if (error) {
      console.error("[updateProduct] error:", error);
      return { ok: false, error: "Failed to update product. Please try again." };
    }

    revalidatePath("/dashboard/stock-settings");
    return { ok: true };
  } catch (err) {
    console.error("[updateProduct] unexpected:", err);
    return { ok: false, error: "An unexpected error occurred." };
  }
}

// ─── Inventory Items: Create ──────────────────────────────────────────────────
export async function createInventoryItem(payload: {
  productId: string;
  thickness: number;
  width?: number | null;
  lengthFt?: number | null;
  alertThreshold: number;
  stockUnit: "linear_ft" | "sq_ft" | "pieces";
  dimensionSummary: string;
}): Promise<ActionResult & { id?: string }> {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from("inventory_items")
      .insert({
        product_id:          payload.productId,
        thickness:           payload.thickness,
        width:               payload.width ?? null,
        length_ft:           payload.lengthFt ?? null,
        current_stock:       0,
        low_stock_threshold: payload.alertThreshold,
        stock_unit:          payload.stockUnit,
        dimension_summary:   payload.dimensionSummary,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[createInventoryItem] error:", error);
      return { ok: false, error: "Failed to create inventory item. Please try again." };
    }

    revalidatePath("/dashboard/stock-settings");
    revalidatePath("/dashboard");
    return { ok: true, id: data.id };
  } catch (err) {
    console.error("[createInventoryItem] unexpected:", err);
    return { ok: false, error: "An unexpected error occurred." };
  }
}

// ─── Inventory Items: Update ──────────────────────────────────────────────────
export async function updateInventoryItem(payload: {
  id: string;
  thickness: number;
  width?: number | null;
  lengthFt?: number | null;
  alertThreshold: number;
  dimensionSummary: string;
}): Promise<ActionResult> {
  try {
    const supabase = await createServerClient();

    const { error } = await supabase
      .from("inventory_items")
      .update({
        thickness:           payload.thickness,
        width:               payload.width ?? null,
        length_ft:           payload.lengthFt ?? null,
        low_stock_threshold: payload.alertThreshold,
        dimension_summary:   payload.dimensionSummary,
      })
      .eq("id", payload.id);

    if (error) {
      console.error("[updateInventoryItem] error:", error);
      return { ok: false, error: "Failed to update item. Please try again." };
    }

    revalidatePath("/dashboard/stock-settings");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (err) {
    console.error("[updateInventoryItem] unexpected:", err);
    return { ok: false, error: "An unexpected error occurred." };
  }
}
