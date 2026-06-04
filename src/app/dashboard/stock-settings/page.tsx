"use client";

import { useState } from "react";
import { Settings2, BookOpen, LayoutGrid } from "lucide-react";
import { ProductsDirectoryTab } from "@/components/settings/ProductsDirectoryTab";
import { InventoryLayoutTab } from "@/components/settings/InventoryLayoutTab";

type TabId = "products" | "inventory";

const TABS: { id: TabId; label: string; icon: React.ReactNode; description: string }[] = [
  {
    id: "products",
    label: "Products Directory",
    icon: <BookOpen size={15} />,
    description: "Base catalog profiles — define timber product types",
  },
  {
    id: "inventory",
    label: "Inventory Layout",
    icon: <LayoutGrid size={15} />,
    description: "Physical dimensional variations — specific stock rows",
  },
];

export default function StockSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("products");

  return (
    <div className="p-8">
      {/* ── Page Header ── */}
      <div className="flex items-start gap-4 mb-8">
        <div
          className="flex items-center justify-center w-12 h-12 rounded-xl shrink-0"
          style={{
            background:
              "linear-gradient(135deg, var(--color-surface-3), var(--color-surface-2))",
            border: "1px solid var(--color-border-2)",
          }}
        >
          <Settings2 size={22} style={{ color: "var(--color-accent)" }} />
        </div>
        <div>
          <h1
            className="font-display text-3xl font-bold"
            style={{ color: "var(--color-text-primary)" }}
          >
            Stock Settings
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
            Configure and manage available timber profiles and physical stock definitions.
          </p>
        </div>
      </div>

      {/* ── Primary Tabs ── */}
      <div
        className="flex gap-1 p-1 rounded-xl mb-7 w-fit"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
              style={{
                background: isActive
                  ? "linear-gradient(135deg, var(--color-timber-600), var(--color-timber-800))"
                  : "transparent",
                color: isActive ? "#fff" : "var(--color-text-secondary)",
                boxShadow: isActive ? "0 2px 8px rgba(212,134,42,.25)" : "none",
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Active tab description ── */}
      <div className="mb-5">
        {TABS.map(
          (tab) =>
            tab.id === activeTab && (
              <p
                key={tab.id}
                className="text-sm"
                style={{ color: "var(--color-text-muted)" }}
              >
                {tab.description}
              </p>
            )
        )}
      </div>

      {/* ── Tab Content ── */}
      {activeTab === "products" && <ProductsDirectoryTab />}
      {activeTab === "inventory" && <InventoryLayoutTab />}
    </div>
  );
}
