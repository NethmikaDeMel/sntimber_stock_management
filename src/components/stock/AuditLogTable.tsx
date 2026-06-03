"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Transaction, TransactionType } from "@/types/timber";

interface AuditLogTableProps {
  transactions: Transaction[];
}

const PAGE_SIZE = 5;

function TypeBadge({ type }: { type: TransactionType }) {
  const styles: Record<TransactionType, { bg: string; color: string; label: string }> = {
    RESTOCK:    { bg: "rgba(74,222,128,.15)", color: "var(--color-success)", label: "Restock"    },
    SALE:       { bg: "rgba(96,165,250,.15)", color: "var(--color-info)",    label: "Sale"       },
    WASTE_CUT:  { bg: "rgba(248,113,113,.15)",color: "var(--color-danger)",  label: "Waste / Cut"},
    CORRECTION: { bg: "rgba(251,191,36,.15)", color: "var(--color-warning)", label: "Correction" },
  };
  const s = styles[type];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: s.bg, color: s.color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: s.color }}
      />
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

export function AuditLogTable({ transactions }: AuditLogTableProps) {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(transactions.length / PAGE_SIZE);
  const paged = transactions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div
      className="card overflow-hidden"
      style={{ borderColor: "var(--color-border)" }}
    >
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
            {transactions.length} transaction{transactions.length !== 1 ? "s" : ""} recorded
          </p>
        </div>
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
                    className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider"
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
                  className="px-5 py-10 text-center text-sm"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  No transactions recorded yet.
                </td>
              </tr>
            ) : (
              paged.map((tx, i) => {
                const { date, time } = formatDateTime(tx.timestamp);
                return (
                  <tr
                    key={tx.id}
                    className="transition-colors"
                    style={{
                      borderBottom:
                        i < paged.length - 1
                          ? "1px solid var(--color-border)"
                          : undefined,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--color-surface-2)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    {/* Date/Time */}
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

                    {/* Action Type */}
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

                    {/* Qty Impacted */}
                    <td
                      className="px-5 py-3.5 font-mono text-sm font-semibold"
                      style={{
                        color:
                          tx.type === "RESTOCK"
                            ? "var(--color-success)"
                            : tx.type === "SALE"
                            ? "var(--color-info)"
                            : tx.type === "WASTE_CUT"
                            ? "var(--color-danger)"
                            : "var(--color-warning)",
                      }}
                    >
                      {tx.type === "RESTOCK" ? "+" : "-"}
                      {tx.quantityImpacted} {tx.unit}
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
          <span
            className="text-xs"
            style={{ color: "var(--color-text-muted)" }}
          >
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors"
              style={{
                background: "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
                color:
                  page === 1 ? "var(--color-border-2)" : "var(--color-text-secondary)",
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
                color:
                  page === totalPages
                    ? "var(--color-border-2)"
                    : "var(--color-text-secondary)",
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
