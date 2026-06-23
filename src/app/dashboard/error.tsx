"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Dashboard Error]", error);
  }, [error]);

  return (
    <div className="p-8 flex items-center justify-center min-h-96">
      <div
        className="card p-8 max-w-md w-full text-center"
        style={{ borderColor: "rgba(248,113,113,.3)" }}
      >
        <div
          className="flex items-center justify-center w-14 h-14 rounded-2xl mx-auto mb-4"
          style={{ background: "rgba(248,113,113,.12)", color: "var(--color-danger)" }}
        >
          <AlertTriangle size={28} />
        </div>
        <h2
          className="font-display text-xl font-bold mb-2"
          style={{ color: "var(--color-text-primary)" }}
        >
          Failed to load dashboard
        </h2>
        <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
          Could not connect to the database. Check your Supabase environment variables and try again.
        </p>
        {error.digest && (
          <p className="font-mono text-xs mb-4" style={{ color: "var(--color-text-muted)" }}>
            Error ID: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm"
        >
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    </div>
  );
}
