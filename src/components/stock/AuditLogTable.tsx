"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { TransactionType } from "@/types/supabase";

export interface AuditRow {
  id: string;
  timestamp: string;
  type: TransactionType;
  pieces: number;
  quantityChanged: number;   // always the raw signed value from DB
  unit: string;
  referenceNotes: string;
  lengthFt?: number;
}

interface AuditLogTableProps {
  rows: AuditRow[];
  loading?: boolean;
}

const PAGE_SIZE = 8;

function TypeBadge({ type }: { type: TransactionType }) {
  const map: Record<TransactionType, { bg: string; color: string; label: string }> = {
    RESTOCK:    { bg: "rgba(74,222,128,.15)",  color: "var(--color-success)", label: "Restock"     },
    SALE:       { bg: "rgba(96,165,250,.15)",   color: "var(--color-info)",    label: "Sale"        },
    WASTE_CUT:  { bg: "rgba(248,113,113,.15)",  color: "var(--color-danger)",  label: "Waste / Cut" },
    CORRECTION: { bg: "rgba(251,191,36,.15)",   color: "var(--color-warning)", label: "Correction"  },
  };
  const s = map[type];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: s.bg, color: s.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
      {s.label}
    </span>
  );
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
  };
}

function unitLabel(unit: string) {
  switch (unit) {
    case "linear_ft": return "Lin. Ft";
    case "sq_ft":     return "Sq. Ft";
    case "pieces":    return "Pcs";
    default:          return unit;
  }
}

export function AuditLogTable({ rows, loading = false }: AuditLogTableProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const paged = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="card overflow-hidden" style={{ borderColor: "var(--color-border)" }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        <div>
          <h3
            className="font-display text-sm font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            Audit Log
          </h3>
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            {rows.length} transaction{rows.length !== 1 ? "s" : ""} recorded
          </p>
        </div>
        {loading && (
          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            Refreshing…
          </span>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
              {["Date / Time", "Action Type", "Pieces", "Qty Impacted", "Reference Notes"].map(
                (col) => (
                  <th
                    key={col}
                    className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {col}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-12 text-center text-sm"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {loading ? "Loading transactions…" : "No transactions recorded yet."}
                </td>
              </tr>
            ) : (
              paged.map((tx, i) => {
                const { date, time } = formatDateTime(tx.timestamp);
                const isInflow = tx.type === "RESTOCK" || (tx.type === "CORRECTION" && tx.quantityChanged >= 0);
                const absQty = Math.abs(tx.quantityChanged);

                return (
                  <tr
                    key={tx.id}
                    style={{
                      borderBottom: i < paged.length - 1 ? "1px solid var(--color-border)" : undefined,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--color-surface-2)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    {/* Date / Time */}
                    <td className="px-5 py-3.5">
                      <span
                        className="text-sm font-medium block"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {date}
                      </span>
                      <span
                        className="text-xs font-mono"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {time}
                      </span>
                    </td>

                    {/* Action badge */}
                    <td className="px-5 py-3.5">
                      <TypeBadge type={tx.type} />
                    </td>

                    {/* Pieces */}
                    <td
                      className="px-5 py-3.5 font-mono text-sm"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {tx.pieces} pcs
                    </td>

                    {/* Qty impacted — coloured signed value */}
                    <td className="px-5 py-3.5">
                      <span
                        className="font-mono text-sm font-semibold"
                        style={{
                          color: isInflow
                            ? "var(--color-success)"
                            : tx.type === "SALE"
                            ? "var(--color-info)"
                            : tx.type === "WASTE_CUT"
                            ? "var(--color-danger)"
                            : "var(--color-warning)",
                        }}
                      >
                        {isInflow ? "+" : "−"}
                        {absQty.toLocaleString()}{" "}
                        <span
                          className="font-normal text-xs"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          {unitLabel(tx.unit)}
                        </span>
                      </span>
                    </td>

                    {/* Notes */}
                    <td
                      className="px-5 py-3.5 text-sm max-w-xs truncate"
                      style={{ color: "var(--color-text-secondary)" }}
                      title={tx.referenceNotes}
                    >
                      {tx.referenceNotes || (
                        <span style={{ color: "var(--color-text-muted)" }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderTop: "1px solid var(--color-border)" }}
        >
          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            Page {page} of {totalPages} · {rows.length} total
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors"
              style={{
                background: "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
                color: page === 1 ? "var(--color-border-2)" : "var(--color-text-secondary)",
                cursor: page === 1 ? "not-allowed" : "pointer",
              }}
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors"
              style={{
                background: "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
                color: page === totalPages ? "var(--color-border-2)" : "var(--color-text-secondary)",
                cursor: page === totalPages ? "not-allowed" : "pointer",
              }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
