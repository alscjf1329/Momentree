import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ authed: false }, { status: 401 });
  const email = session.role === "admin" ? process.env.ADMIN_EMAIL ?? null : session.file ?? null;
  return NextResponse.json({ authed: true, role: session.role, file: session.file ?? null, email });
}
