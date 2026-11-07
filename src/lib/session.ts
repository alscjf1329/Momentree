import { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, verifySessionToken, type SessionPayload } from "@/lib/adminAuth";
import { memberRole } from "@/lib/access";

export async function getSession(req: NextRequest): Promise<SessionPayload | null> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return null;
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const s = await verifySessionToken(token, secret);
  if (!s || s.role === "admin") return s;
  // 고객은 쿠키(7일)가 아니라 DB의 현재 멤버십을 기준으로 한다 — 멤버에서 빠지면 바로 접근이 끊긴다
  const email = s.email ?? s.file;
  const role = s.file && email ? memberRole(s.file, email) : null;
  return role ? { ...s, email, memberRole: role } : null;
}
