"use client";

import { useState } from "react";
import { BookOpen, LayoutGrid } from "lucide-react";
import { ProductsDirectoryTab } from "./ProductsDirectoryTab";
import { InventoryLayoutTab } from "./InventoryLayoutTab";
import type { ProductRow, InventoryItemRow } from "@/types/supabase";

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

interface StockSettingsClientProps {
  initialProducts: ProductRow[];
  initialInventoryItems: InventoryItemRow[];
}

export function StockSettingsClient({
  initialProducts,
  initialInventoryItems,
}: StockSettingsClientProps) {
  const [activeTab, setActiveTab] = useState<TabId>("products");

  return (
    <>
      {/* Tab strip */}
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

      {/* Active tab description */}
      <p className="text-sm mb-5" style={{ color: "var(--color-text-muted)" }}>
        {TABS.find((t) => t.id === activeTab)?.description}
      </p>

      {/* Tab content */}
      {activeTab === "products" && (
        <ProductsDirectoryTab initialProducts={initialProducts} />
      )}
      {activeTab === "inventory" && (
        <InventoryLayoutTab
          initialProducts={initialProducts}
          initialInventoryItems={initialInventoryItems}
        />
      )}
    </>
  );
}
