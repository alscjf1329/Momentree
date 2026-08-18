import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isValidLoginEmail } from "@/lib/newClient";
import { addAdmin, isSuperAdmin, readAdmins, removeAdmin } from "@/lib/admins";

async function requireSuperAdmin(req: NextRequest) {
  const session = await getSession(req);
  if (!session || session.role !== "admin" || !session.file || !isSuperAdmin(session.file)) {
    return null;
  }
  return session;
}

// GET /api/admin/admins → 부관리자 목록 (슈퍼 관리자 전용)
export async function GET(req: NextRequest) {
  if (!(await requireSuperAdmin(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ superAdmin: process.env.ADMIN_EMAIL, admins: await readAdmins() });
}

// POST /api/admin/admins  body: { email }  → 부관리자 추가
export async function POST(req: NextRequest) {
  if (!(await requireSuperAdmin(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { email } = await req.json().catch(() => ({ email: undefined }));
  if (!email || typeof email !== "string" || !isValidLoginEmail(email)) {
    return NextResponse.json({ error: "올바른 이메일을 입력하세요" }, { status: 400 });
  }
  if (email === process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "이미 최상위 운영자입니다" }, { status: 400 });
  }
  await addAdmin(email);
  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/admins?email=...  → 부관리자 삭제
export async function DELETE(req: NextRequest) {
  if (!(await requireSuperAdmin(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const email = req.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });
  await removeAdmin(email);
  return NextResponse.json({ ok: true });
}
