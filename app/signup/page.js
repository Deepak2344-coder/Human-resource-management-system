"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", department: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(field) {
    return (e) => setForm((p) => ({ ...p, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          department: form.department,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Signup failed");
        return;
      }

      router.push("/login?registered=true");
    } catch (err) {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Create Account</h1>
        <p>Register as a new employee</p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input id="name" className="input" placeholder="John Doe" value={form.name} onChange={handleChange("name")} required />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" className="input" placeholder="you@company.com" value={form.email} onChange={handleChange("email")} required />
          </div>

          <div className="form-group">
            <label htmlFor="department">Department</label>
            <input id="department" className="input" placeholder="e.g. Engineering" value={form.department} onChange={handleChange("department")} />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" className="input" placeholder="At least 4 characters" value={form.password} onChange={handleChange("password")} required minLength={4} />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input id="confirmPassword" type="password" className="input" placeholder="Re-enter password" value={form.confirmPassword} onChange={handleChange("confirmPassword")} required />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 14 }}>
          Already have an account?{" "}
          <a href="/login" style={{ color: "var(--primary)", fontWeight: 600 }}>Sign in</a>
        </p>
      </div>
    </div>
  );
}
