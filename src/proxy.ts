import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/adminAuth";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin/login")) return NextResponse.next();

  const secret = process.env.ADMIN_SESSION_SECRET;
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const session = secret ? await verifySessionToken(token, secret) : null;

  if (session) return NextResponse.next();

  if (pathname.startsWith("/api/clients") || pathname.startsWith("/api/upload")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  return NextResponse.redirect(new URL("/admin/login", req.url));
}

export const config = {
  matcher: ["/admin/:path*", "/api/clients/:path*", "/api/upload/:path*"],
};
