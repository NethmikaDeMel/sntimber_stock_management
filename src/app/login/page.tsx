"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TreePine, Loader2, Eye, EyeOff } from "lucide-react";
import { getBrowserClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleLogin() {
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    startTransition(async () => {
      const supabase = getBrowserClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        setError(
          authError.message === "Invalid login credentials"
            ? "Incorrect email or password. Please try again."
            : authError.message
        );
        return;
      }

      router.push("/dashboard");
      router.refresh();
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleLogin();
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--color-canvas)" }}
    >
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{
              background: "linear-gradient(135deg, var(--color-timber-600), var(--color-timber-900))",
              boxShadow: "0 4px 24px rgba(212,134,42,.3)",
            }}
          >
            <TreePine size={32} className="text-white" />
          </div>
          <h1
            className="font-display text-2xl font-bold"
            style={{ color: "var(--color-text-primary)" }}
          >
            SN Timber Stores
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
            Stock Management System
          </p>
        </div>

        {/* Card */}
        <div
          className="card p-6"
          style={{ borderColor: "var(--color-border-2)" }}
        >
          <h2
            className="font-display text-lg font-semibold mb-5"
            style={{ color: "var(--color-text-primary)" }}
          >
            Sign in to your account
          </h2>

          {/* Error */}
          {error && (
            <div
              className="px-4 py-3 rounded-xl text-sm mb-4"
              style={{
                background: "rgba(248,113,113,.1)",
                border: "1px solid rgba(248,113,113,.3)",
                color: "var(--color-danger)",
              }}
            >
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            {/* Email */}
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                style={{ color: "var(--color-text-muted)" }}
              >
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={isPending}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-border-2)",
                  color: "var(--color-text-primary)",
                  opacity: isPending ? 0.6 : 1,
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-accent)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-border-2)")}
              />
            </div>

            {/* Password */}
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                style={{ color: "var(--color-text-muted)" }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={isPending}
                  className="w-full px-4 py-3 pr-11 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: "var(--color-surface-2)",
                    border: "1px solid var(--color-border-2)",
                    color: "var(--color-text-primary)",
                    opacity: isPending ? 0.6 : 1,
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-accent)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-border-2)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-lg transition-colors"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleLogin}
              disabled={isPending}
              className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2 mt-1"
              style={{ opacity: isPending ? 0.7 : 1 }}
            >
              {isPending ? (
                <><Loader2 size={15} className="animate-spin" /> Signing in…</>
              ) : (
                "Sign In"
              )}
            </button>
          </div>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "var(--color-text-muted)" }}>
          Access is restricted to authorised SN Timber staff only.
        </p>
      </div>
    </div>
  );
}
