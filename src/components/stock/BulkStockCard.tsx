"use client";

import { Plus, Minus, AlertTriangle } from "lucide-react";
import type { BulkStockEntry, TimberSpecies, TimberClass, ActionContext } from "@/types/timber";
import { DIMENSIONAL_SIZES, PLANK_THICKNESSES, unitLabel } from "@/lib/data";

interface BulkStockCardProps {
  entry: BulkStockEntry;
  species: TimberSpecies;
  timberClass: TimberClass;
  onAction: (ctx: ActionContext) => void;
}

export function BulkStockCard({
  entry,
  species,
  timberClass,
  onAction,
}: BulkStockCardProps) {
  const isLow = entry.totalQuantity <= entry.safetyThreshold;
  const pct = Math.min(
    Math.round((entry.totalQuantity / (entry.safetyThreshold * 3)) * 100),
    100
  );

  const sizeList =
    timberClass === "dimensional" ? DIMENSIONAL_SIZES : PLANK_THICKNESSES;
  const sizeLabel =
    sizeList.find((s) => s.id === entry.sizeId)?.label ?? entry.sizeId;

  function buildCtx(type: "RESTOCK" | "SALE"): ActionContext {
    return {
      species,
      timberClass,
      sizeId: entry.sizeId,
      sizeLabel,
      defaultType: type,
      unit: entry.unit,
    };
  }

  const barColor = isLow
    ? "var(--color-danger)"
    : pct < 50
    ? "var(--color-warning)"
    : "var(--color-forest-500)";

  return (
    <div
      className="card p-5 flex flex-col gap-4 relative overflow-hidden"
      style={{
        borderColor: isLow ? "rgba(248,113,113,.35)" : "var(--color-border)",
      }}
    >
      {isLow && (
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: "var(--color-danger)" }}
        />
      )}

      {/* Top row */}
      <div className="flex items-start justify-between">
        <div>
          <p
            className="text-xs uppercase tracking-widest font-semibold mb-1"
            style={{ color: "var(--color-text-muted)" }}
          >
            {timberClass === "dimensional" ? "Cross-Section" : "Thickness"}
          </p>
          <p
            className="font-display text-xl font-bold"
            style={{ color: "var(--color-text-primary)" }}
          >
            {sizeLabel}
          </p>
        </div>
        {isLow && (
          <div
            className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold"
            style={{
              background: "rgba(248,113,113,.12)",
              color: "var(--color-danger)",
            }}
          >
            <AlertTriangle size={11} />
            Low Stock
          </div>
        )}
      </div>

      {/* Metric */}
      <div>
        <p
          className="font-mono text-3xl font-bold"
          style={{ color: "var(--color-accent)" }}
        >
          {entry.totalQuantity.toLocaleString()}
          <span
            className="text-base font-normal ml-1.5"
            style={{ color: "var(--color-text-muted)" }}
          >
            {unitLabel(entry.unit)}
          </span>
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
          Safety threshold: {entry.safetyThreshold} {unitLabel(entry.unit)}
        </p>
      </div>

      {/* Stock level bar */}
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ background: "var(--color-surface-3)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <button
          onClick={() => onAction(buildCtx("RESTOCK"))}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: "rgba(74,222,128,.1)",
            border: "1px solid rgba(74,222,128,.25)",
            color: "var(--color-success)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(74,222,128,.18)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "rgba(74,222,128,.1)")
          }
        >
          <Plus size={15} /> Restock
        </button>
        <button
          onClick={() => onAction(buildCtx("SALE"))}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: "rgba(96,165,250,.1)",
            border: "1px solid rgba(96,165,250,.25)",
            color: "var(--color-info)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(96,165,250,.18)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "rgba(96,165,250,.1)")
          }
        >
          <Minus size={15} /> Log Sale
        </button>
      </div>
    </div>
  );
}
