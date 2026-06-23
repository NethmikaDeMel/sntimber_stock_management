"use client";

import { useState, useMemo, useTransition } from "react";
import { Save, RotateCcw, Pencil, AlertTriangle, Loader2 } from "lucide-react";
import type { ProductRow, InventoryItemRow, TimberClass } from "@/types/supabase";
import { createInventoryItem, updateInventoryItem } from "@/actions/stock";


// ─── Utility: build human-readable dimension summary ─────────────────────────

function inchLabel(n: number): string {
  if (n === 0.75)  return '3/4"';
  if (n === 0.875) return '7/8"';
  if (n === 1.25)  return '1-1/4"';
  if (n === 1.5)   return '1-1/2"';
  return `${n}"`;
}

function buildDimensionSummary(params: {
  timberClass: TimberClass;
  thickness: number;
  width?: number;
  lengthFt?: number;
}): string {
  const { timberClass, thickness, width, lengthFt } = params;
  if (timberClass === "plank") return `${inchLabel(thickness)} Plank`;
  const base = `${inchLabel(thickness)} × ${inchLabel(width ?? 0)}`;
  return lengthFt ? `${base} × ${lengthFt}'` : base;
}

// ─── Local form state ─────────────────────────────────────────────────────────

interface VariationFormState {
  id: string | null;
  productId: string;
  thickness: string;
  width: string;
  lengthFt: string;
  alertThreshold: string;
}

type FormErrors = Partial<Record<keyof VariationFormState, string>>;

const EMPTY_FORM: VariationFormState = {
  id: null, productId: "", thickness: "", width: "", lengthFt: "", alertThreshold: "",
};

// ─── A flat display row combining inventory_items + joined product fields ─────
// (mirrors what getAllInventoryItems returns)
interface DisplayVariation {
  id: string;
  productId: string;
  productName: string;
  species: string;
  timberClass: TimberClass;
  thickness: number;
  width: number | null;
  lengthFt: number | null;
  currentStock: number;
  alertThreshold: number;
  dimensionSummary: string;
}

function toDisplayVariation(row: InventoryItemRow): DisplayVariation {
  const product = row.products as { name: string; species: string; timber_class: TimberClass } | undefined;
  return {
    id: row.id,
    productId: row.product_id,
    productName: product?.name ?? "—",
    species: product?.species ?? "—",
    timberClass: product?.timber_class ?? "dimensional",
    thickness: row.thickness,
    width: row.width ?? null,
    lengthFt: row.length_ft ?? null,
    currentStock: row.current_stock,
    alertThreshold: row.low_stock_threshold,
    dimensionSummary: row.dimension_summary,
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider mb-1.5"
      style={{ color: "var(--color-text-muted)" }}>
      {children}
      {required && <span style={{ color: "var(--color-danger)" }}>*</span>}
    </label>
  );
}

function NumericInput({ value, onChange, placeholder, error, step = "any", min = "0" }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  error?: string; step?: string; min?: string;
}) {
  return (
    <div>
      <input type="number" value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} step={step} min={min}
        className="w-full px-3.5 py-2.5 rounded-xl text-sm font-mono outline-none transition-all"
        style={{ background: "var(--color-surface-2)", border: `1px solid ${error ? "var(--color-danger)" : "var(--color-border-2)"}`, color: "var(--color-text-primary)" }}
        onFocus={(e) => { if (!error) e.currentTarget.style.borderColor = "var(--color-accent)"; }}
        onBlur={(e) => { if (!error) e.currentTarget.style.borderColor = "var(--color-border-2)"; }}
      />
      {error && <p className="text-xs mt-1" style={{ color: "var(--color-danger)" }}>{error}</p>}
    </div>
  );
}

