"use client";

import { useState, useMemo, useTransition } from "react";
import type { TimberSpecies, TimberClass, ActionContext } from "@/types/timber";
import type { InventoryItemRow, TransactionRow } from "@/types/supabase";
import { logTransaction } from "@/actions/stock";
import { getBrowserClient } from "@/lib/supabase/browser";
import { ActionModal } from "./ActionModal";
import { AuditLogTable, type AuditRow } from "./AuditLogTable";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function unitLabel(unit: string) {
  switch (unit) {
    case "linear_ft": return "Lin. Ft";
    case "sq_ft":     return "Sq. Ft";
    case "pieces":    return "Pcs";
    default:          return unit;
  }
}

function StockBar({ current, threshold }: { current: number; threshold: number }) {
  const pct = Math.min(Math.round((current / Math.max(threshold * 3, 1)) * 100), 100);
  const isLow = current <= threshold;
  const color = isLow
    ? "var(--color-danger)"
    : pct < 50
    ? "var(--color-warning)"
    : "var(--color-forest-500)";
  return (
    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-surface-3)" }}>
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

// ─── Derive dynamic size tabs from inventory rows ─────────────────────────────
//
// For standard (bulk) species:
//   Each distinct `dimension_summary` becomes one tab.
//   The tab id = item.id, label = item.dimension_summary.
//
// For length-tracked species (Jak):
//   Group rows by their cross-section (thickness × width).
//   Each unique cross-section becomes one tab.
//   Tab id  = "TxW" e.g. "3x4", label = the summary of any member row (sans length).
//   Inside that tab we render all individual length-profile cards.

interface SizeTab {
  id: string;
  label: string;
}

function buildSizeTabs(
  classItems: InventoryItemRow[],
  tracksLengths: boolean
): SizeTab[] {
  if (!tracksLengths) {
    // One tab per distinct item — use item.id as key, dimension_summary as label
    return classItems.map((item) => ({
      id: item.id,
      label: item.dimension_summary,
    }));
  }

  // Jak: group by thickness × width → derive cross-section key
  const seen = new Map<string, string>(); // key → label
  for (const item of classItems) {
    const t = item.thickness;
    const w = item.width ?? 0;
    const key = `${t}x${w}`;
    if (!seen.has(key)) {
      // Build a cross-section label like '3" × 4"' by stripping the length suffix
      // (dimension_summary for Jak looks like '3" × 4" × 2\'')
      const label = item.dimension_summary
        .replace(/\s*×\s*[\d.]+'$/, "")   // strip " × 2'" part
        .trim();
      seen.set(key, label);
    }
  }
  return Array.from(seen.entries()).map(([id, label]) => ({ id, label }));
}

// ─── Stock card — bulk (single metric) ───────────────────────────────────────

function BulkCard({
  item,
  species,
  onAction,
}: {
  item: InventoryItemRow;
  species: TimberSpecies;
  onAction: (ctx: ActionContext) => void;
}) {
  const isLow = item.current_stock <= item.low_stock_threshold;
  const product = item.products as { name: string; species: string; timber_class: string } | undefined;

  function ctx(defaultType: "RESTOCK" | "SALE"): ActionContext {
    return {
      species,
      timberClass: (product?.timber_class ?? "dimensional") as TimberClass,
      sizeId: item.id,
      sizeLabel: item.dimension_summary,
      defaultType,
      unit: item.stock_unit as "linear_ft" | "sq_ft" | "pieces",
      inventoryItemId: item.id,
    };
  }

  return (
    <div
      className="card p-5 flex flex-col gap-4 relative overflow-hidden max-w-sm"
      style={{ borderColor: isLow ? "rgba(248,113,113,.35)" : "var(--color-border)" }}
    >
      {isLow && (
        <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: "var(--color-danger)" }} />
      )}

      <div className="flex items-start justify-between">
        <p className="font-display text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>
          {item.dimension_summary}
        </p>
        {isLow && (
          <span
            className="text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{ background: "rgba(248,113,113,.12)", color: "var(--color-danger)" }}
          >
            Low Stock
          </span>
        )}
      </div>

      <div>
        <p className="font-mono text-3xl font-bold" style={{ color: "var(--color-accent)" }}>
          {item.current_stock.toLocaleString()}
          <span className="text-base font-normal ml-1.5" style={{ color: "var(--color-text-muted)" }}>
            {unitLabel(item.stock_unit)}
          </span>
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
          Safety threshold: {item.low_stock_threshold} {unitLabel(item.stock_unit)}
        </p>
      </div>

      <StockBar current={item.current_stock} threshold={item.low_stock_threshold} />

      <div className="flex gap-2 mt-auto">
        <button
          onClick={() => onAction(ctx("RESTOCK"))}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{ background: "rgba(74,222,128,.1)", border: "1px solid rgba(74,222,128,.25)", color: "var(--color-success)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(74,222,128,.18)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(74,222,128,.1)")}
        >
          + Restock
        </button>
        <button
          onClick={() => onAction(ctx("SALE"))}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{ background: "rgba(96,165,250,.1)", border: "1px solid rgba(96,165,250,.25)", color: "var(--color-info)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(96,165,250,.18)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(96,165,250,.1)")}
        >
          − Log Sale
        </button>
      </div>
    </div>
  );
}

