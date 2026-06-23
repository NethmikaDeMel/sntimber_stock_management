export default function SpeciesStockLoading() {
  return (
    <div className="p-8 animate-pulse">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <div className="h-3 w-20 rounded" style={{ background: "var(--color-surface-2)" }} />
        <div className="h-3 w-3 rounded" style={{ background: "var(--color-surface-2)" }} />
        <div className="h-3 w-32 rounded" style={{ background: "var(--color-surface-2)" }} />
        <div className="h-3 w-3 rounded" style={{ background: "var(--color-surface-2)" }} />
        <div className="h-3 w-16 rounded" style={{ background: "var(--color-surface-3)" }} />
      </div>

      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl shrink-0" style={{ background: "var(--color-surface-2)" }} />
        <div>
          <div className="h-9 w-52 rounded-xl mb-2" style={{ background: "var(--color-surface-2)" }} />
          <div className="h-4 w-72 rounded-lg" style={{ background: "var(--color-surface-2)" }} />
        </div>
      </div>

      {/* Primary tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-6 w-fit" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <div className="h-10 w-40 rounded-lg" style={{ background: "var(--color-surface-2)" }} />
        <div className="h-10 w-44 rounded-lg" style={{ background: "var(--color-surface-3)" }} />
      </div>

      {/* Secondary tabs */}
      <div className="flex gap-1.5 p-1 rounded-xl mb-5" style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", width: "fit-content" }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-9 w-16 rounded-lg" style={{ background: i === 0 ? "var(--color-surface-3)" : "transparent" }} />
        ))}
      </div>

      {/* Stock card */}
      <div className="card p-5 max-w-sm h-52" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <div className="h-6 w-20 rounded-lg mb-4" style={{ background: "var(--color-surface-2)" }} />
        <div className="h-10 w-40 rounded-xl mb-2" style={{ background: "var(--color-surface-2)" }} />
        <div className="h-3 w-48 rounded mb-4" style={{ background: "var(--color-surface-2)" }} />
        <div className="h-1.5 w-full rounded-full mb-6" style={{ background: "var(--color-surface-2)" }} />
        <div className="flex gap-2">
          <div className="flex-1 h-10 rounded-xl" style={{ background: "var(--color-surface-2)" }} />
          <div className="flex-1 h-10 rounded-xl" style={{ background: "var(--color-surface-2)" }} />
        </div>
      </div>

      {/* Audit log */}
      <div className="card mt-6 overflow-hidden" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
          <div className="h-4 w-24 rounded" style={{ background: "var(--color-surface-2)" }} />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-6 px-5 py-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
            <div className="h-4 w-28 rounded" style={{ background: "var(--color-surface-2)" }} />
            <div className="h-4 w-20 rounded-full" style={{ background: "var(--color-surface-2)" }} />
            <div className="h-4 w-12 rounded" style={{ background: "var(--color-surface-2)" }} />
            <div className="h-4 w-16 rounded" style={{ background: "var(--color-surface-2)" }} />
            <div className="h-4 flex-1 rounded" style={{ background: "var(--color-surface-2)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