function ClassBadge({ cls }: { cls: TimberClass }) {
  const isDim = cls === "dimensional";
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: isDim ? "rgba(212,134,42,.14)" : "rgba(96,165,250,.14)", color: isDim ? "var(--color-accent)" : "var(--color-info)", border: `1px solid ${isDim ? "rgba(212,134,42,.28)" : "rgba(96,165,250,.28)"}` }}>
      {isDim ? "Dimensional" : "Plank"}
    </span>
  );
}

function StockBadge({ current, threshold }: { current: number; threshold: number }) {
  const isLow = current <= threshold;
  return (
    <div className="flex flex-col">
      <span className="font-mono text-sm font-semibold" style={{ color: isLow ? "var(--color-danger)" : "var(--color-success)" }}>
        {current.toLocaleString()}
      </span>
      {isLow && <span className="text-xs" style={{ color: "var(--color-danger)" }}>⚠ Low</span>}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface InventoryLayoutTabProps {
  initialProducts: ProductRow[];
  initialInventoryItems: InventoryItemRow[];
}

export function InventoryLayoutTab({ initialProducts, initialInventoryItems }: InventoryLayoutTabProps) {
  const [variations, setVariations] = useState<DisplayVariation[]>(
    initialInventoryItems.map(toDisplayVariation)
  );
  const [form, setForm] = useState<VariationFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [, startTransition] = useTransition();

  // Derive selected product details from the live products list
  const selectedProduct = useMemo(
    () => initialProducts.find((p) => p.id === form.productId) ?? null,
    [initialProducts, form.productId]
  );
  const isPlank = selectedProduct?.timber_class === "plank";
  const isJakDimensional =
    selectedProduct?.species.toLowerCase() === "jak" &&
    selectedProduct?.timber_class === "dimensional";

  function setField<K extends keyof VariationFormState>(key: K, val: VariationFormState[K]) {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: undefined }));
    setServerError(null);
  }

  function handleProductChange(productId: string) {
    setForm((f) => ({ ...f, productId, width: "", lengthFt: "" }));
    setErrors({});
    setServerError(null);
  }

  function validate(): boolean {
    const errs: FormErrors = {};
    if (!form.productId)                                         errs.productId      = "Select a product profile";
    if (!form.thickness || parseFloat(form.thickness) <= 0)      errs.thickness      = "Enter a valid thickness";
    if (!isPlank && (!form.width || parseFloat(form.width) <= 0)) errs.width         = "Enter a valid width";
    if (isJakDimensional && (!form.lengthFt || parseFloat(form.lengthFt) <= 0))
                                                                  errs.lengthFt      = "Length required for Jak Dimensional";
    if (!form.alertThreshold || parseFloat(form.alertThreshold) < 0)
                                                                  errs.alertThreshold = "Enter a valid threshold";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave() {
    if (!validate() || !selectedProduct) return;
    setSaveState("saving");
    setServerError(null);

    const thickness        = parseFloat(form.thickness);
    const width            = !isPlank && form.width ? parseFloat(form.width) : undefined;
    const lengthFt         = isJakDimensional && form.lengthFt ? parseFloat(form.lengthFt) : undefined;
    const alertThreshold   = parseFloat(form.alertThreshold);
    const dimensionSummary = buildDimensionSummary({
      timberClass: selectedProduct.timber_class,
      thickness, width, lengthFt,
    });

    const stockUnit: "linear_ft" | "sq_ft" | "pieces" =
      selectedProduct.species.toLowerCase() === "jak" ? "pieces"
      : selectedProduct.timber_class === "plank"       ? "sq_ft"
      : "linear_ft";

    // ─── DUP CHECK: Verify if this variation already exists ───
    try {
      // Build the query base matching the profile and thickness
      let query = supabase
        .from("inventory_items") // <-- Replace with your actual table name if different
        .select("id")
        .eq("product_id", form.productId)
        .eq("thickness", thickness);

      // Width handling: match value if it exists, otherwise check for null/is_null depending on your client setup
      if (width !== undefined) {
        query = query.eq("width", width);
      } else {
        query = query.is("width", null);
      }

      // Length handling: only check for Jak Dimensional
      if (isJakDimensional && lengthFt !== undefined) {
        query = query.eq("length_ft", lengthFt);
      } else {
        query = query.is("length_ft", null);
      }

      const { data: duplicate, error: checkError } = await query.maybeSingle();

      if (checkError) throw checkError;

      // If a duplicate exists, make sure it's not the one we are currently editing
      const isEditing = !!form.id;
      if (duplicate && (!isEditing || duplicate.id !== form.id)) {
        setSaveState("idle");
        setServerError("A variation with these exact dimensions already exists for this product.");
        return;
      }
    } catch (err: any) {
      setSaveState("idle");
      setServerError(err?.message ?? "Error checking for duplicates.");
      return;
    }

    // ─── INSERT / UPDATE PROCEED ───
    startTransition(async () => {
      const isEditing = !!form.id;
      const result = isEditing
        ? await updateInventoryItem({ id: form.id!, thickness, width, lengthFt, alertThreshold, dimensionSummary })
        : await createInventoryItem({ productId: form.productId, thickness, width, lengthFt, alertThreshold, stockUnit, dimensionSummary });

      if (!result.ok) {
        setSaveState("idle");
        setServerError(result.error ?? "Save failed.");
        return;
      }

      // Optimistic update
      if (isEditing) {
        setVariations((vs) =>
          vs.map((v) =>
            v.id === form.id
              ? { ...v, thickness, width: width ?? null, lengthFt: lengthFt ?? null, alertThreshold, dimensionSummary }
              : v
          )
        );
      } else if ("id" in result && typeof result.id === "string") {
        const newRow: DisplayVariation = {
          id: result.id,
          productId: form.productId,
          productName: selectedProduct.name,
          species: selectedProduct.species,
          timberClass: selectedProduct.timber_class,
          thickness,
          width: width ?? null,
          lengthFt: lengthFt ?? null,
          currentStock: 0,
          alertThreshold,
          dimensionSummary,
        };
        setVariations((vs) => [newRow, ...vs]);
      }

      setSaveState("saved");
      setTimeout(() => { setSaveState("idle"); setForm(EMPTY_FORM); }, 1000);
    });
  }

  function handleEdit(v: DisplayVariation) {
    setForm({
      id: v.id,
      productId: v.productId,
      thickness: String(v.thickness),
      width: v.width !== null ? String(v.width) : "",
      lengthFt: v.lengthFt !== null ? String(v.lengthFt) : "",
      alertThreshold: String(v.alertThreshold),
    });
    setErrors({});
    setServerError(null);
    setSaveState("idle");
  }

  function handleReset() {
    setForm(EMPTY_FORM);
    setErrors({});
    setServerError(null);
    setSaveState("idle");
  }

  const isSaving = saveState === "saving";
  const isSaved  = saveState === "saved";
  const isEditing = !!form.id;

  const previewSummary = selectedProduct && form.thickness
    ? buildDimensionSummary({
        timberClass: selectedProduct.timber_class,
        thickness: parseFloat(form.thickness) || 0,
        width: !isPlank && form.width ? parseFloat(form.width) : undefined,
        lengthFt: isJakDimensional && form.lengthFt ? parseFloat(form.lengthFt) : undefined,
      })
    : null;

  return (
    <div className="flex flex-col lg:flex-row gap-5">

      {/* ── Left: Form ── */}
      <div className="lg:w-1/3 card p-5 flex flex-col gap-4 self-start" style={{ borderColor: "var(--color-border)" }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
              {isEditing ? "Edit Variation" : "Add New Variation"}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
              {isEditing ? `Editing: ${form.id!.slice(0, 8)}…` : "Define a physical inventory row"}
            </p>
          </div>
          {isEditing && (
            <span className="text-xs px-2 py-1 rounded-full font-semibold"
              style={{ background: "rgba(251,191,36,.12)", color: "var(--color-warning)", border: "1px solid rgba(251,191,36,.28)" }}>
              Editing
            </span>
          )}
        </div>

        <div className="h-px" style={{ background: "var(--color-border)" }} />

        {serverError && (
          <div className="px-3 py-2.5 rounded-xl text-xs"
            style={{ background: "rgba(248,113,113,.1)", border: "1px solid rgba(248,113,113,.3)", color: "var(--color-danger)" }}>
            {serverError}
          </div>
        )}

        {/* Product selector */}
        <div>
          <FieldLabel required>Product Profile</FieldLabel>
          <select value={form.productId} onChange={(e) => handleProductChange(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all appearance-none cursor-pointer"
            style={{ background: "var(--color-surface-2)", border: `1px solid ${errors.productId ? "var(--color-danger)" : "var(--color-border-2)"}`, color: form.productId ? "var(--color-text-primary)" : "var(--color-text-muted)" }}>
            <option value="" disabled>— Select a product profile —</option>
            {initialProducts.map((p) => (
              <option key={p.id} value={p.id} style={{ background: "var(--color-surface-2)" }}>
                {p.name} ({p.species} · {p.timber_class === "dimensional" ? "Dim" : "Plank"})
              </option>
            ))}
          </select>
          {errors.productId && <p className="text-xs mt-1" style={{ color: "var(--color-danger)" }}>{errors.productId}</p>}
        </div>

        {/* Selected product pill */}
        {selectedProduct && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
            style={{ background: "rgba(212,134,42,.07)", border: "1px solid rgba(212,134,42,.2)" }}>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: "var(--color-accent)" }}>{selectedProduct.name}</p>
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{selectedProduct.species}</p>
            </div>
            <ClassBadge cls={selectedProduct.timber_class} />
          </div>
        )}

        {/* Thickness */}
        <div>
          <FieldLabel required>
            Thickness{" "}
            <span style={{ color: "var(--color-text-muted)", textTransform: "none", fontWeight: 400 }}>(inches)</span>
          </FieldLabel>
          <NumericInput value={form.thickness} onChange={(v) => setField("thickness", v)}
            placeholder='e.g. 3.00 or 0.75 for 3/4"' error={errors.thickness} step="0.001" />
        </div>

        {/* Width — hidden for PLANK (Rule A) */}
        {!isPlank && selectedProduct && (
          <div>
            <FieldLabel required>
              Width{" "}
              <span style={{ color: "var(--color-text-muted)", textTransform: "none", fontWeight: 400 }}>(inches)</span>
            </FieldLabel>
            <NumericInput value={form.width} onChange={(v) => setField("width", v)}
              placeholder="e.g. 4 or 6" error={errors.width} step="0.5" />
          </div>
        )}

        {isPlank && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg text-xs"
            style={{ background: "rgba(96,165,250,.08)", border: "1px solid rgba(96,165,250,.2)", color: "var(--color-info)" }}>
            <AlertTriangle size={12} className="mt-0.5 shrink-0" />
            Width hidden — Plank profiles use Thickness only.
          </div>
        )}

        {/* Length — only for Jak Dimensional (Rule B) */}
        {isJakDimensional && (
          <div>
            <FieldLabel required>
              Length{" "}
              <span style={{ color: "var(--color-text-muted)", textTransform: "none", fontWeight: 400 }}>(feet)</span>
            </FieldLabel>
            <NumericInput value={form.lengthFt} onChange={(v) => setField("lengthFt", v)}
              placeholder="e.g. 2, 4, 6, 8" error={errors.lengthFt} step="1" />
            <p className="text-xs mt-1" style={{ color: "var(--color-accent)" }}>
              ✦ Jak Premium — length-per-piece tracking active
            </p>
          </div>
        )}

        {/* Threshold */}
        <div>
          <FieldLabel required>Safety / Low Stock Threshold</FieldLabel>
          <NumericInput value={form.alertThreshold} onChange={(v) => setField("alertThreshold", v)}
            placeholder="e.g. 20" error={errors.alertThreshold} step="1" min="0" />
          <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
            Alert fires when stock drops at or below this level
          </p>
        </div>

        {/* Live dimension preview */}
        {previewSummary && (
          <div className="px-3 py-2.5 rounded-xl" style={{ background: "var(--color-surface-3)", border: "1px solid var(--color-border)" }}>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Dimension preview</p>
            <p className="font-mono text-sm font-bold mt-0.5" style={{ color: "var(--color-text-primary)" }}>
              {previewSummary}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-1">
          <button onClick={handleReset} className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5">
            <RotateCcw size={13} />{isEditing ? "Cancel" : "Reset"}
          </button>
          <button onClick={handleSave} disabled={isSaving || isSaved}
            className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5"
            style={{ background: isSaved ? "var(--color-success)" : undefined, opacity: isSaving ? 0.7 : 1 }}>
            {isSaved
              ? "✓ Saved"
              : isSaving
              ? <><Loader2 size={13} className="animate-spin" /> Saving…</>
              : <><Save size={14} />{isEditing ? "Update Variation" : "Create Variation"}</>}
          </button>
        </div>
      </div>

      {/* ── Right: Master Variations Matrix ── */}
      <div className="lg:w-2/3 card overflow-hidden" style={{ borderColor: "var(--color-border)" }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
          <div>
            <h3 className="font-display text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
              Master Variations Matrix
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
              {variations.length} variation{variations.length !== 1 ? "s" : ""} across all products
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-full"
            style={{ background: "var(--color-surface-3)", color: "var(--color-text-muted)", border: "1px solid var(--color-border)" }}>
            {variations.filter((v) => v.currentStock <= v.alertThreshold).length} low stock
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                {["Product", "Type", "Dimensions", "Stock", "Threshold", "Action"].map((col) => (
                  <th key={col} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                    style={{ color: "var(--color-text-muted)" }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {variations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
                    No variations defined yet. Use the form to add one.
                  </td>
                </tr>
              ) : (
                variations.map((v, i) => (
                  <tr key={v.id}
                    style={{
                      borderBottom: i < variations.length - 1 ? "1px solid var(--color-border)" : undefined,
                      background: form.id === v.id ? "rgba(212,134,42,.06)" : "transparent",
                    }}
                    onMouseEnter={(e) => { if (form.id !== v.id) e.currentTarget.style.background = "var(--color-surface-2)"; }}
                    onMouseLeave={(e) => { if (form.id !== v.id) e.currentTarget.style.background = "transparent"; }}
                  >
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold block" style={{ color: "var(--color-text-primary)" }}>{v.productName}</span>
                      <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>{v.species}</span>
                    </td>
                    <td className="px-4 py-3"><ClassBadge cls={v.timberClass} /></td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm font-medium px-2 py-1 rounded-lg"
                        style={{ background: "var(--color-surface-3)", color: "var(--color-text-primary)", border: "1px solid var(--color-border)" }}>
                        {v.dimensionSummary}
                      </span>
                    </td>
                    <td className="px-4 py-3"><StockBadge current={v.currentStock} threshold={v.alertThreshold} /></td>
                    <td className="px-4 py-3 font-mono text-sm" style={{ color: "var(--color-text-secondary)" }}>
                      {v.alertThreshold}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleEdit(v)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap"
                        style={{
                          background: form.id === v.id ? "rgba(251,191,36,.14)" : "var(--color-surface-3)",
                          border: `1px solid ${form.id === v.id ? "rgba(251,191,36,.3)" : "var(--color-border)"}`,
                          color: form.id === v.id ? "var(--color-warning)" : "var(--color-text-secondary)",
                        }}>
                        <Pencil size={11} />{form.id === v.id ? "Editing…" : "Edit"}
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
