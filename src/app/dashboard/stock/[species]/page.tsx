import { notFound } from "next/navigation";
import { ChevronRight, TreePine } from "lucide-react";
import Link from "next/link";
import { getSpecies } from "@/lib/data";
import { getInventoryBySpecies } from "@/lib/queries";
import { StockPageClient } from "@/components/stock/StockPageClient";

export const dynamic = "force-dynamic";

export default async function SpeciesStockPage({
  params,
}: {
  params: Promise<{ species: string }>;
}) {
  const { species: speciesId } = await params;
  const species = getSpecies(speciesId);
  if (!species) notFound();

  // Fetch all inventory rows for this species server-side
  const inventoryItems = await getInventoryBySpecies(species.label);

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <div
        className="flex items-center gap-2 text-xs mb-6"
        style={{ color: "var(--color-text-muted)" }}
      >
        <Link
          href="/dashboard"
          className="hover:text-[var(--color-accent)] transition-colors"
          style={{ color: "var(--color-text-muted)" }}
        >
          Dashboard
        </Link>
        <ChevronRight size={12} />
        <span style={{ color: "var(--color-text-secondary)" }}>Stock Management</span>
        <ChevronRight size={12} />
        <span style={{ color: "var(--color-accent)" }}>{species.label}</span>
      </div>

      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <div
          className="flex items-center justify-center w-12 h-12 rounded-xl shrink-0"
          style={{
            background: "linear-gradient(135deg, var(--color-timber-600), var(--color-timber-900))",
            boxShadow: "var(--shadow-glow)",
          }}
        >
          <TreePine size={22} className="text-white" />
        </div>
        <div>
          <h1
            className="font-display text-3xl font-bold"
            style={{ color: "var(--color-text-primary)" }}
          >
            {species.label} Timber
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
            Stock levels, transactions &amp; audit log
            {species.tracksLengths && (
              <span
                className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(212,134,42,.15)", color: "var(--color-accent)" }}
              >
                ✦ Length-Tracked (Premium)
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Client shell — handles tabs + modal interactions */}
      <StockPageClient species={species} inventoryItems={inventoryItems} />
    </div>
  );
}
