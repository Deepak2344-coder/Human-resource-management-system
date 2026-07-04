"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function Navbar({ user }) {
  const router = useRouter();
  const pathname = usePathname();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const panelRef = useRef(null);

  const isHR = user.role === "hr" || user.role === "admin";

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      console.error("Failed to fetch notifications", e);
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id) {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });
      fetchNotifications();
    } catch (e) {
      console.error("Failed to mark as read", e);
    }
  }

  async function deleteNotification(id) {
    try {
      await fetch(`/api/notifications/${id}`, { method: "DELETE" });
      fetchNotifications();
    } catch (e) {
      console.error("Failed to delete notification", e);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  function isActive(path) {
    return pathname.startsWith(path) ? "active" : "";
  }

  function getTypeIcon(type) {
    const icons = { attendance: "⏰", leave: "📅", payroll: "💰", profile: "👤", announcement: "📢" };
    return icons[type] || "🔔";
  }

  function formatTime(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  }

  return (
    <nav className="navbar">
      <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
        <Link href="/dashboard" className="navbar-brand">
          HRMS
        </Link>
        <div className="navbar-links">
          <Link href="/dashboard" className={isActive("/dashboard")}>
            Dashboard
          </Link>
          <Link href="/payroll" className={isActive("/payroll")}>
            Payroll
          </Link>
          <Link href="/notifications" className={isActive("/notifications")}>
            Notifications
          </Link>
        </div>
      </div>

      <div className="navbar-right">
        <div style={{ position: "relative" }} ref={panelRef}>
          <button className="notif-bell" onClick={() => setNotifOpen(!notifOpen)} aria-label="Notifications">
            🔔
            {unreadCount > 0 && <span className="notif-count">{unreadCount > 99 ? "99+" : unreadCount}</span>}
          </button>

          {notifOpen && (
            <div className="notif-panel">
              <div className="notif-panel-header">
                <h3>Notifications</h3>
                <Link href="/notifications" style={{ fontSize: 13, color: "var(--primary)" }} onClick={() => setNotifOpen(false)}>
                  View All
                </Link>
              </div>

              {loading ? (
                <div className="notif-empty">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="notif-empty">No notifications yet</div>
              ) : (
                notifications.slice(0, 10).map((n) => (
                  <div key={n.id} className={`notif-item ${!n.read ? "unread" : ""}`}>
                    <div className="notif-item-title">
                      {getTypeIcon(n.type)} {n.title}
                    </div>
                    <div className="notif-item-msg">{n.message}</div>
                    <div className="notif-item-time">{formatTime(n.createdAt)}</div>
                    <div className="notif-item-actions">
                      {!n.read && (
                        <button className="btn btn-sm btn-secondary" onClick={() => markAsRead(n.id)}>
                          Mark Read
                        </button>
                      )}
                      <button className="btn btn-sm btn-secondary" onClick={() => deleteNotification(n.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="navbar-user">
          <span>{user.name}</span>
          <span className="role-badge">{user.role.toUpperCase()}</span>
        </div>

        <button className="btn btn-sm btn-secondary" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
