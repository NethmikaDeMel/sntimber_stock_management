"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { STOCK_CHART_DATA } from "@/lib/data";

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-4 py-3 rounded-xl text-sm shadow-lg"
      style={{
        background: "var(--color-surface-3)",
        border: "1px solid var(--color-border-2)",
        color: "var(--color-text-primary)",
      }}
    >
      <p className="font-semibold mb-2" style={{ color: "var(--color-accent)" }}>
        {label}
      </p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-sm"
            style={{ background: entry.color }}
          />
          <span style={{ color: "var(--color-text-secondary)" }}>
            {entry.name}:
          </span>
          <span className="font-mono font-medium">{entry.value} ft</span>
        </div>
      ))}
    </div>
  );
};

export function StockBarChart() {
  return (
    <div
      className="card p-5"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="mb-4">
        <h3
          className="font-display text-base font-semibold"
          style={{ color: "var(--color-text-primary)" }}
        >
          Stock Distribution by Species
        </h3>
        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
          Dimensional vs Plank inventory (linear/sq ft)
        </p>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={STOCK_CHART_DATA} barCategoryGap="30%" barGap={4}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border)"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={45}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,.04)" }} />
          <Legend
            wrapperStyle={{ fontSize: 12, color: "var(--color-text-secondary)" }}
          />
          <Bar
            dataKey="dimensional"
            name="Dimensional"
            fill="var(--color-timber-600)"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="plank"
            name="Plank / Board"
            fill="var(--color-forest-600)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
