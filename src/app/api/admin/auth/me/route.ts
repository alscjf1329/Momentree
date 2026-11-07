import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, createSessionToken, sessionCookieOptions, sessionTtlMs } from "@/lib/adminAuth";
import { getSession } from "@/lib/session";
import { isSuperAdmin } from "@/lib/admins";
import { getLabel } from "@/lib/customers";
import { filesOf } from "@/lib/access";

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ authed: false }, { status: 401 });
  const email = session.email ?? session.file ?? null;
  const superAdmin = session.role === "admin" && !!email && isSuperAdmin(email);
  const res = NextResponse.json({ authed: true, role: session.role, file: session.file ?? null, email, superAdmin,
    memberRole: session.memberRole ?? null,
    label: session.role === "customer" && session.file ? getLabel(session.file) : null, files: session.role === "customer" && email ? filesOf(email) : [] });
  // 슬라이딩 갱신: 남은 기간이 절반 아래면 새로 발급 (계속 쓰는 사람은 로그인이 풀리지 않는다)
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (secret && session.exp - Date.now() < sessionTtlMs() / 2) {
    res.cookies.set(ADMIN_SESSION_COOKIE, await createSessionToken(secret, { role: session.role, file: session.file, email: session.email }), sessionCookieOptions());
  }
  return res;
}
