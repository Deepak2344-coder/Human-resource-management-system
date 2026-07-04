"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const EMPLOYEE_NAV = [
  { label: "Dashboard", href: "/dashboard", icon: "◇" },
  { label: "Profile", href: "/dashboard/profile", icon: "○" },
  { label: "Attendance", href: "/dashboard/attendance", icon: "☰" },
  { label: "My Records", href: "/dashboard/attendance/my", icon: "📋" },
  { label: "History", href: "/dashboard/attendance/history", icon: "📅" },
  { label: "Leave", href: "/dashboard/leave", icon: "▤" },
  { label: "Payroll", href: "/dashboard/payroll", icon: "₿" },
  { label: "Settings", href: "/dashboard/settings", icon: "⚙" },
];

const HR_NAV = [
  { label: "Dashboard", href: "/dashboard/admin", icon: "◇" },
  { label: "Analytics", href: "/dashboard/admin/analytics", icon: "📊" },
  { label: "Attendance Mgmt", href: "/dashboard/admin/attendance", icon: "☰" },
  { label: "Profile", href: "/dashboard/profile", icon: "○" },
  { label: "Leave", href: "/dashboard/leave", icon: "▤" },
  { label: "Payroll", href: "/dashboard/payroll", icon: "₿" },
  { label: "Settings", href: "/dashboard/settings", icon: "⚙" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const NAV_ITEMS = user?.role === "HR" ? HR_NAV : EMPLOYEE_NAV;

  const isActive = (href) => {
    if (!pathname) return false;
    if (href === "/dashboard") return pathname === "/dashboard" || pathname === "/dashboard/admin";
    return pathname.startsWith(href);
  };

  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-50 bg-dark-surface border border-dark-border rounded-lg p-2"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        <span className="text-text-primary text-xl">{open ? "✕" : "☰"}</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40 w-64 bg-dark-surface border-r border-dark-border
          transform transition-transform duration-200
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 flex flex-col
        `}
      >
        <div className="p-5 border-b border-dark-border">
          <h1 className="text-xl font-heading font-bold text-text-primary tracking-tight">
            HRMS
          </h1>
          <p className="text-xs text-text-muted mt-1 font-mono">{user?.employeeId}</p>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive(item.href)
                  ? "bg-accent/10 text-accent font-medium"
                  : "text-text-secondary hover:text-text-primary hover:bg-dark-border/50"
              }`}
            >
              <span className="w-5 text-center">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-dark-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center text-sm font-bold text-white">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{user?.name}</p>
              <p className="text-xs text-text-muted truncate">{user?.role === "HR" ? "HR Admin" : "Employee"}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              router.replace("/login");
            }}
            className="mt-3 w-full px-3 py-2 text-xs text-status-absent bg-status-absent/10 rounded-lg hover:bg-status-absent/20 transition-colors font-medium"
          >
            Sign Out
          </button>
        </div>
      </aside>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-dark-surface border-t border-dark-border z-30 flex justify-around py-2 px-1">
        {(user?.role === "HR" ? HR_NAV : EMPLOYEE_NAV).slice(0, 5).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] ${
              isActive(item.href)
                ? "text-accent"
                : "text-text-muted"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
