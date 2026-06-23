import { Package, AlertTriangle, ShoppingCart, Activity } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { StockBarChart } from "@/components/dashboard/StockBarChart";
import { VelocityLineChart } from "@/components/dashboard/VelocityLineChart";
import { LowStockFeed } from "@/components/dashboard/LowStockFeed";
import {
  getDashboardStats,
  getLowStockAlerts,
  getStockChartData,
  getVelocityData,
} from "@/lib/queries";

export const dynamic = "force-dynamic"; // always fetch fresh data

export default async function DashboardPage() {
  // All four queries run in parallel — single round-trip latency
  const [stats, alerts, chartData, velocityData] = await Promise.all([
    getDashboardStats(),
    getLowStockAlerts(),
    getStockChartData(),
    getVelocityData(),
  ]);

  return (
    <div className="p-8">
      {/* Header */}
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

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Inventory Volume"
          value={stats.totalStockVolume.toLocaleString()}
          subtext="Combined stock across all species & sizes"
          trend="neutral"
          accentColor="var(--color-accent)"
          icon={<Package size={18} />}
        />
        <StatCard
          label="Low Stock Alerts"
          value={stats.lowStockCount}
          subtext="Items at or below safety threshold"
          trend={stats.lowStockCount > 0 ? "down" : "neutral"}
          accentColor="var(--color-danger)"
          icon={<AlertTriangle size={18} />}
        />
        <StatCard
          label="Recent Sales Activity"
          value={stats.recentSalesCount}
          subtext="Transactions logged in the last 7 days"
          trend={stats.recentSalesCount > 0 ? "up" : "neutral"}
          accentColor="var(--color-info)"
          icon={<ShoppingCart size={18} />}
        />
        <StatCard
          label="System Health"
          value="Online"
          subtext="Database connected · RLS active"
          trend="neutral"
          accentColor="var(--color-success)"
          icon={<Activity size={18} />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-8">
        <StockBarChart data={chartData} />
        <VelocityLineChart data={velocityData} />
      </div>

      {/* Low Stock Feed */}
      <LowStockFeed alerts={alerts} />
    </div>
  );
}
