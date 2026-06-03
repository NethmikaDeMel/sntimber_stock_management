import {
  Package,
  AlertTriangle,
  ShoppingCart,
  Activity,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { StockBarChart } from "@/components/dashboard/StockBarChart";
import { VelocityLineChart } from "@/components/dashboard/VelocityLineChart";
import { LowStockFeed } from "@/components/dashboard/LowStockFeed";

export default function DashboardPage() {
  return (
    <div className="p-8">
      {/* ── Header ── */}
      <div className="mb-8">
        <h1
          className="font-display text-3xl font-bold"
          style={{ color: "var(--color-text-primary)" }}
        >
          Operations Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
          SN Timber Stores · Real-time inventory overview
        </p>
      </div>

      {/* ── Stat Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Inventory Volume"
          value="19,960"
          subtext="Linear ft + Sq ft combined across all species"
          trend="up"
          accentColor="var(--color-accent)"
          icon={<Package size={18} />}
        />
        <StatCard
          label="Low Stock Alerts"
          value="5"
          subtext="Items at or below safety threshold"
          trend="down"
          accentColor="var(--color-danger)"
          icon={<AlertTriangle size={18} />}
        />
        <StatCard
          label="Recent Sales Activity"
          value="38"
          subtext="Transactions logged in the last 7 days"
          trend="up"
          accentColor="var(--color-info)"
          icon={<ShoppingCart size={18} />}
        />
        <StatCard
          label="System Health"
          value="100%"
          subtext="All stock records verified · Audit clean"
          trend="neutral"
          accentColor="var(--color-success)"
          icon={<Activity size={18} />}
        />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-8">
        <StockBarChart />
        <VelocityLineChart />
      </div>

      {/* ── Low Stock Feed ── */}
      <LowStockFeed />
    </div>
  );
}
