import { NextResponse } from "next/server";
import { payrollRecords, users } from "@/lib/data";

export async function GET(request) {
  const userId = parseInt(request.headers.get("x-user-id"));
  const role = request.headers.get("x-user-role");

  let records;
  if (role === "hr" || role === "admin") {
    records = payrollRecords.map((r) => {
      const user = users.find((u) => u.id === r.userId);
      return { ...r, employee: user ? { name: user.name, employeeId: user.employeeId, department: user.department } : null };
    });
  } else {
    records = payrollRecords
      .filter((r) => r.userId === userId)
      .map((r) => {
        const user = users.find((u) => u.id === r.userId);
        return { ...r, employee: user ? { name: user.name, employeeId: user.employeeId, department: user.department } : null };
      });
  }

  records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return NextResponse.json(records);
}
