import { NextResponse } from "next/server";
import { users, getNextUserId } from "@/lib/data";

export async function POST(request) {
  try {
    const { name, email, password, department } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    if (password.length < 4) {
      return NextResponse.json({ error: "Password must be at least 4 characters" }, { status: 400 });
    }

    const existing = users.find((u) => u.email === email);
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const id = getNextUserId();
    const empNum = String(id).padStart(3, "0");
    const newUser = {
      id,
      name,
      email,
      password,
      role: "employee",
      department: department || "General",
      employeeId: `EMP${empNum}`,
    };

    users.push(newUser);

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        employeeId: newUser.employeeId,
      },
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
