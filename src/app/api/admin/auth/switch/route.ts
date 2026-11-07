import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, createSessionToken, sessionCookieOptions } from "@/lib/adminAuth";
import { memberRole } from "@/lib/access";
import { getSession } from "@/lib/session";

// POST { file } → 내가 멤버인 다른 청첩장으로 전환 (세션 재발급)
export async function POST(req: NextRequest) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const session = await getSession(req);
  const { file } = await req.json().catch(() => ({ file: undefined }));
  if (!secret || !session || session.role !== "customer" || !session.email || typeof file !== "string" || !memberRole(file, session.email)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, await createSessionToken(secret, { role: "customer", file, email: session.email }), sessionCookieOptions());
  return res;
}
