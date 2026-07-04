"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const registered = searchParams.get("registered");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
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

      localStorage.setItem("hrms_token", data.token);
      localStorage.setItem("hrms_user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (err) {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>HRMS Portal</h1>
        <p>Sign in to your account</p>

        {registered === "true" && (
          <div style={{ background: "#d1fae5", color: "#065f46", padding: "10px 14px", borderRadius: "var(--radius)", fontSize: 13, marginBottom: 16 }}>
            Account created successfully! Sign in with your credentials.
          </div>
        )}

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 14 }}>
          Don't have an account?{" "}
          <a href="/signup" style={{ color: "var(--primary)", fontWeight: 600 }}>Sign up</a>
        </p>

        <div className="login-hint">
          <strong>Demo Credentials:</strong><br />
          HR: hr@hrms.com / admin123<br />
          Employee: alice@hrms.com / emp123<br />
          Employee: bob@hrms.com / emp123
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="login-container">
        <div className="login-card"><p>Loading...</p></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
