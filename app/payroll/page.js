"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PayrollPage() {
  const router = useRouter();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [showGenerate, setShowGenerate] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    userId: "", basicSalary: "", allowances: [{ name: "", amount: "" }],
    deductions: [{ name: "", amount: "" }], month: "",
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  async function fetchRecords() {
    try {
      const res = await fetch("/api/payroll");
      if (res.status === 401) { router.push("/login"); return; }
      if (res.status === 403) { router.push("/dashboard"); return; }
      const data = await res.json();
      setRecords(data);
      if (data.length > 0) {
        const empRes = await fetch("/api/auth/login");
      }
    } catch (e) {
      console.error("Failed to fetch payroll", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/notifications");
        const userId = parseInt(res.headers.get("x-user-id"));
      } catch {}
    }
    fetchUser();
  }, []);

  const isHR = typeof window !== "undefined" && document.cookie.includes("session");
  const [role, setRole] = useState("");

  useEffect(() => {
    const cookies = document.cookie.split(";").reduce((acc, c) => {
      const [k, v] = c.trim().split("=");
      acc[k] = v;
      return acc;
    }, {});
    if (cookies.session) {
      try {
        const data = JSON.parse(atob(cookies.session));
        setUser(data);
        setRole(data.role);
      } catch {}
    }
  }, []);

  const filteredRecords = records.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const emp = r.employee || {};
    return (
      emp.name?.toLowerCase().includes(q) ||
      emp.employeeId?.toLowerCase().includes(q) ||
      r.month?.toLowerCase().includes(q)
    );
  });

  function totalAllowances(record) {
    return record.allowances.reduce((sum, a) => sum + Number(a.amount), 0);
  }

  function totalDeductions(record) {
    return record.deductions.reduce((sum, d) => sum + Number(d.amount), 0);
  }

  function handleGenerateChange(index, field, value, type) {
    setGenerateForm((prev) => {
      if (field === "allowances" || field === "deductions") {
        const items = [...prev[field]];
        items[index] = { ...items[index], [value]: type };
        return { ...prev, [field]: items };
      }
      return { ...prev, [field]: value };
    });
  }

  function addAllowance() {
    setGenerateForm((prev) => ({
      ...prev,
      allowances: [...prev.allowances, { name: "", amount: "" }],
    }));
  }

  function removeAllowance(index) {
    setGenerateForm((prev) => ({
      ...prev,
      allowances: prev.allowances.filter((_, i) => i !== index),
    }));
  }

  function addDeduction() {
    setGenerateForm((prev) => ({
      ...prev,
      deductions: [...prev.deductions, { name: "", amount: "" }],
    }));
  }

  function removeDeduction(index) {
    setGenerateForm((prev) => ({
      ...prev,
      deductions: prev.deductions.filter((_, i) => i !== index),
    }));
  }

  async function handleGenerate(e) {
    e.preventDefault();
    try {
      const payload = {
        userId: parseInt(generateForm.userId),
        basicSalary: parseFloat(generateForm.basicSalary),
        allowances: generateForm.allowances.filter((a) => a.name && a.amount).map((a) => ({ name: a.name, amount: parseFloat(a.amount) })),
        deductions: generateForm.deductions.filter((d) => d.name && d.amount).map((d) => ({ name: d.name, amount: parseFloat(d.amount) })),
        month: generateForm.month || new Date().toLocaleDateString("en-US", { year: "numeric", month: "long" }),
      };

      const res = await fetch("/api/payroll/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to generate payroll");
        return;
      }

      alert("Payroll generated successfully!");
      setShowGenerate(false);
      setGenerateForm({ userId: "", basicSalary: "", allowances: [{ name: "", amount: "" }], deductions: [{ name: "", amount: "" }], month: "" });
      fetchRecords();
    } catch (e) {
      alert("Failed to generate payroll");
    }
  }

  async function markAsPaid(id) {
    if (!confirm("Mark this payroll as paid?")) return;
    try {
      const res = await fetch(`/api/payroll/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paid", paymentDate: new Date().toISOString().split("T")[0] }),
      });
      if (res.ok) {
        fetchRecords();
      }
    } catch (e) {
      console.error("Failed to update payroll", e);
    }
  }

  async function deleteRecord(id) {
    if (!confirm("Delete this payroll record?")) return;
    try {
      const res = await fetch(`/api/payroll/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchRecords();
      }
    } catch (e) {
      console.error("Failed to delete", e);
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <p style={{ color: "var(--gray-500)", textAlign: "center", padding: 48 }}>Loading payroll records...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Payroll</h1>
          <p>{isHR ? "Manage employee payroll" : "Your salary details"}</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {(role === "hr" || role === "admin") && (
            <button className="btn btn-primary" onClick={() => setShowGenerate(true)}>
              + Generate Payroll
            </button>
          )}
        </div>
      </div>

      {(role === "hr" || role === "admin") && (
        <div style={{ marginBottom: 20 }}>
          <input
            className="input"
            style={{ maxWidth: 400 }}
            placeholder="Search by name, employee ID, or month..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {filteredRecords.length === 0 ? (
        <div className="card">
          <p style={{ color: "var(--gray-500)", textAlign: "center", padding: 32 }}>
            {search ? "No records match your search." : "No payroll records found."}
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  {(role === "hr" || role === "admin") && <th>Employee</th>}
                  <th>Month</th>
                  <th>Basic</th>
                  <th>Allowances</th>
                  <th>Deductions</th>
                  <th>Gross Pay</th>
                  <th>Net Pay</th>
                  <th>Status</th>
                  <th>Payment Date</th>
                  {(role === "hr" || role === "admin") && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((r) => (
                  <tr key={r.id}>
                    {(role === "hr" || role === "admin") && (
                      <td>
                        <Link href={`/payroll/${r.id}`} style={{ color: "var(--primary)", fontWeight: 500 }}>
                          {r.employee?.name}
                        </Link>
                        <div style={{ fontSize: 12, color: "var(--gray-400)" }}>{r.employee?.employeeId}</div>
                      </td>
                    )}
                    <td>{r.month}</td>
                    <td>₹{r.basicSalary.toLocaleString()}</td>
                    <td>₹{totalAllowances(r).toLocaleString()}</td>
                    <td>₹{totalDeductions(r).toLocaleString()}</td>
                    <td>₹{r.grossPay.toLocaleString()}</td>
                    <td style={{ fontWeight: 600 }}>₹{r.netPay.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${r.status === "paid" ? "badge-paid" : "badge-pending"}`}>
                        {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                      </span>
                    </td>
                    <td>{r.paymentDate || "-"}</td>
                    {(role === "hr" || role === "admin") && (
                      <td>
                        <div style={{ display: "flex", gap: 4 }}>
                          <Link href={`/payroll/${r.id}`} className="btn btn-sm btn-secondary">
                            View
                          </Link>
                          {r.status === "pending" && (
                            <button className="btn btn-sm btn-success" onClick={() => markAsPaid(r.id)}>
                              Pay
                            </button>
                          )}
                          <button className="btn btn-sm btn-danger" onClick={() => deleteRecord(r.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                    {role === "employee" && (
                      <td>
                        <Link href={`/payroll/${r.id}`} className="btn btn-sm btn-secondary">
                          View Details
                        </Link>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showGenerate && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 1000, padding: 24,
        }}>
          <div className="card" style={{ maxWidth: 600, width: "100%", maxHeight: "90vh", overflow: "auto" }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>Generate Payroll</h2>
            <form onSubmit={handleGenerate}>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Employee ID</label>
                <input
                  className="input"
                  placeholder="User ID (e.g., 3)"
                  value={generateForm.userId}
                  onChange={(e) => setGenerateForm((p) => ({ ...p, userId: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Basic Salary (₹)</label>
                <input
                  className="input"
                  type="number"
                  value={generateForm.basicSalary}
                  onChange={(e) => setGenerateForm((p) => ({ ...p, basicSalary: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Month</label>
                <input
                  className="input"
                  placeholder="e.g., August 2026"
                  value={generateForm.month}
                  onChange={(e) => setGenerateForm((p) => ({ ...p, month: e.target.value }))}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <label style={{ fontSize: 14, fontWeight: 500 }}>Allowances</label>
                  <button type="button" className="btn btn-sm btn-secondary" onClick={addAllowance}>+ Add</button>
                </div>
                {generateForm.allowances.map((a, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <input
                      className="input"
                      placeholder="Name"
                      value={a.name}
                      onChange={(e) => setGenerateForm((p) => {
                        const allowances = [...p.allowances];
                        allowances[i] = { ...allowances[i], name: e.target.value };
                        return { ...p, allowances };
                      })}
                    />
                    <input
                      className="input"
                      type="number"
                      placeholder="Amount"
                      style={{ maxWidth: 120 }}
                      value={a.amount}
                      onChange={(e) => setGenerateForm((p) => {
                        const allowances = [...p.allowances];
                        allowances[i] = { ...allowances[i], amount: e.target.value };
                        return { ...p, allowances };
                      })}
                    />
                    {generateForm.allowances.length > 1 && (
                      <button type="button" className="btn btn-sm btn-danger" onClick={() => removeAllowance(i)}>×</button>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <label style={{ fontSize: 14, fontWeight: 500 }}>Deductions</label>
                  <button type="button" className="btn btn-sm btn-secondary" onClick={addDeduction}>+ Add</button>
                </div>
                {generateForm.deductions.map((d, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <input
                      className="input"
                      placeholder="Name"
                      value={d.name}
                      onChange={(e) => setGenerateForm((p) => {
                        const deductions = [...p.deductions];
                        deductions[i] = { ...deductions[i], name: e.target.value };
                        return { ...p, deductions };
                      })}
                    />
                    <input
                      className="input"
                      type="number"
                      placeholder="Amount"
                      style={{ maxWidth: 120 }}
                      value={d.amount}
                      onChange={(e) => setGenerateForm((p) => {
                        const deductions = [...p.deductions];
                        deductions[i] = { ...deductions[i], amount: e.target.value };
                        return { ...p, deductions };
                      })}
                    />
                    {generateForm.deductions.length > 1 && (
                      <button type="button" className="btn btn-sm btn-danger" onClick={() => removeDeduction(i)}>×</button>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowGenerate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Generate</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