// ─── Stock card — length profile (Jak exception) ──────────────────────────────

function LengthProfileCard({
  item,
  species,
  onAction,
}: {
  item: InventoryItemRow;
  species: TimberSpecies;
  onAction: (ctx: ActionContext) => void;
}) {
  const isLow = item.current_stock <= item.low_stock_threshold;
  const product = item.products as { name: string; species: string; timber_class: string } | undefined;

  function ctx(defaultType: "RESTOCK" | "SALE"): ActionContext {
    return {
      species,
      timberClass: (product?.timber_class ?? "dimensional") as TimberClass,
      sizeId: item.id,
      sizeLabel: item.dimension_summary,
      defaultType,
      unit: "pieces",
      lengthFt: item.length_ft ?? undefined,
      inventoryItemId: item.id,
    };
  }

  return (
    <div
      className="card p-4 flex flex-col gap-3 relative overflow-hidden"
      style={{ borderColor: isLow ? "rgba(248,113,113,.35)" : "var(--color-border)" }}
    >
      {isLow && (
        <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: "var(--color-danger)" }} />
      )}

      <div className="flex items-center justify-between">
        <span
          className="px-3 py-1 rounded-full text-sm font-bold font-mono"
          style={{
            background: "rgba(212,134,42,.12)",
            color: "var(--color-accent)",
            border: "1px solid rgba(212,134,42,.25)",
          }}
        >
          {item.length_ft} ft Profile
        </span>
        {isLow && (
          <span
            className="text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{ background: "rgba(248,113,113,.12)", color: "var(--color-danger)" }}
          >
            Low
          </span>
        )}
      </div>

      <div>
        <p className="font-mono text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
          {item.current_stock}
          <span className="text-sm font-normal ml-1" style={{ color: "var(--color-text-muted)" }}>pcs</span>
        </p>
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          Min: {item.low_stock_threshold} pcs
        </p>
      </div>

      <StockBar current={item.current_stock} threshold={item.low_stock_threshold} />

      <div className="flex gap-1.5">
        <button
          onClick={() => onAction(ctx("RESTOCK"))}
          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold transition-all"
          style={{ background: "rgba(74,222,128,.1)", border: "1px solid rgba(74,222,128,.22)", color: "var(--color-success)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(74,222,128,.18)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(74,222,128,.1)")}
        >
          + Restock
        </button>
        <button
          onClick={() => onAction(ctx("SALE"))}
          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold transition-all"
          style={{ background: "rgba(96,165,250,.1)", border: "1px solid rgba(96,165,250,.22)", color: "var(--color-info)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(96,165,250,.18)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(96,165,250,.1)")}
        >
          − Sale
        </button>
      </div>
    </div>
  );
}

