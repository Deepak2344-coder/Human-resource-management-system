import { cookies } from "next/headers";
import { users } from "./data";

export function getUserFromSession(sessionValue) {
  if (!sessionValue) return null;
  try {
    const data = JSON.parse(atob(sessionValue));
    return users.find((u) => u.id === data.userId) || null;
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  if (!session) return null;
  return getUserFromSession(session.value);
}

export function isHR(user) {
  return user && (user.role === "hr" || user.role === "admin");
}

export function isAdmin(user) {
  return user && user.role === "admin";
}

export function canManagePayroll(user) {
  return user && (user.role === "hr" || user.role === "admin");
}

export function canViewAllNotifications(user) {
  return user && (user.role === "hr" || user.role === "admin");
}

export function getRedirectPath(user) {
  if (!user) return "/login";
  if (user.role === "admin" || user.role === "hr") return "/dashboard";
  return "/dashboard";
}

export function getFilteredPayroll(user, allRecords) {
  if (!user) return [];
  if (canManagePayroll(user)) return allRecords;
  return allRecords.filter((r) => r.userId === user.id);
}

export function getFilteredNotifications(user, allNotifications) {
  if (!user) return [];
  if (canViewAllNotifications(user)) {
    return allNotifications.filter(
      (n) =>
        n.userId === null &&
        (n.targetRole === "all" || n.targetRole === user.role || n.targetRole === "hr" || n.targetRole === "admin")
    );
  }
  return allNotifications.filter((n) => n.userId === user.id);
}
