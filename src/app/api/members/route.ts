import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { addMember, can, INVITABLE, listMembers, removeMember } from "@/lib/access";
import { customerExists } from "@/lib/customers";
import { isValidClientFilename, isValidLoginEmail } from "@/lib/newClient";

// 청첩장 멤버(함께 편집하는 사람) 관리 — 소유자·관리자만. 고객은 자기가 편집 중인 청첩장, 관리자는 ?file= 지정.
async function target(req: NextRequest, fileParam: string | null) {
  const session = await getSession(req);
  if (!session) return { error: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  if (!can(session, "members")) return { error: NextResponse.json({ error: "forbidden" }, { status: 403 }) };
  const file = session.role === "admin" ? fileParam : session.file;
  if (!file || !isValidClientFilename(file) || !customerExists(file)) {
    return { error: NextResponse.json({ error: "file required" }, { status: 400 }) };
  }
  return { file };
}

export async function GET(req: NextRequest) {
  const t = await target(req, req.nextUrl.searchParams.get("file"));
  return t.error ?? NextResponse.json(listMembers(t.file!));
}

// POST { email, role?: "editor", file? }
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const t = await target(req, body.file ?? null);
  if (t.error) return t.error;
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const role = body.role ?? "editor";
  if (!isValidLoginEmail(email) || !INVITABLE.includes(role)) {
    return NextResponse.json({ error: "올바른 이메일/역할이 아닙니다" }, { status: 400 });
  }
  return addMember(t.file!, email, role) === "full"
    ? NextResponse.json({ error: "멤버가 너무 많습니다" }, { status: 400 })
    : NextResponse.json({ ok: true });
}

// DELETE ?email=&file=
export async function DELETE(req: NextRequest) {
  const t = await target(req, req.nextUrl.searchParams.get("file"));
  if (t.error) return t.error;
  const email = req.nextUrl.searchParams.get("email") ?? "";
  return removeMember(t.file!, email) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not found" }, { status: 404 });
}
