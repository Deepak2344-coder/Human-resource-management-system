import { NextResponse } from "next/server";
import { notifications } from "@/lib/data";

export async function PUT(request, { params }) {
  const { id } = await params;
  const userId = parseInt(request.headers.get("x-user-id"));
  const role = request.headers.get("x-user-role");
  const notificationId = parseInt(id);

  const index = notifications.findIndex((n) => n.id === notificationId);
  if (index === -1) {
    return NextResponse.json({ error: "Notification not found" }, { status: 404 });
  }

  const notification = notifications[index];

  if (notification.userId !== null && notification.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (notification.userId === null && role !== "hr" && role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { read } = await request.json();
    if (typeof read === "boolean") {
      notifications[index] = { ...notification, read };
    }
    return NextResponse.json({ success: true, notification: notifications[index] });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const userId = parseInt(request.headers.get("x-user-id"));
  const role = request.headers.get("x-user-role");
  const notificationId = parseInt(id);

  const index = notifications.findIndex((n) => n.id === notificationId);
  if (index === -1) {
    return NextResponse.json({ error: "Notification not found" }, { status: 404 });
  }

  const notification = notifications[index];

  if (notification.userId !== null && notification.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (notification.userId === null && role !== "hr" && role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  notifications.splice(index, 1);
  return NextResponse.json({ success: true });
}
