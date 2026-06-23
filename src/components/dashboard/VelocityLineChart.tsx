"use client";

import {
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Area, AreaChart,
} from "recharts";
import type { VelocityPoint } from "@/types/supabase";

const CustomTooltip = ({
  active, payload, label,
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
      <p className="font-semibold mb-2" style={{ color: "var(--color-text-secondary)" }}>{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
          <span style={{ color: "var(--color-text-secondary)" }}>{entry.name}:</span>
          <span className="font-mono font-medium">{entry.value} txns</span>
        </div>
      ))}
    </div>
  );
};

export function VelocityLineChart({ data }: { data: VelocityPoint[] }) {
  return (
    <div className="card p-5" style={{ borderColor: "var(--color-border)" }}>
      <div className="mb-4">
        <h3 className="font-display text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>
          Transaction Velocity
        </h3>
        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
          Daily activity this week — restocks, sales & waste cuts
        </p>
      </div>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-60 text-sm" style={{ color: "var(--color-text-muted)" }}>
          No transaction data yet.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="gradRestock" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-forest-500)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="var(--color-forest-500)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-info)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="var(--color-info)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradWaste" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-danger)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="var(--color-danger)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: "var(--color-text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "var(--color-text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--color-border-2)" }} />
            <Legend wrapperStyle={{ fontSize: 12, color: "var(--color-text-secondary)" }} />
            <Area type="monotone" dataKey="restocks" name="Restocks" stroke="var(--color-forest-400)" strokeWidth={2} fill="url(#gradRestock)" dot={{ fill: "var(--color-forest-400)", r: 3 }} />
            <Area type="monotone" dataKey="sales" name="Sales" stroke="var(--color-info)" strokeWidth={2} fill="url(#gradSales)" dot={{ fill: "var(--color-info)", r: 3 }} />
            <Area type="monotone" dataKey="waste" name="Waste" stroke="var(--color-danger)" strokeWidth={2} fill="url(#gradWaste)" dot={{ fill: "var(--color-danger)", r: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
