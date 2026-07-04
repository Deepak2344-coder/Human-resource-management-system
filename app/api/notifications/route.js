import { NextResponse } from "next/server";
import { notifications } from "@/lib/data";

export async function GET(request) {
  const userId = parseInt(request.headers.get("x-user-id"));
  const role = request.headers.get("x-user-role");

  let result;
  if (role === "hr" || role === "admin") {
    result = notifications.filter(
      (n) =>
        n.userId === null &&
        (n.targetRole === "all" || n.targetRole === role)
    );
  } else {
    result = notifications.filter((n) => n.userId === userId);
  }

  result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return NextResponse.json(result);
}
