"use client";

import { AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { SPECIES } from "@/lib/data";
import type { LowStockAlert } from "@/types/timber";

function AlertRow({ alert }: { alert: LowStockAlert }) {
  const pct = Math.round((alert.current / alert.threshold) * 100);
  const isCritical = alert.current <= alert.threshold;
  const speciesId = SPECIES.find(
    (s) => s.label.toLowerCase() === alert.species.toLowerCase()
  )?.id;

  return (
    <div
      className="flex items-center gap-4 px-4 py-3 rounded-xl transition-colors"
      style={{
        background: isCritical ? "rgba(248,113,113,.06)" : "rgba(251,191,36,.05)",
        border: `1px solid ${isCritical ? "rgba(248,113,113,.2)" : "rgba(251,191,36,.15)"}`,
      }}
    >
      <div
        className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
        style={{
          background: isCritical ? "rgba(248,113,113,.15)" : "rgba(251,191,36,.12)",
          color: isCritical ? "var(--color-danger)" : "var(--color-warning)",
        }}
      >
        <AlertTriangle size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
            {alert.species}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: "var(--color-surface-3)", color: "var(--color-text-muted)" }}
          >
            {alert.timberClass === "dimensional" ? "Dimensional" : "Plank"}
          </span>
          <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {alert.sizeLabel}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-surface-3)" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(pct, 100)}%`,
                background: isCritical ? "var(--color-danger)" : "var(--color-warning)",
              }}
            />
          </div>
          <span className="text-xs font-mono shrink-0" style={{ color: isCritical ? "var(--color-danger)" : "var(--color-warning)" }}>
            {alert.current} / {alert.threshold} {alert.unit}
          </span>
        </div>
      </div>
      {speciesId && (
        <Link
          href={`/dashboard/stock/${speciesId}`}
          className="shrink-0 flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-colors"
          style={{
            background: "var(--color-surface-3)",
            color: "var(--color-text-muted)",
            border: "1px solid var(--color-border)",
          }}
        >
          View <ArrowRight size={12} />
        </Link>
      )}
    </div>
  );
}

export function LowStockFeed({ alerts }: { alerts: LowStockAlert[] }) {
  return (
    <div className="card p-5" style={{ borderColor: "var(--color-border)" }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>
            Low Stock Warnings
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
            Items at or below safety threshold
          </p>
        </div>
        <span
          className="text-xs font-mono px-2.5 py-1 rounded-full font-semibold"
          style={{ background: "rgba(248,113,113,.15)", color: "var(--color-danger)" }}
        >
          {alerts.length} alert{alerts.length !== 1 ? "s" : ""}
        </span>
      </div>
      {alerts.length === 0 ? (
        <div
          className="flex items-center justify-center py-10 rounded-xl text-sm"
          style={{ background: "var(--color-surface-2)", color: "var(--color-success)" }}
        >
          ✓ All stock levels are healthy
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {alerts.map((alert, i) => (
            <AlertRow key={i} alert={alert} />
          ))}
        </div>
      )}
    </div>
  );
}
