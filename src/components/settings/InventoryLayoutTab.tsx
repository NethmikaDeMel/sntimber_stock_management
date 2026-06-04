"use client";

import { useState, useMemo } from "react";
import { Save, X, Pencil, RotateCcw, AlertTriangle } from "lucide-react";
import type {
  InventoryVariation,
  VariationFormState,
  ProductProfile,
  TimberClass,
} from "@/types/timber";
import {
  SEED_VARIATIONS,
  SEED_PRODUCTS,
  buildDimensionSummary,
  genId,
} from "@/lib/settings-data";

// ─── Shared sub-components ────────────────────────────────────────────────────

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label
      className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider mb-1.5"
      style={{ color: "var(--color-text-muted)" }}
    >
      {children}
      {required && (
        <span style={{ color: "var(--color-danger)" }}>*</span>
      )}
    </label>
  );
}

function NumericInput({
  value,
  onChange,
  placeholder,
  error,
  step = "any",
  min = "0",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  step?: string;
  min?: string;
}) {
  return (
    <div>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        step={step}
        min={min}
        className="w-full px-3.5 py-2.5 rounded-xl text-sm font-mono outline-none transition-all"
        style={{
          background: "var(--color-surface-2)",
          border: `1px solid ${error ? "var(--color-danger)" : "var(--color-border-2)"}`,
          color: "var(--color-text-primary)",
        }}
        onFocus={(e) => {
          if (!error) e.currentTarget.style.borderColor = "var(--color-accent)";
        }}
        onBlur={(e) => {
          if (!error) e.currentTarget.style.borderColor = "var(--color-border-2)";
        }}
      />
      {error && (
        <p className="text-xs mt-1" style={{ color: "var(--color-danger)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

function InfoNote({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex items-start gap-2 px-3 py-2.5 rounded-lg text-xs"
      style={{
        background: "rgba(96,165,250,.08)",
        border: "1px solid rgba(96,165,250,.2)",
        color: "var(--color-info)",
      }}
    >
      <AlertTriangle size={12} className="mt-0.5 shrink-0" />
      {children}
    </div>
  );
}

function ClassBadge({ cls }: { cls: TimberClass }) {
  const isDim = cls === "dimensional";
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{
        background: isDim ? "rgba(212,134,42,.14)" : "rgba(96,165,250,.14)",
        color: isDim ? "var(--color-accent)" : "var(--color-info)",
        border: `1px solid ${isDim ? "rgba(212,134,42,.28)" : "rgba(96,165,250,.28)"}`,
      }}
    >
      {isDim ? "Dimensional" : "Plank"}
    </span>
  );
}

function StockBadge({
  current,
  threshold,
}: {
  current: number;
  threshold: number;
}) {
  const isLow = current <= threshold;
  return (
    <div className="flex flex-col">
      <span
        className="font-mono text-sm font-semibold"
        style={{
          color: isLow ? "var(--color-danger)" : "var(--color-success)",
        }}
      >
        {current.toLocaleString()}
      </span>
      {isLow && (
        <span className="text-xs" style={{ color: "var(--color-danger)" }}>
          ⚠ Low
        </span>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const EMPTY_FORM: VariationFormState = {
  id: null,
  productId: "",
  thickness: "",
  width: "",
  lengthFt: "",
  alertThreshold: "",
};

type FormErrors = Partial<Record<keyof VariationFormState, string>>;

export function InventoryLayoutTab() {
  const [products] = useState<ProductProfile[]>(SEED_PRODUCTS);
  const [variations, setVariations] = useState<InventoryVariation[]>(SEED_VARIATIONS);
  const [form, setForm] = useState<VariationFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // ── Derive selected product's metadata ──────────────────────────────────────
  const selectedProduct = useMemo(
    () => products.find((p) => p.id === form.productId) ?? null,
    [products, form.productId]
  );

  const isPlank = selectedProduct?.timberClass === "plank";
  const isJakDimensional =
    selectedProduct?.species.toLowerCase() === "jak" &&
    selectedProduct?.timberClass === "dimensional";

  // ── Helpers ─────────────────────────────────────────────────────────────────
  function setField<K extends keyof VariationFormState>(
    key: K,
    val: VariationFormState[K]
  ) {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function handleProductChange(productId: string) {
    // Reset conditional fields when product changes
    setForm((f) => ({
      ...f,
      productId,
      width: "",
      lengthFt: "",
    }));
    setErrors({});
  }

  // ── Validation ──────────────────────────────────────────────────────────────
  function validate(): boolean {
    const errs: FormErrors = {};
    if (!form.productId) errs.productId = "Select a product profile";
    if (!form.thickness || parseFloat(form.thickness) <= 0)
      errs.thickness = "Enter a valid thickness";
    if (!isPlank && (!form.width || parseFloat(form.width) <= 0))
      errs.width = "Enter a valid width";
    if (isJakDimensional && (!form.lengthFt || parseFloat(form.lengthFt) <= 0))
      errs.lengthFt = "Length is required for Jak Dimensional";
    if (!form.alertThreshold || parseFloat(form.alertThreshold) < 0)
      errs.alertThreshold = "Enter a valid threshold";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // ── Save ────────────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!validate() || !selectedProduct) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 650));

    const thickness = parseFloat(form.thickness);
    const width = !isPlank && form.width ? parseFloat(form.width) : undefined;
    const lengthFt =
      isJakDimensional && form.lengthFt ? parseFloat(form.lengthFt) : undefined;
    const alertThreshold = parseFloat(form.alertThreshold);

    const dimensionSummary = buildDimensionSummary({
      timberClass: selectedProduct.timberClass,
      thickness,
      width,
      lengthFt,
    });

    if (form.id) {
      // Update existing
      setVariations((vs) =>
        vs.map((v) =>
          v.id === form.id
            ? {
                ...v,
                productId: form.productId,
                productName: selectedProduct.name,
                species: selectedProduct.species,
                timberClass: selectedProduct.timberClass,
                thickness,
                width,
                lengthFt,
                alertThreshold,
                dimensionSummary,
              }
            : v
        )
      );
    } else {
      const newVar: InventoryVariation = {
        id: genId("iv"),
        productId: form.productId,
        productName: selectedProduct.name,
        species: selectedProduct.species,
        timberClass: selectedProduct.timberClass,
        thickness,
        width,
        lengthFt,
        currentStock: 0,
        alertThreshold,
        dimensionSummary,
      };
      setVariations((vs) => [newVar, ...vs]);
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setForm(EMPTY_FORM);
    }, 1000);
  }

  // ── Edit row → populate form ────────────────────────────────────────────────
  function handleEdit(v: InventoryVariation) {
    setForm({
      id: v.id,
      productId: v.productId,
      thickness: String(v.thickness),
      width: v.width !== undefined ? String(v.width) : "",
      lengthFt: v.lengthFt !== undefined ? String(v.lengthFt) : "",
      alertThreshold: String(v.alertThreshold),
    });
    setErrors({});
    setSaved(false);
  }

  function handleReset() {
    setForm(EMPTY_FORM);
    setErrors({});
    setSaved(false);
  }

  const isEditing = !!form.id;

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col lg:flex-row gap-5">
      {/* ══ LEFT: Dynamic Form ══ */}
      <div
        className="lg:w-1/3 card p-5 flex flex-col gap-4 self-start"
        style={{ borderColor: "var(--color-border)" }}
      >
        {/* Form header */}
        <div className="flex items-center justify-between">
          <div>
            <h3
              className="font-display text-sm font-semibold"
              style={{ color: "var(--color-text-primary)" }}
            >
              {isEditing ? "Edit Variation" : "Add New Variation"}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
              {isEditing
                ? `Editing ID: ${form.id}`
                : "Define a physical inventory row"}
            </p>
          </div>
          {isEditing && (
            <span
              className="text-xs px-2 py-1 rounded-full font-semibold"
              style={{
                background: "rgba(251,191,36,.12)",
                color: "var(--color-warning)",
                border: "1px solid rgba(251,191,36,.28)",
              }}
            >
              Editing
            </span>
          )}
        </div>

        <div className="h-px" style={{ background: "var(--color-border)" }} />

        {/* ── Product Profile selector ── */}
        <div>
          <FieldLabel required>Product Profile</FieldLabel>
          <select
            value={form.productId}
            onChange={(e) => handleProductChange(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all appearance-none cursor-pointer"
            style={{
              background: "var(--color-surface-2)",
              border: `1px solid ${errors.productId ? "var(--color-danger)" : "var(--color-border-2)"}`,
              color: form.productId
                ? "var(--color-text-primary)"
                : "var(--color-text-muted)",
            }}
          >
            <option value="" disabled>
              — Select a product profile —
            </option>
            {products.map((p) => (
              <option
                key={p.id}
                value={p.id}
                style={{ background: "var(--color-surface-2)" }}
              >
                {p.name} ({p.species} · {p.timberClass === "dimensional" ? "Dim" : "Plank"})
              </option>
            ))}
          </select>
          {errors.productId && (
            <p className="text-xs mt-1" style={{ color: "var(--color-danger)" }}>
              {errors.productId}
            </p>
          )}
        </div>

        {/* Selected product indicator */}
        {selectedProduct && (
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
            style={{
              background: "rgba(212,134,42,.07)",
              border: "1px solid rgba(212,134,42,.2)",
            }}
          >
            <div className="flex-1 min-w-0">
              <p
                className="text-xs font-semibold truncate"
                style={{ color: "var(--color-accent)" }}
              >
                {selectedProduct.name}
              </p>
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                {selectedProduct.species}
              </p>
            </div>
            <ClassBadge cls={selectedProduct.timberClass} />
          </div>
        )}

        {/* ── Thickness ── */}
        <div>
          <FieldLabel required>
            Thickness{" "}
            <span style={{ color: "var(--color-text-muted)", textTransform: "none", fontWeight: 400 }}>
              (inches)
            </span>
          </FieldLabel>
          <NumericInput
            value={form.thickness}
            onChange={(v) => setField("thickness", v)}
            placeholder='e.g. 3.00 or 0.75 for 3/4"'
            error={errors.thickness}
            step="0.001"
          />
        </div>

        {/* ── Width — HIDDEN when PLANK (Rule A) ── */}
        {!isPlank && (
          <div>
            <FieldLabel required>
              Width{" "}
              <span style={{ color: "var(--color-text-muted)", textTransform: "none", fontWeight: 400 }}>
                (inches)
              </span>
            </FieldLabel>
            <NumericInput
              value={form.width}
              onChange={(v) => setField("width", v)}
              placeholder="e.g. 4 or 6"
              error={errors.width}
              step="0.5"
            />
            {!selectedProduct && (
              <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                Select a product profile first
              </p>
            )}
          </div>
        )}

        {isPlank && (
          <InfoNote>
            Width field is hidden — Plank / Board profiles use Thickness only.
          </InfoNote>
        )}

        {/* ── Length — ONLY for Jak + Dimensional (Rule B) ── */}
        {isJakDimensional && (
          <div>
            <FieldLabel required>
              Length{" "}
              <span style={{ color: "var(--color-text-muted)", textTransform: "none", fontWeight: 400 }}>
                (feet)
              </span>
            </FieldLabel>
            <NumericInput
              value={form.lengthFt}
              onChange={(v) => setField("lengthFt", v)}
              placeholder="e.g. 2, 4, 6, 8"
              error={errors.lengthFt}
              step="1"
            />
            <div
              className="flex items-center gap-1.5 mt-1.5 text-xs"
              style={{ color: "var(--color-accent)" }}
            >
              <span>✦</span>
              <span>Jak Premium — length-per-piece tracking active</span>
            </div>
          </div>
        )}

        {/* ── Alert Threshold ── */}
        <div>
          <FieldLabel required>Safety / Low Stock Threshold</FieldLabel>
          <NumericInput
            value={form.alertThreshold}
            onChange={(v) => setField("alertThreshold", v)}
            placeholder="e.g. 20"
            error={errors.alertThreshold}
            step="1"
            min="0"
          />
          <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
            Alert fires when stock drops at or below this level
          </p>
        </div>

        {/* ── Live dimension preview ── */}
        {selectedProduct && form.thickness && (
          <div
            className="px-3 py-2.5 rounded-xl"
            style={{
              background: "var(--color-surface-3)",
              border: "1px solid var(--color-border)",
            }}
          >
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              Dimension preview
            </p>
            <p
              className="font-mono text-sm font-bold mt-0.5"
              style={{ color: "var(--color-text-primary)" }}
            >
              {buildDimensionSummary({
                timberClass: selectedProduct.timberClass,
                thickness: parseFloat(form.thickness) || 0,
                width:
                  !isPlank && form.width ? parseFloat(form.width) : undefined,
                lengthFt:
                  isJakDimensional && form.lengthFt
                    ? parseFloat(form.lengthFt)
                    : undefined,
              })}
            </p>
          </div>
        )}

        {/* ── Action buttons ── */}
        <div className="flex gap-2 mt-1">
          <button
            onClick={handleReset}
            className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5"
          >
            <RotateCcw size={13} />
            {isEditing ? "Cancel" : "Reset"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5"
            style={{
              background: saved ? "var(--color-success)" : undefined,
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saved ? (
              "✓ Saved"
            ) : saving ? (
              "Saving…"
            ) : (
              <>
                <Save size={14} />
                {isEditing ? "Update Variation" : "Create Variation"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* ══ RIGHT: Master Variations Matrix ══ */}
      <div
        className="lg:w-2/3 card overflow-hidden"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <div>
            <h3
              className="font-display text-sm font-semibold"
              style={{ color: "var(--color-text-primary)" }}
            >
              Master Variations Matrix
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
              {variations.length} variation{variations.length !== 1 ? "s" : ""} across all products
            </p>
          </div>
          <span
            className="text-xs font-mono px-2.5 py-1 rounded-full"
            style={{
              background: "var(--color-surface-3)",
              color: "var(--color-text-muted)",
              border: "1px solid var(--color-border)",
            }}
          >
            {variations.filter((v) => v.currentStock <= v.alertThreshold).length} low stock
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                {[
                  "Product",
                  "Type",
                  "Dimensions",
                  "Stock",
                  "Threshold",
                  "Action",
                ].map((col) => (
                  <th
                    key={col}
                    className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {variations.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-sm"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    No variations defined yet. Use the form to add one.
                  </td>
                </tr>
              ) : (
                variations.map((v, i) => (
                  <tr
                    key={v.id}
                    style={{
                      borderBottom:
                        i < variations.length - 1
                          ? "1px solid var(--color-border)"
                          : undefined,
                      background:
                        form.id === v.id
                          ? "rgba(212,134,42,.06)"
                          : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (form.id !== v.id)
                        e.currentTarget.style.background =
                          "var(--color-surface-2)";
                    }}
                    onMouseLeave={(e) => {
                      if (form.id !== v.id)
                        e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {/* Product name */}
                    <td className="px-4 py-3">
                      <span
                        className="text-sm font-semibold block"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {v.productName}
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {v.species}
                      </span>
                    </td>

                    {/* Class badge */}
                    <td className="px-4 py-3">
                      <ClassBadge cls={v.timberClass} />
                    </td>

                    {/* Dimension summary */}
                    <td className="px-4 py-3">
                      <span
                        className="font-mono text-sm font-medium px-2 py-1 rounded-lg"
                        style={{
                          background: "var(--color-surface-3)",
                          color: "var(--color-text-primary)",
                          border: "1px solid var(--color-border)",
                        }}
                      >
                        {v.dimensionSummary}
                      </span>
                    </td>

                    {/* Current stock */}
                    <td className="px-4 py-3">
                      <StockBadge
                        current={v.currentStock}
                        threshold={v.alertThreshold}
                      />
                    </td>

                    {/* Alert threshold */}
                    <td
                      className="px-4 py-3 font-mono text-sm"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {v.alertThreshold}
                    </td>

                    {/* Edit action */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleEdit(v)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap"
                        style={{
                          background:
                            form.id === v.id
                              ? "rgba(251,191,36,.14)"
                              : "var(--color-surface-3)",
                          border: `1px solid ${
                            form.id === v.id
                              ? "rgba(251,191,36,.3)"
                              : "var(--color-border)"
                          }`,
                          color:
                            form.id === v.id
                              ? "var(--color-warning)"
                              : "var(--color-text-secondary)",
                        }}
                      >
                        <Pencil size={11} />
                        {form.id === v.id ? "Editing…" : "Edit"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
