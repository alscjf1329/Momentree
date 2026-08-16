import { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, verifySessionToken, type SessionPayload } from "@/lib/adminAuth";

export async function getSession(req: NextRequest): Promise<SessionPayload | null> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return null;
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return verifySessionToken(token, secret);
}
