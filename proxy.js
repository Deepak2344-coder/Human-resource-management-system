import { NextResponse } from "next/server";
import { getUserFromSession } from "./lib/auth";

const publicPaths = ["/login", "/signup"];
const apiPrefix = "/api";

export function proxy(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon") || pathname.startsWith("/images")) {
    return NextResponse.next();
  }

  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("session");
  let user = null;
  if (sessionCookie) {
    user = getUserFromSession(sessionCookie.value);
  }

  if (!user) {
    if (pathname.startsWith(apiPrefix)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/api")) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", String(user.id));
    requestHeaders.set("x-user-role", user.role);
    requestHeaders.set("x-user-name", user.name);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
