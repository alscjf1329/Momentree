import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isSuperAdmin } from "@/lib/admins";

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ authed: false }, { status: 401 });
  const email = session.file ?? null;
  const superAdmin = session.role === "admin" && !!email && isSuperAdmin(email);
  return NextResponse.json({ authed: true, role: session.role, file: session.file ?? null, email, superAdmin });
}
