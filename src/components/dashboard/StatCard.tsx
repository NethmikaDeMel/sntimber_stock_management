"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  subtext: string;
  trend?: "up" | "down" | "neutral";
  icon: React.ReactNode;
  accentColor?: string;
}

export function StatCard({
  label,
  value,
  subtext,
  trend = "neutral",
  icon,
  accentColor = "var(--color-accent)",
}: StatCardProps) {
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  const trendColor =
    trend === "up"
      ? "var(--color-success)"
      : trend === "down"
      ? "var(--color-danger)"
      : "var(--color-text-muted)";

  return (
    <div
      className="card p-5 flex flex-col gap-4 relative overflow-hidden"
      style={{ borderColor: "var(--color-border)" }}
    >
      {/* Subtle glow blob */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 blur-2xl pointer-events-none"
        style={{ background: accentColor }}
      />

      <div className="flex items-start justify-between">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-xl"
          style={{ background: `${accentColor}1a`, color: accentColor }}
        >
          {icon}
        </div>
        <div
          className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full"
          style={{
            background: `${trendColor}18`,
            color: trendColor,
          }}
        >
          <TrendIcon size={11} />
          <span>{trend === "neutral" ? "Stable" : trend === "up" ? "Up" : "Down"}</span>
        </div>
      </div>

      <div>
        <p
          className="font-display text-3xl font-bold leading-none mb-1"
          style={{ color: "var(--color-text-primary)" }}
        >
          {value}
        </p>
        <p
          className="text-sm font-medium"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {label}
        </p>
        <p
          className="text-xs mt-1"
          style={{ color: "var(--color-text-muted)" }}
        >
          {subtext}
        </p>
      </div>
    </div>
  );
}
