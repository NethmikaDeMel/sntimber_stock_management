"use client";

import { useState, useEffect } from "react";
import { X, Package, Tag, Ruler, Hash } from "lucide-react";
import type { ActionContext, TransactionType } from "@/types/timber";

interface ActionModalProps {
  open: boolean;
  onClose: () => void;
  context: ActionContext | null;
  onSubmit: (data: {
    quantity: number;
    type: TransactionType;
    notes: string;
  }) => void;
}

const TRANSACTION_OPTIONS: { value: TransactionType; label: string; color: string }[] = [
  { value: "RESTOCK",    label: "Restock",          color: "var(--color-success)" },
  { value: "SALE",       label: "Sale",             color: "var(--color-info)"    },
  { value: "WASTE_CUT",  label: "Waste / Cut Loss", color: "var(--color-danger)"  },
  { value: "CORRECTION", label: "Manual Correction",color: "var(--color-warning)" },
];

function unitDisplayLabel(unit: string) {
  switch (unit) {
    case "linear_ft": return "Linear Feet";
    case "sq_ft":     return "Square Feet";
    case "pieces":    return "Pieces";
    default:          return unit;
  }
}

export function ActionModal({ open, onClose, context, onSubmit }: ActionModalProps) {
  const [quantity, setQuantity] = useState<string>("");
  const [txType, setTxType] = useState<TransactionType>("RESTOCK");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Reset form when context changes
  useEffect(() => {
    if (context) {
      setTxType(context.defaultType);
      setQuantity("");
      setNotes("");
      setSubmitted(false);
    }
  }, [context]);

  if (!open || !context) return null;

  function handleSubmit() {
    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) return;
    setSubmitted(true);
    onSubmit({ quantity: qty, type: txType, notes });
    setTimeout(() => {
      onClose();
    }, 600);
  }

  const selectedOption = TRANSACTION_OPTIONS.find((o) => o.value === txType);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        style={{ background: "rgba(0,0,0,.65)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md"
        style={{ padding: "0 1rem" }}
      >
        <div
          className="rounded-2xl overflow-hidden shadow-2xl"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border-2)",
          }}
        >
          {/* Modal Header */}
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{
              borderBottom: "1px solid var(--color-border)",
              background: "var(--color-surface-2)",
            }}
          >
            <h2
              className="font-display text-lg font-semibold"
              style={{ color: "var(--color-text-primary)" }}
            >
              {context.defaultType === "RESTOCK" ? "Log Restock" : "Log Reduction / Sale"}
            </h2>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
              style={{
                background: "var(--color-surface-3)",
                color: "var(--color-text-muted)",
              }}
            >
              <X size={15} />
            </button>
          </div>

          {/* Context Info Band */}
          <div
            className="px-6 py-3 grid grid-cols-2 gap-3"
            style={{
              background: "rgba(212,134,42,.06)",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <ContextPill
              icon={<Package size={12} />}
              label="Species"
              value={context.species.label}
            />
            <ContextPill
              icon={<Tag size={12} />}
              label="Class"
              value={context.timberClass === "dimensional" ? "Dimensional" : "Plank / Board"}
            />
            <ContextPill
              icon={<Ruler size={12} />}
              label="Size"
              value={context.sizeLabel}
            />
            {context.lengthFt !== undefined && (
              <ContextPill
                icon={<Hash size={12} />}
                label="Length Profile"
                value={`${context.lengthFt} ft`}
              />
            )}
          </div>

          {/* Form Body */}
          <div className="px-6 py-5 flex flex-col gap-4">
            {/* Quantity */}
            <div>
              <label
                className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                style={{ color: "var(--color-text-muted)" }}
              >
                Quantity ({unitDisplayLabel(context.unit)})
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder={`Enter ${unitDisplayLabel(context.unit).toLowerCase()}…`}
                className="w-full px-4 py-3 rounded-xl font-mono text-base outline-none transition-all"
                style={{
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-border-2)",
                  color: "var(--color-text-primary)",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "var(--color-accent)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "var(--color-border-2)")
                }
              />
            </div>

            {/* Transaction Type */}
            <div>
              <label
                className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                style={{ color: "var(--color-text-muted)" }}
              >
                Transaction Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TRANSACTION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTxType(opt.value)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all"
                    style={{
                      background:
                        txType === opt.value
                          ? `${opt.color}18`
                          : "var(--color-surface-2)",
                      border: `1px solid ${txType === opt.value ? opt.color + "60" : "var(--color-border)"}`,
                      color:
                        txType === opt.value
                          ? opt.color
                          : "var(--color-text-secondary)",
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        background:
                          txType === opt.value ? opt.color : "var(--color-border-2)",
                      }}
                    />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reference Notes */}
            <div>
              <label
                className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                style={{ color: "var(--color-text-muted)" }}
              >
                Reference Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Bill ID, Invoice No., or reason…"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-border-2)",
                  color: "var(--color-text-primary)",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "var(--color-accent)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "var(--color-border-2)")
                }
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div
            className="flex gap-3 px-6 py-4"
            style={{ borderTop: "1px solid var(--color-border)" }}
          >
            <button
              onClick={onClose}
              className="btn-ghost flex-1 py-2.5 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!quantity || parseFloat(quantity) <= 0 || submitted}
              className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
              style={{
                opacity: !quantity || parseFloat(quantity) <= 0 ? 0.45 : 1,
                background: submitted
                  ? "var(--color-success)"
                  : selectedOption?.color === "var(--color-success)"
                  ? "var(--color-accent)"
                  : undefined,
              }}
            >
              {submitted ? "✓ Logged" : `Confirm ${selectedOption?.label ?? ""}`}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function ContextPill({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      className="flex items-start gap-2 px-3 py-2 rounded-lg"
      style={{
        background: "var(--color-surface-2)",
        border: "1px solid var(--color-border)",
      }}
    >
      <span className="mt-0.5" style={{ color: "var(--color-accent)" }}>
        {icon}
      </span>
      <div>
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          {label}
        </p>
        <p
          className="text-sm font-semibold leading-tight"
          style={{ color: "var(--color-text-primary)" }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
