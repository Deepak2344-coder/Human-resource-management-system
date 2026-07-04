"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications");
      if (res.status === 401) { router.push("/login"); return; }
      const data = await res.json();
      setNotifications(data);
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

  async function markAllRead() {
    try {
      const unread = notifications.filter((n) => !n.read);
      await Promise.all(unread.map((n) =>
        fetch(`/api/notifications/${n.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ read: true }),
        })
      ));
      fetchNotifications();
    } catch (e) {
      console.error("Failed to mark all as read", e);
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
    if (mins < 60) return `${mins} minutes ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} days ago`;
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="page-container">
        <p style={{ color: "var(--gray-500)", textAlign: "center", padding: 48 }}>Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Notifications</h1>
          <p>{unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-primary" onClick={markAllRead}>
            Mark All as Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card">
          <div style={{ textAlign: "center", padding: 48, color: "var(--gray-400)" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔔</div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--gray-600)", marginBottom: 8 }}>No notifications yet</h3>
            <p style={{ fontSize: 14 }}>We'll notify you when something important comes up.</p>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`notif-item ${!n.read ? "unread" : ""}`}
              style={{ padding: "16px 20px" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div className="notif-item-title">
                    {getTypeIcon(n.type)} {n.title}
                    {!n.read && (
                      <span className="badge badge-unread" style={{ marginLeft: 8, fontSize: 10 }}>NEW</span>
                    )}
                  </div>
                  <div className="notif-item-msg">{n.message}</div>
                  <div className="notif-item-time">{formatTime(n.createdAt)}</div>
                </div>
                <div style={{ display: "flex", gap: 8, marginLeft: 16 }}>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
