import { NextResponse } from "next/server";
import { payrollRecords, users, getNextPayrollId } from "@/lib/data";

export async function POST(request) {
  const role = request.headers.get("x-user-role");
  const name = request.headers.get("x-user-name");

  if (role !== "hr" && role !== "admin") {
    return NextResponse.json({ error: "Forbidden: Only HR/Admin can generate payroll" }, { status: 403 });
  }

  try {
    const { userId, basicSalary, allowances, deductions, month } = await request.json();

    const user = users.find((u) => u.id === userId);
    if (!user) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const totalAllowances = allowances.reduce((sum, a) => sum + Number(a.amount), 0);
    const totalDeductions = deductions.reduce((sum, d) => sum + Number(d.amount), 0);
    const grossPay = Number(basicSalary) + totalAllowances;
    const netPay = grossPay - totalDeductions;

    const newRecord = {
      id: getNextPayrollId(),
      userId,
      basicSalary: Number(basicSalary),
      allowances,
      deductions,
      grossPay,
      netPay,
      status: "pending",
      paymentDate: null,
      month,
      createdAt: new Date().toISOString(),
    };

    payrollRecords.push(newRecord);

    return NextResponse.json({ success: true, record: newRecord }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
  }
}
