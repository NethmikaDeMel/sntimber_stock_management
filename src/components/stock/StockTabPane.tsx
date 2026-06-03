"use client";

import { useState } from "react";
import type {
  TimberSpecies,
  TimberClass,
  ActionContext,
} from "@/types/timber";
import {
  DIMENSIONAL_SIZES,
  PLANK_THICKNESSES,
  BULK_DIMENSIONAL_STOCK,
  BULK_PLANK_STOCK,
  JAK_DIMENSIONAL_STOCK,
  JAK_PLANK_STOCK,
  SAMPLE_TRANSACTIONS,
} from "@/lib/data";
import { BulkStockCard } from "./BulkStockCard";
import { LengthTrackedSection } from "./LengthTrackedSection";
import { AuditLogTable } from "./AuditLogTable";
import { ActionModal } from "./ActionModal";
import type { TransactionType } from "@/types/timber";

interface StockTabPaneProps {
  species: TimberSpecies;
  timberClass: TimberClass;
}

export function StockTabPane({ species, timberClass }: StockTabPaneProps) {
  const sizes =
    timberClass === "dimensional" ? DIMENSIONAL_SIZES : PLANK_THICKNESSES;

  const [activeSize, setActiveSize] = useState(sizes[0].id);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionCtx, setActionCtx] = useState<ActionContext | null>(null);

  function openModal(ctx: ActionContext) {
    setActionCtx(ctx);
    setModalOpen(true);
  }

  function handleSubmit(data: {
    quantity: number;
    type: TransactionType;
    notes: string;
  }) {
    // In production: dispatch to state manager / API
    console.log("Transaction submitted:", data, actionCtx);
  }

  // ── Jak (length-tracked) ──
  if (species.tracksLengths) {
    const stockData =
      timberClass === "dimensional" ? JAK_DIMENSIONAL_STOCK : JAK_PLANK_STOCK;
    const activeEntry = stockData.find((e) => e.sizeId === activeSize);

    return (
      <>
        {/* Nested size tabs */}
        <SizeTabs
          sizes={sizes}
          activeSize={activeSize}
          onChange={setActiveSize}
        />

        <div className="mt-5">
          {activeEntry ? (
            <LengthTrackedSection
              entry={activeEntry}
              species={species}
              timberClass={timberClass}
              onAction={openModal}
            />
          ) : (
            <EmptyState />
          )}
        </div>

        <div className="mt-6">
          <AuditLogTable transactions={SAMPLE_TRANSACTIONS} />
        </div>

        <ActionModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          context={actionCtx}
          onSubmit={handleSubmit}
        />
      </>
    );
  }

  // ── Standard bulk species ──
  const stockMap =
    timberClass === "dimensional"
      ? BULK_DIMENSIONAL_STOCK
      : BULK_PLANK_STOCK;
  const entries = stockMap[species.id] ?? [];
  const activeEntry = entries.find((e) => e.sizeId === activeSize);

  return (
    <>
      {/* Nested size tabs */}
      <SizeTabs
        sizes={sizes}
        activeSize={activeSize}
        onChange={setActiveSize}
      />

      <div className="mt-5">
        {activeEntry ? (
          <div className="max-w-sm">
            <BulkStockCard
              entry={activeEntry}
              species={species}
              timberClass={timberClass}
              onAction={openModal}
            />
          </div>
        ) : (
          <EmptyState />
        )}
      </div>

      <div className="mt-6">
        <AuditLogTable transactions={SAMPLE_TRANSACTIONS} />
      </div>

      <ActionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        context={actionCtx}
        onSubmit={handleSubmit}
      />
    </>
  );
}

// ── Shared Sub-components ──────────────────────────────────────────────────────

interface SizeTab {
  id: string;
  label: string;
}

function SizeTabs({
  sizes,
  activeSize,
  onChange,
}: {
  sizes: SizeTab[];
  activeSize: string;
  onChange: (id: string) => void;
}) {
  return (
    <div
      className="flex gap-1.5 flex-wrap p-1 rounded-xl"
      style={{
        background: "var(--color-surface-2)",
        border: "1px solid var(--color-border)",
      }}
    >
      {sizes.map((size) => {
        const isActive = size.id === activeSize;
        return (
          <button
            key={size.id}
            onClick={() => onChange(size.id)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150"
            style={{
              background: isActive ? "var(--color-accent)" : "transparent",
              color: isActive
                ? "#fff"
                : "var(--color-text-secondary)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {size.label}
          </button>
        );
      })}
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="flex items-center justify-center py-16 rounded-xl text-sm"
      style={{
        background: "var(--color-surface-2)",
        border: "1px dashed var(--color-border-2)",
        color: "var(--color-text-muted)",
      }}
    >
      No stock data for this size.
    </div>
  );
}
