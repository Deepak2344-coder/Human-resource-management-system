import { redirect } from "next/navigation";
import { getSession, isHR } from "@/lib/auth";
import { payrollRecords, notifications, users } from "@/lib/data";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  const isHrAdmin = isHR(user);

  let myPayroll, recentNotifs, stats;

  if (isHrAdmin) {
    const pendingPayroll = payrollRecords.filter((r) => r.status === "pending");
    const paidPayroll = payrollRecords.filter((r) => r.status === "paid");
    const unreadNotifs = notifications.filter(
      (n) => n.userId === null && !n.read && (n.targetRole === "all" || n.targetRole === user.role)
    );
    stats = {
      totalEmployees: users.length,
      pendingPayroll: pendingPayroll.length,
      paidPayroll: paidPayroll.length,
      unreadNotifs: unreadNotifs.length,
    };
    recentNotifs = unreadNotifs.slice(0, 5);
    myPayroll = payrollRecords.filter((r) => r.userId === user.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else {
    myPayroll = payrollRecords.filter((r) => r.userId === user.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const myNotifs = notifications.filter((n) => n.userId === user.id && !n.read);
    const latestPayroll = myPayroll[0];
    stats = {
      totalPayroll: myPayroll.length,
      pendingPayments: myPayroll.filter((r) => r.status === "pending").length,
      latestSalary: latestPayroll ? `₹${latestPayroll.netPay.toLocaleString()}` : "N/A",
      unreadNotifs: myNotifs.length,
    };
    recentNotifs = myNotifs.slice(0, 5);
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Welcome, {user.name}</h1>
          <p>{user.department} &middot; {user.employeeId} &middot; {user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
        </div>
      </div>

      <div className="stats-grid">
        {isHrAdmin ? (
          <>
            <div className="stat-card">
              <div className="stat-label">Total Employees</div>
              <div className="stat-value">{stats.totalEmployees}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Paid Payrolls</div>
              <div className="stat-value">{stats.paidPayroll}</div>
              <div className="stat-sub">All time</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Pending Payrolls</div>
              <div className="stat-value">{stats.pendingPayroll}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Unread Notifications</div>
              <div className="stat-value">{stats.unreadNotifs}</div>
            </div>
          </>
        ) : (
          <>
            <div className="stat-card">
              <div className="stat-label">Latest Net Salary</div>
              <div className="stat-value">{stats.latestSalary}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Payroll Records</div>
              <div className="stat-value">{stats.totalPayroll}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Pending Payments</div>
              <div className="stat-value">{stats.pendingPayments}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Unread Notifications</div>
              <div className="stat-value">{stats.unreadNotifs}</div>
            </div>
          </>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600 }}>Recent Payroll</h2>
            <Link href="/payroll" className="btn btn-sm btn-secondary">View All</Link>
          </div>
          {myPayroll.length === 0 ? (
            <p style={{ color: "var(--gray-500)", fontSize: 14 }}>No payroll records found.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Net Pay</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myPayroll.slice(0, 5).map((r) => (
                    <tr key={r.id}>
                      <td>{r.month}</td>
                      <td>₹{r.netPay.toLocaleString()}</td>
                      <td>
                        <span className={`badge ${r.status === "paid" ? "badge-paid" : "badge-pending"}`}>
                          {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600 }}>Recent Notifications</h2>
            <Link href="/notifications" className="btn btn-sm btn-secondary">View All</Link>
          </div>
          {recentNotifs.length === 0 ? (
            <p style={{ color: "var(--gray-500)", fontSize: 14 }}>No notifications yet.</p>
          ) : (
            recentNotifs.map((n) => (
              <div key={n.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--gray-100)" }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{n.title}</div>
                <div style={{ fontSize: 13, color: "var(--gray-500)" }}>{n.message}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
