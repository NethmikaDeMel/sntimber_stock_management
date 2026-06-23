export default function DashboardLoading() {
  return (
    <div className="p-8 animate-pulse">
      {/* Header */}
      <div className="mb-8">
        <div className="h-9 w-72 rounded-xl mb-2" style={{ background: "var(--color-surface-2)" }} />
        <div className="h-4 w-64 rounded-lg" style={{ background: "var(--color-surface-2)" }} />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-5 h-36" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
            <div className="h-10 w-10 rounded-xl mb-4" style={{ background: "var(--color-surface-2)" }} />
            <div className="h-8 w-24 rounded-lg mb-2" style={{ background: "var(--color-surface-2)" }} />
            <div className="h-3 w-40 rounded" style={{ background: "var(--color-surface-2)" }} />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-8">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="card p-5 h-72" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
            <div className="h-5 w-48 rounded-lg mb-2" style={{ background: "var(--color-surface-2)" }} />
            <div className="h-3 w-64 rounded mb-6" style={{ background: "var(--color-surface-2)" }} />
            <div className="h-48 rounded-xl" style={{ background: "var(--color-surface-2)" }} />
          </div>
        ))}
      </div>

      {/* Low stock feed */}
      <div className="card p-5" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <div className="h-5 w-48 rounded-lg mb-4" style={{ background: "var(--color-surface-2)" }} />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-14 rounded-xl mb-2" style={{ background: "var(--color-surface-2)" }} />
        ))}
      </div>
    </div>
  );
}
