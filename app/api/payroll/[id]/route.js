import { NextResponse } from "next/server";
import { payrollRecords, users } from "@/lib/data";

export async function GET(request, { params }) {
  const { id } = await params;
  const userId = parseInt(request.headers.get("x-user-id"));
  const role = request.headers.get("x-user-role");
  const payrollId = parseInt(id);

  const record = payrollRecords.find((r) => r.id === payrollId);
  if (!record) {
    return NextResponse.json({ error: "Payroll record not found" }, { status: 404 });
  }

  if (role !== "hr" && role !== "admin" && record.userId !== userId) {
    return NextResponse.json({ error: "Forbidden: You can only view your own payroll" }, { status: 403 });
  }

  const user = users.find((u) => u.id === record.userId);
  return NextResponse.json({ ...record, employee: user ? { name: user.name, employeeId: user.employeeId, department: user.department, email: user.email } : null });
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const role = request.headers.get("x-user-role");

  if (role !== "hr" && role !== "admin") {
    return NextResponse.json({ error: "Forbidden: Only HR/Admin can update payroll" }, { status: 403 });
  }

  const payrollId = parseInt(id);
  const index = payrollRecords.findIndex((r) => r.id === payrollId);

  if (index === -1) {
    return NextResponse.json({ error: "Payroll record not found" }, { status: 404 });
  }

  try {
    const updates = await request.json();
    const record = payrollRecords[index];

    const basicSalary = updates.basicSalary !== undefined ? Number(updates.basicSalary) : record.basicSalary;
    const allowances = updates.allowances || record.allowances;
    const deductions = updates.deductions || record.deductions;
    const status = updates.status || record.status;
    const paymentDate = updates.paymentDate !== undefined ? updates.paymentDate : record.paymentDate;

    const totalAllowances = allowances.reduce((sum, a) => sum + Number(a.amount), 0);
    const totalDeductions = deductions.reduce((sum, d) => sum + Number(d.amount), 0);
    const grossPay = basicSalary + totalAllowances;
    const netPay = grossPay - totalDeductions;

    payrollRecords[index] = {
      ...record,
      basicSalary,
      allowances,
      deductions,
      grossPay,
      netPay,
      status,
      paymentDate,
    };

    return NextResponse.json({ success: true, record: payrollRecords[index] });
  } catch {
    return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const role = request.headers.get("x-user-role");

  if (role !== "hr" && role !== "admin") {
    return NextResponse.json({ error: "Forbidden: Only HR/Admin can delete payroll records" }, { status: 403 });
  }

  const payrollId = parseInt(id);
  const index = payrollRecords.findIndex((r) => r.id === payrollId);

  if (index === -1) {
    return NextResponse.json({ error: "Payroll record not found" }, { status: 404 });
  }

  payrollRecords.splice(index, 1);
  return NextResponse.json({ success: true });
}
