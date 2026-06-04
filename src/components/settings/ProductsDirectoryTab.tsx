"use client";

import { useState } from "react";
import { Save, X, Pencil, Plus } from "lucide-react";
import type {
  ProductProfile,
  ProductFormState,
  TimberClass,
} from "@/types/timber";
import {
  SEED_PRODUCTS,
  genId,
} from "@/lib/settings-data";

const EMPTY_FORM: ProductFormState = {
  id: null,
  name: "",
  species: "",
  timberClass: "",
};

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
      {isDim ? "Dimensional" : "Plank / Board"}
    </span>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
      style={{ color: "var(--color-text-muted)" }}
    >
      {children}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
}) {
  return (
    <div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all"
        style={{
          background: "var(--color-surface-2)",
          border: `1px solid ${error ? "var(--color-danger)" : "var(--color-border-2)"}`,
          color: "var(--color-text-primary)",
        }}
        onFocus={(e) =>
          !error && (e.currentTarget.style.borderColor = "var(--color-accent)")
        }
        onBlur={(e) =>
          !error &&
          (e.currentTarget.style.borderColor = "var(--color-border-2)")
        }
      />
      {error && (
        <p className="text-xs mt-1" style={{ color: "var(--color-danger)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

export function ProductsDirectoryTab() {
  const [products, setProducts] = useState<ProductProfile[]>(SEED_PRODUCTS);
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ProductFormState, string>>
  >({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function setField<K extends keyof ProductFormState>(
    key: K,
    val: ProductFormState[K],
  ) {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate(): boolean {
    const errs: typeof errors = {};
    if (!form.name.trim()) errs.name = "Product name is required";
    if (!form.species.trim()) errs.species = "Species is required";
    if (!form.timberClass) errs.timberClass = "Please select a class";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    // Simulate async save (replace with Supabase call)
    await new Promise((r) => setTimeout(r, 600));

    const now = new Date().toISOString();
    if (form.id) {
      setProducts((ps) =>
        ps.map((p) =>
          p.id === form.id
            ? {
                ...p,
                name: form.name,
                species: form.species,
                timberClass: form.timberClass as TimberClass,
              }
            : p,
        ),
      );
    } else {
      const newProduct: ProductProfile = {
        id: genId("pp"),
        name: form.name,
        species: form.species,
        timberClass: form.timberClass as TimberClass,
        createdAt: now,
      };
      setProducts((ps) => [newProduct, ...ps]);
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setForm(EMPTY_FORM);
    }, 1000);
  }

  function handleEdit(p: ProductProfile) {
    setForm({
      id: p.id,
      name: p.name,
      species: p.species,
      timberClass: p.timberClass,
    });
    setErrors({});
    setSaved(false);
  }

  function handleClear() {
    setForm(EMPTY_FORM);
    setErrors({});
    setSaved(false);
  }

  const isEditing = !!form.id;

  return (
    <div className="flex flex-col lg:flex-row gap-5">
      {/* ── LEFT: Form Panel ── */}
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
              {isEditing ? "Edit Product" : "Add New Product"}
            </h3>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--color-text-muted)" }}
            >
              {isEditing
                ? `Editing ID: ${form.id}`
                : "Define a new base catalog profile"}
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

        {/* Product Name */}
        <div>
          <FieldLabel>Product Name</FieldLabel>
          <TextInput
            value={form.name}
            onChange={(v) => setField("name", v)}
            placeholder='e.g. "Jak Premium", "Mahogany Standard"'
            error={errors.name}
          />
        </div>

        {/* Species */}
        <div>
          <FieldLabel>Species</FieldLabel>
          <TextInput
            value={form.species}
            onChange={(v) => setField("species", v)}
            placeholder='e.g. "Jak", "Mahogany", "Teak"'
            error={errors.species}
          />
        </div>

        {/* Timber Class */}
        <div>
          <FieldLabel>Timber Class</FieldLabel>
          <div className="flex gap-2">
            {(["dimensional", "plank"] as TimberClass[]).map((cls) => {
              const isActive = form.timberClass === cls;
              return (
                <button
                  key={cls}
                  onClick={() => setField("timberClass", cls)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: isActive
                      ? cls === "dimensional"
                        ? "rgba(212,134,42,.16)"
                        : "rgba(96,165,250,.16)"
                      : "var(--color-surface-2)",
                    border: `1px solid ${
                      isActive
                        ? cls === "dimensional"
                          ? "rgba(212,134,42,.4)"
                          : "rgba(96,165,250,.4)"
                        : errors.timberClass
                          ? "var(--color-danger)"
                          : "var(--color-border)"
                    }`,
                    color: isActive
                      ? cls === "dimensional"
                        ? "var(--color-accent)"
                        : "var(--color-info)"
                      : "var(--color-text-secondary)",
                  }}
                >
                  {cls === "dimensional" ? "Dimensional" : "Plank / Board"}
                </button>
              );
            })}
          </div>
          {errors.timberClass && (
            <p
              className="text-xs mt-1"
              style={{ color: "var(--color-danger)" }}
            >
              {errors.timberClass}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-1">
          <button
            onClick={handleClear}
            className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5"
          >
            <X size={14} />
            {isEditing ? "Cancel" : "Clear"}
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
                {isEditing ? "Update Product" : "Save Product"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── RIGHT: Registry Table ── */}
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
              Existing Products Registry
            </h3>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--color-text-muted)" }}
            >
              {products.length} product profile
              {products.length !== 1 ? "s" : ""} defined
            </p>
          </div>
          <div
            className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
            style={{
              background: "rgba(74,222,128,.1)",
              color: "var(--color-success)",
              border: "1px solid rgba(74,222,128,.22)",
            }}
          >
            <Plus size={11} />
            Click form to add
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                {["ID", "Product Name", "Species", "Class", "Action"].map(
                  (col) => (
                    <th
                      key={col}
                      className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {col}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr
                  key={p.id}
                  style={{
                    borderBottom:
                      i < products.length - 1
                        ? "1px solid var(--color-border)"
                        : undefined,
                    background:
                      form.id === p.id ? "rgba(212,134,42,.06)" : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (form.id !== p.id)
                      e.currentTarget.style.background =
                        "var(--color-surface-2)";
                  }}
                  onMouseLeave={(e) => {
                    if (form.id !== p.id)
                      e.currentTarget.style.background = "transparent";
                  }}
                >
                  <td
                    className="px-5 py-3 font-mono text-xs"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {p.id}
                  </td>
                  <td
                    className="px-5 py-3 text-sm font-semibold"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {p.name}
                  </td>
                  <td
                    className="px-5 py-3 text-sm"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {p.species}
                  </td>
                  <td className="px-5 py-3">
                    <ClassBadge cls={p.timberClass} />
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleEdit(p)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        background:
                          form.id === p.id
                            ? "rgba(251,191,36,.14)"
                            : "var(--color-surface-3)",
                        border: `1px solid ${
                          form.id === p.id
                            ? "rgba(251,191,36,.3)"
                            : "var(--color-border)"
                        }`,
                        color:
                          form.id === p.id
                            ? "var(--color-warning)"
                            : "var(--color-text-secondary)",
                      }}
                    >
                      <Pencil size={11} />
                      {form.id === p.id ? "Editing…" : "Edit"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
