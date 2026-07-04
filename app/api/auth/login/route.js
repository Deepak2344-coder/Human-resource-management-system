import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { users } from "@/lib/data";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = users.find((u) => u.email === email && u.password === password);

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const sessionData = btoa(JSON.stringify({ userId: user.id, role: user.role, name: user.name }));

    const cookieStore = await cookies();
    cookieStore.set("session", sessionData, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department, employeeId: user.employeeId },
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
