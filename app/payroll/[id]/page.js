"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PayrollDetailPage({ params }) {
  const router = useRouter();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);

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
      } catch {}
    }
  }, []);

  useEffect(() => {
    async function fetchRecord() {
      try {
        const { id } = await params;
        const res = await fetch(`/api/payroll/${id}`);
        if (res.status === 401) { router.push("/login"); return; }
        if (res.status === 403) { router.push("/payroll"); return; }
        if (res.status === 404) { router.push("/payroll"); return; }
        const data = await res.json();
        setRecord(data);
      } catch (e) {
        console.error("Failed to fetch record", e);
      } finally {
        setLoading(false);
      }
    }
    fetchRecord();
  }, [params, router]);

  function totalAllowances(r) {
    return r.allowances.reduce((sum, a) => sum + Number(a.amount), 0);
  }

  function totalDeductions(r) {
    return r.deductions.reduce((sum, d) => sum + Number(d.amount), 0);
  }

  function startEditing() {
    setEditForm({
      basicSalary: record.basicSalary,
      allowances: record.allowances.map((a) => ({ ...a })),
      deductions: record.deductions.map((d) => ({ ...d })),
      status: record.status,
      paymentDate: record.paymentDate || "",
    });
    setEditing(true);
  }

  function handleAllowanceChange(index, field, value) {
    setEditForm((prev) => {
      const allowances = [...prev.allowances];
      allowances[index] = { ...allowances[index], [field]: field === "amount" ? Number(value) : value };
      return { ...prev, allowances };
    });
  }

  function handleDeductionChange(index, field, value) {
    setEditForm((prev) => {
      const deductions = [...prev.deductions];
      deductions[index] = { ...deductions[index], [field]: field === "amount" ? Number(value) : value };
      return { ...prev, deductions };
    });
  }

  function addAllowance() {
    setEditForm((prev) => ({ ...prev, allowances: [...prev.allowances, { name: "", amount: 0 }] }));
  }

  function removeAllowance(index) {
    setEditForm((prev) => ({ ...prev, allowances: prev.allowances.filter((_, i) => i !== index) }));
  }

  function addDeduction() {
    setEditForm((prev) => ({ ...prev, deductions: [...prev.deductions, { name: "", amount: 0 }] }));
  }

  function removeDeduction(index) {
    setEditForm((prev) => ({ ...prev, deductions: prev.deductions.filter((_, i) => i !== index) }));
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      const res = await fetch(`/api/payroll/${record.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to update");
        return;
      }
      const data = await res.json();
      setRecord(data.record);
      setEditing(false);
    } catch (e) {
      alert("Failed to update payroll record");
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <p style={{ color: "var(--gray-500)", textAlign: "center", padding: 48 }}>Loading payroll details...</p>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="page-container">
        <p style={{ color: "var(--gray-500)", textAlign: "center", padding: 48 }}>Record not found.</p>
      </div>
    );
  }

  const isHR = user && (user.role === "hr" || user.role === "admin");
  const grossPay = record.basicSalary + totalAllowances(record);
  const netPay = grossPay - totalDeductions(record);

  return (
    <div className="page-container">
      <div style={{ marginBottom: 24 }}>
        <Link href="/payroll" style={{ color: "var(--primary)", fontSize: 14 }}>← Back to Payroll</Link>
      </div>

      <div className="page-header">
        <div>
          <h1>Payroll Details</h1>
          <p>{record.month} {isHR && record.employee && `- ${record.employee.name} (${record.employee.employeeId})`}</p>
        </div>
        {isHR && !editing && (
          <button className="btn btn-primary" onClick={startEditing}>Edit Record</button>
        )}
      </div>

      {editing ? (
        <div className="card">
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Edit Payroll</h2>
          <form onSubmit={handleSave}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Basic Salary (₹)</label>
              <input
                className="input"
                type="number"
                value={editForm.basicSalary}
                onChange={(e) => setEditForm((p) => ({ ...p, basicSalary: Number(e.target.value) }))}
                required
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label style={{ fontSize: 14, fontWeight: 500 }}>Allowances</label>
                <button type="button" className="btn btn-sm btn-secondary" onClick={addAllowance}>+ Add</button>
              </div>
              {editForm.allowances.map((a, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <input className="input" placeholder="Name" value={a.name} onChange={(e) => handleAllowanceChange(i, "name", e.target.value)} />
                  <input className="input" type="number" placeholder="Amount" style={{ maxWidth: 120 }} value={a.amount} onChange={(e) => handleAllowanceChange(i, "amount", Number(e.target.value))} />
                  {editForm.allowances.length > 1 && <button type="button" className="btn btn-sm btn-danger" onClick={() => removeAllowance(i)}>×</button>}
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label style={{ fontSize: 14, fontWeight: 500 }}>Deductions</label>
                <button type="button" className="btn btn-sm btn-secondary" onClick={addDeduction}>+ Add</button>
              </div>
              {editForm.deductions.map((d, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <input className="input" placeholder="Name" value={d.name} onChange={(e) => handleDeductionChange(i, "name", e.target.value)} />
                  <input className="input" type="number" placeholder="Amount" style={{ maxWidth: 120 }} value={d.amount} onChange={(e) => handleDeductionChange(i, "amount", Number(e.target.value))} />
                  {editForm.deductions.length > 1 && <button type="button" className="btn btn-sm btn-danger" onClick={() => removeDeduction(i)}>×</button>}
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Status</label>
              <select className="input" value={editForm.status} onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Payment Date</label>
              <input className="input" type="date" value={editForm.paymentDate} onChange={(e) => setEditForm((p) => ({ ...p, paymentDate: e.target.value }))} />
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Changes</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="payroll-detail-grid">
          <div className="card">
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Salary Breakdown</h2>
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--gray-100)" }}>
                <span style={{ color: "var(--gray-600)" }}>Basic Salary</span>
                <span style={{ fontWeight: 600 }}>₹{record.basicSalary.toLocaleString()}</span>
              </div>
            </div>

            <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--gray-600)", marginBottom: 8 }}>Allowances</h3>
            {record.allowances.map((a, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--gray-100)" }}>
                <span style={{ color: "var(--gray-600)" }}>{a.name}</span>
                <span className="value positive">+₹{Number(a.amount).toLocaleString()}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontWeight: 600, color: "var(--success)" }}>
              <span>Total Allowances</span>
              <span>+₹{totalAllowances(record).toLocaleString()}</span>
            </div>

            <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--gray-600)", marginBottom: 8, marginTop: 16 }}>Deductions</h3>
            {record.deductions.map((d, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--gray-100)" }}>
                <span style={{ color: "var(--gray-600)" }}>{d.name}</span>
                <span className="value negative">-₹{Number(d.amount).toLocaleString()}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontWeight: 600, color: "var(--danger)" }}>
              <span>Total Deductions</span>
              <span>-₹{totalDeductions(record).toLocaleString()}</span>
            </div>

            <div style={{ marginTop: 20, padding: "16px 0 0", borderTop: "2px solid var(--gray-200)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 14, color: "var(--gray-500)" }}>Gross Pay</div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>₹{grossPay.toLocaleString()}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 14, color: "var(--gray-500)" }}>Net Pay</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "var(--primary)" }}>₹{netPay.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="card" style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Payment Info</h2>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--gray-100)" }}>
                <span style={{ color: "var(--gray-600)" }}>Status</span>
                <span className={`badge ${record.status === "paid" ? "badge-paid" : "badge-pending"}`}>
                  {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--gray-100)" }}>
                <span style={{ color: "var(--gray-600)" }}>Payment Date</span>
                <span style={{ fontWeight: 500 }}>{record.paymentDate || "Not yet paid"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                <span style={{ color: "var(--gray-600)" }}>Month</span>
                <span style={{ fontWeight: 500 }}>{record.month}</span>
              </div>
            </div>

            {isHR && record.employee && (
              <div className="card">
                <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Employee Info</h2>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--gray-100)" }}>
                  <span style={{ color: "var(--gray-600)" }}>Name</span>
                  <span style={{ fontWeight: 500 }}>{record.employee.name}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--gray-100)" }}>
                  <span style={{ color: "var(--gray-600)" }}>Employee ID</span>
                  <span style={{ fontWeight: 500 }}>{record.employee.employeeId}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                  <span style={{ color: "var(--gray-600)" }}>Department</span>
                  <span style={{ fontWeight: 500 }}>{record.employee.department}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
