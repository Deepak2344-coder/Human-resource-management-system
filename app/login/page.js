"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Email is required"); return; }
    if (!password) { setError("Password is required"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }
      router.push("/dashboard");
    } catch {
      setError("Connection error");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-text-primary tracking-tight">HRMS</h1>
          <p className="text-sm text-text-muted mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-dark-surface border border-dark-border rounded-xl p-6 space-y-4">
          {error && (
            <div className="text-sm text-status-absent bg-status-absent/10 rounded-lg px-3 py-2">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-accent text-white font-medium text-sm hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <p className="text-center text-xs text-text-muted">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-accent hover:underline">Sign up</Link>
          </p>
        </form>

        <div className="mt-4 bg-dark-surface/50 border border-dark-border rounded-xl p-3">
          <p className="text-xs text-text-muted font-medium mb-1">Demo credentials:</p>
          <p className="text-xs text-text-muted font-mono">Employee: john@company.com / john123</p>
          <p className="text-xs text-text-muted font-mono">HR: hr@company.com / hr123</p>
          <p className="text-xs text-text-muted font-mono">Admin: admin@company.com / admin123</p>
        </div>
      </div>
    </div>
  );
}
