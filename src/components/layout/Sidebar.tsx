"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ChevronDown,
  ChevronRight,
  TreePine,
  Layers,
  User,
  Settings2,
} from "lucide-react";
import { SPECIES } from "@/lib/data";

export function Sidebar() {
  const pathname = usePathname();
  const [stockOpen, setStockOpen] = useState(true);

  const isDashboard = pathname === "/dashboard";
  const isStockSettings = pathname === "/dashboard/stock-settings";
  const activeSpecies = pathname.startsWith("/dashboard/stock/")
    ? pathname.split("/").pop()
    : null;

  return (
    <aside
      style={{ width: "var(--spacing-sidebar)" }}
      className="fixed inset-y-0 left-0 z-40 flex flex-col overflow-hidden"
    >
      {/* Background with subtle wood-grain texture feel */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, var(--color-surface) 0%, var(--color-canvas) 100%)",
          borderRight: "1px solid var(--color-border)",
        }}
      />

      <div className="relative flex flex-col h-full">
        {/* ── Brand ── */}
        <div
          className="flex items-center gap-3 px-5 py-5"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <div
            className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
            style={{
              background:
                "linear-gradient(135deg, var(--color-timber-600), var(--color-timber-800))",
              boxShadow: "0 2px 8px rgba(212,134,42,.3)",
            }}
          >
            <TreePine size={20} className="text-white" />
          </div>
          <div>
            <p
              className="font-display text-sm font-semibold leading-tight"
              style={{ color: "var(--color-text-primary)" }}
            >
              SN Timber
            </p>
            <p
              className="text-xs leading-tight"
              style={{ color: "var(--color-text-muted)" }}
            >
              Stores
            </p>
          </div>
        </div>

        {/* ── User Profile ── */}
        <div
          className="flex items-center gap-3 px-5 py-4 mx-3 my-3 rounded-xl"
          style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}
        >
          <div
            className="flex items-center justify-center w-9 h-9 rounded-full shrink-0"
            style={{
              background:
                "linear-gradient(135deg, var(--color-forest-600), var(--color-forest-800))",
            }}
          >
            <User size={16} className="text-white" />
          </div>
          <div className="overflow-hidden">
            <p
              className="text-sm font-medium truncate"
              style={{ color: "var(--color-text-primary)" }}
            >
              Sunil Nanayakkara
            </p>
            <p
              className="text-xs truncate"
              style={{ color: "var(--color-accent)" }}
            >
              Manager
            </p>
          </div>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          <p
            className="px-2 py-2 text-xs font-medium uppercase tracking-widest"
            style={{ color: "var(--color-text-muted)" }}
          >
            Navigation
          </p>

          {/* Dashboard */}
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all duration-150 group"
            style={{
              background: isDashboard
                ? "linear-gradient(90deg, rgba(212,134,42,.18), rgba(212,134,42,.06))"
                : "transparent",
              borderLeft: isDashboard
                ? "2px solid var(--color-accent)"
                : "2px solid transparent",
              color: isDashboard
                ? "var(--color-accent)"
                : "var(--color-text-secondary)",
            }}
          >
            <LayoutDashboard size={16} />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>

          {/* Stock Management Accordion */}
          <div className="mt-1">
            <button
              onClick={() => setStockOpen((o) => !o)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all duration-150"
              style={{
                background:
                  activeSpecies && !stockOpen
                    ? "rgba(212,134,42,.08)"
                    : "transparent",
                color: "var(--color-text-secondary)",
              }}
            >
              <Layers size={16} />
              <span className="text-sm font-medium flex-1 text-left">
                Stock Management
              </span>
              {stockOpen ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
            </button>

            {stockOpen && (
              <div className="ml-4 pl-3" style={{ borderLeft: "1px solid var(--color-border)" }}>
                {SPECIES.map((species) => {
                  const isActive = activeSpecies === species.id;
                  return (
                    <Link
                      key={species.id}
                      href={`/dashboard/stock/${species.id}`}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg mb-0.5 transition-all duration-150 text-sm"
                      style={{
                        background: isActive
                          ? "rgba(212,134,42,.15)"
                          : "transparent",
                        color: isActive
                          ? "var(--color-accent)"
                          : "var(--color-text-secondary)",
                        fontWeight: isActive ? "500" : "400",
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{
                          background: isActive
                            ? "var(--color-accent)"
                            : "var(--color-border-2)",
                        }}
                      />
                      {species.label}
                      {species.tracksLengths && (
                        <span
                          className="ml-auto text-xs px-1.5 py-0.5 rounded font-mono"
                          style={{
                            background: "rgba(212,134,42,.12)",
                            color: "var(--color-accent)",
                          }}
                        >
                          PRO
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Stock Settings ── */}
          <div className="mt-3">
            <p
              className="px-2 py-2 text-xs font-medium uppercase tracking-widest"
              style={{ color: "var(--color-text-muted)" }}
            >
              Configuration
            </p>
            <Link
              href="/dashboard/stock-settings"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150"
              style={{
                background: isStockSettings
                  ? "linear-gradient(90deg, rgba(212,134,42,.18), rgba(212,134,42,.06))"
                  : "transparent",
                borderLeft: isStockSettings
                  ? "2px solid var(--color-accent)"
                  : "2px solid transparent",
                color: isStockSettings
                  ? "var(--color-accent)"
                  : "var(--color-text-secondary)",
              }}
            >
              <Settings2 size={16} />
              <span className="text-sm font-medium">Stock Settings</span>
            </Link>
          </div>
        </nav>

        {/* ── Footer ── */}
        <div
          className="px-5 py-4 text-xs"
          style={{
            borderTop: "1px solid var(--color-border)",
            color: "var(--color-text-muted)",
          }}
        >
          SN Timber v1.0 · Stock System
        </div>
      </div>
    </aside>
  );
}
