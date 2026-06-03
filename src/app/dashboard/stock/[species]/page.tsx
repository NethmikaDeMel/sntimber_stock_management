"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import { use } from "react";
import { ChevronRight, TreePine } from "lucide-react";
import Link from "next/link";
import { getSpecies } from "@/lib/data";
import { StockTabPane } from "@/components/stock/StockTabPane";
import type { TimberClass } from "@/types/timber";

const PRIMARY_TABS: { id: TimberClass; label: string }[] = [
  { id: "dimensional", label: "Dimensional Timber" },
  { id: "plank",       label: "Plank / Board Timber" },
];

export default function SpeciesStockPage({
  params,
}: {
  params: Promise<{ species: string }>;
}) {
  const { species: speciesId } = use(params);
  const species = getSpecies(speciesId);
  if (!species) notFound();

  const [activeClass, setActiveClass] = useState<TimberClass>("dimensional");

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <div
        className="flex items-center gap-2 text-xs mb-6"
        style={{ color: "var(--color-text-muted)" }}
      >
        <Link
          href="/dashboard"
          className="transition-colors"
          style={{ color: "var(--color-text-muted)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "var(--color-accent)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--color-text-muted)")
          }
        >
          Dashboard
        </Link>
        <ChevronRight size={12} />
        <span style={{ color: "var(--color-text-secondary)" }}>
          Stock Management
        </span>
        <ChevronRight size={12} />
        <span style={{ color: "var(--color-accent)" }}>{species.label}</span>
      </div>

      {/* Page Header */}
      <div className="flex items-start gap-4 mb-8">
        <div
          className="flex items-center justify-center w-12 h-12 rounded-xl shrink-0"
          style={{
            background:
              "linear-gradient(135deg, var(--color-timber-600), var(--color-timber-900))",
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
                style={{
                  background: "rgba(212,134,42,.15)",
                  color: "var(--color-accent)",
                }}
              >
                ✦ Length-Tracked (Premium)
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Primary Class Tabs */}
      <div
        className="flex gap-1 p-1 rounded-xl mb-6 w-fit"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        {PRIMARY_TABS.map((tab) => {
          const isActive = tab.id === activeClass;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveClass(tab.id)}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
              style={{
                background: isActive
                  ? "linear-gradient(135deg, var(--color-timber-600), var(--color-timber-800))"
                  : "transparent",
                color: isActive ? "#fff" : "var(--color-text-secondary)",
                boxShadow: isActive
                  ? "0 2px 8px rgba(212,134,42,.25)"
                  : "none",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <StockTabPane species={species} timberClass={activeClass} />
    </div>
  );
}