// ─── Size tab strip ───────────────────────────────────────────────────────────

function SizeTabs({
  tabs,
  activeId,
  onChange,
}: {
  tabs: SizeTab[];
  activeId: string;
  onChange: (id: string) => void;
}) {
  if (tabs.length === 0) return null;
  return (
    <div
      className="flex gap-1.5 flex-wrap p-1 rounded-xl"
      style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150"
            style={{
              background: isActive ? "var(--color-accent)" : "transparent",
              color: isActive ? "#fff" : "var(--color-text-secondary)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Main exported component ──────────────────────────────────────────────────

const PRIMARY_TABS: { id: TimberClass; label: string }[] = [
  { id: "dimensional", label: "Dimensional Timber" },
  { id: "plank",       label: "Plank / Board Timber" },
];

interface StockPageClientProps {
  species: TimberSpecies;
  inventoryItems: InventoryItemRow[];
}

export function StockPageClient({ species, inventoryItems }: StockPageClientProps) {
  const [activeClass, setActiveClass] = useState<TimberClass>("dimensional");
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionCtx, setActionCtx] = useState<ActionContext | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [auditRows, setAuditRows] = useState<AuditRow[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [, startTransition] = useTransition();

  // ── Filter to current class ──────────────────────────────────────────────────
  const classItems = useMemo(
    () =>
      inventoryItems.filter(
        (item) =>
          (item.products as { timber_class: string } | undefined)?.timber_class ===
          activeClass
      ),
    [inventoryItems, activeClass]
  );

  // ── Build tabs purely from DB rows ───────────────────────────────────────────
  const sizeTabs = useMemo(
    () => buildSizeTabs(classItems, species.tracksLengths),
    [classItems, species.tracksLengths]
  );

  // Keep activeTabId valid when tabs change
  const resolvedTabId = useMemo(() => {
    if (sizeTabs.length === 0) return null;
    if (activeTabId && sizeTabs.some((t) => t.id === activeTabId)) return activeTabId;
    return sizeTabs[0].id;
  }, [sizeTabs, activeTabId]);

  // ── Get items for the active tab ─────────────────────────────────────────────
  const activeItems = useMemo((): InventoryItemRow[] => {
    if (!resolvedTabId) return [];

    if (!species.tracksLengths) {
      // Each tab id is an item.id directly
      return classItems.filter((item) => item.id === resolvedTabId);
    }

    // Jak: resolvedTabId is "TxW" e.g. "3x4" — find all items matching that cross-section
    const [t, w] = resolvedTabId.split("x").map(Number);
    return classItems
      .filter((item) => item.thickness === t && item.width === w)
      .sort((a, b) => (a.length_ft ?? 0) - (b.length_ft ?? 0)); // ascending length
  }, [classItems, resolvedTabId, species.tracksLengths]);

  // ── Audit log — loaded per item when modal opens ─────────────────────────────
  async function loadAuditLog(inventoryItemId: string) {
    setAuditLoading(true);
    try {
      const supabase = getBrowserClient();
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .eq("inventory_item_id", inventoryItemId)
        .order("created_at", { ascending: false })
        .limit(100);

      const rows: AuditRow[] = (data ?? []).map((r: TransactionRow) => ({
        id: r.id,
        timestamp: r.created_at,
        type: r.transaction_type,
        pieces: r.pieces,
        quantityChanged: r.quantity_changed,
        unit: r.inventory_items?.stock_unit ?? "",
        referenceNotes: r.reference_notes ?? "",
      }));
      setAuditRows(rows);
    } catch {
      setAuditRows([]);
    }
    setAuditLoading(false);
  }

  function openModal(ctx: ActionContext) {
    setActionCtx(ctx);
    setModalOpen(true);
    setErrorMsg(null);
    if (ctx.inventoryItemId) loadAuditLog(ctx.inventoryItemId);
  }

  async function handleModalSubmit(data: {
    quantity: number;
    type: import("@/types/supabase").TransactionType;
    notes: string;
  }) {
    if (!actionCtx?.inventoryItemId) return { ok: false, error: "Missing item ID." };

    const result = await logTransaction({
      inventoryItemId: actionCtx.inventoryItemId,
      type: data.type,
      quantity: data.quantity,
      pieces: Math.ceil(data.quantity),
      referenceNotes: data.notes,
      species: species.id,
    });

    if (result.ok && actionCtx.inventoryItemId) {
      await loadAuditLog(actionCtx.inventoryItemId);
    } else if (!result.ok) {
      setErrorMsg(result.error ?? "Transaction failed.");
    }

    return result;
  }

  function handleClassChange(cls: TimberClass) {
    setActiveClass(cls);
    setActiveTabId(null); // reset → will auto-select first tab from new class
    setAuditRows([]);
    setErrorMsg(null);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Primary class tabs */}
      <div
        className="flex gap-1 p-1 rounded-xl mb-6 w-fit"
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
      >
        {PRIMARY_TABS.map((tab) => {
          const isActive = tab.id === activeClass;
          return (
            <button
              key={tab.id}
              onClick={() => handleClassChange(tab.id)}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
              style={{
                background: isActive
                  ? "linear-gradient(135deg, var(--color-timber-600), var(--color-timber-800))"
                  : "transparent",
                color: isActive ? "#fff" : "var(--color-text-secondary)",
                boxShadow: isActive ? "0 2px 8px rgba(212,134,42,.25)" : "none",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Dynamic secondary size tabs — derived from DB rows */}
      {sizeTabs.length > 0 ? (
        <SizeTabs
          tabs={sizeTabs}
          activeId={resolvedTabId ?? ""}
          onChange={(id) => {
            setActiveTabId(id);
            setAuditRows([]);
          }}
        />
      ) : (
        <div
          className="px-4 py-3 rounded-xl text-sm"
          style={{
            background: "var(--color-surface-2)",
            border: "1px dashed var(--color-border-2)",
            color: "var(--color-text-muted)",
          }}
        >
          No {activeClass} variants defined yet — add them in Stock Settings.
        </div>
      )}

      {/* Error banner */}
      {errorMsg && (
        <div
          className="mt-4 px-4 py-3 rounded-xl text-sm"
          style={{
            background: "rgba(248,113,113,.1)",
            border: "1px solid rgba(248,113,113,.3)",
            color: "var(--color-danger)",
          }}
        >
          {errorMsg}
        </div>
      )}

      {/* Stock cards */}
      <div className="mt-5">
        {activeItems.length === 0 ? (
          sizeTabs.length > 0 ? (
            <div
              className="flex items-center justify-center py-16 rounded-xl text-sm"
              style={{
                background: "var(--color-surface-2)",
                border: "1px dashed var(--color-border-2)",
                color: "var(--color-text-muted)",
              }}
            >
              No stock entries for this size. Add one in Stock Settings.
            </div>
          ) : null
        ) : species.tracksLengths ? (
          // Jak — one card per length profile
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {activeItems.map((item) => (
              <LengthProfileCard
                key={item.id}
                item={item}
                species={species}
                onAction={openModal}
              />
            ))}
          </div>
        ) : (
          // Standard bulk — single card
          <BulkCard item={activeItems[0]} species={species} onAction={openModal} />
        )}
      </div>

      {/* Audit log */}
      <div className="mt-6">
        <AuditLogTable rows={auditRows} loading={auditLoading} />
      </div>

      {/* Action modal */}
      <ActionModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setErrorMsg(null);
        }}
        context={actionCtx}
        onSubmit={handleModalSubmit}
      />
    </>
  );
}
