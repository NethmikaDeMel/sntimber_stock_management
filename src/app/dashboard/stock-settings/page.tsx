import { Settings2, BookOpen, LayoutGrid } from "lucide-react";
import { getAllProducts, getAllInventoryItems } from "@/lib/queries";
import { StockSettingsClient } from "@/components/settings/StockSettingsClient";

export const dynamic = "force-dynamic";

export default async function StockSettingsPage() {
  const [products, inventoryItems] = await Promise.all([
    getAllProducts(),
    getAllInventoryItems(),
  ]);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <div
          className="flex items-center justify-center w-12 h-12 rounded-xl shrink-0"
          style={{
            background: "linear-gradient(135deg, var(--color-surface-3), var(--color-surface-2))",
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

      {/* Client shell handles tab switching + receives live DB data */}
      <StockSettingsClient
        initialProducts={products}
        initialInventoryItems={inventoryItems}
      />
    </div>
  );
}
