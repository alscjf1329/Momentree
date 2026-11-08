import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { addMember, can, INVITABLE, listMembers, removeMember } from "@/lib/access";
import { customerExists, getLabel, getPlan, getShareId, getTemplate } from "@/lib/customers";
import { canInviteMembers, PLAN_MSG } from "@/lib/plan";
import { siteUrl } from "@/lib/mailer";
import { enqueueMail } from "@/lib/mailQueue";
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
  // 멤버 초대는 유료만 (관리자 대행은 제한 없음)
  if ((await getSession(req))?.role !== "admin" && !canInviteMembers(getPlan(t.file!) ?? "free")) {
    return NextResponse.json({ error: PLAN_MSG.members }, { status: 403 });
  }
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const role = body.role ?? "editor";
  if (!isValidLoginEmail(email) || !INVITABLE.includes(role)) {
    return NextResponse.json({ error: "올바른 이메일/역할이 아닙니다" }, { status: 400 });
  }
  if (addMember(t.file!, email, role) === "full") return NextResponse.json({ error: "멤버가 너무 많습니다" }, { status: 400 });

  // 초대 메일 (이미 멤버여도 다시 보낼 수 있다). 큐에 접수만 하고(queued) 발송·재시도는 워커가 한다. 최종 실패해도 멤버 등록은 유지.
  const base = siteUrl(req);
  const login = `${base}/admin/login?email=${encodeURIComponent(email)}`;
  const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`); // 이름은 고객이 입력한 값
  const inviter = esc((await getSession(req))?.email ?? "관리자");
  const label = esc(getLabel(t.file!) || "청첩장");
  const preview = `${base}/invite/${getTemplate(t.file!)}?id=${getShareId(t.file!)}`;
  await enqueueMail({
    to: email,
    subject: `[Momentree] ${inviter} 님이 '${label}' 청첩장 공동 편집에 초대했어요`,
    html: `<p><b>${inviter}</b> 님이 <b>${label}</b> 청첩장을 함께 편집하도록 초대했어요.</p>
     <p><a href="${login}" style="display:inline-block;padding:10px 18px;background:#1f2937;color:#fff;border-radius:8px;text-decoration:none">초대 수락하고 편집하기</a></p>
     <p style="color:#666;font-size:13px">버튼을 누르고 이 이메일(${email})로 인증 코드를 받아 로그인하면 바로 편집 화면이 열립니다.<br>청첩장 미리보기: <a href="${preview}">${preview}</a></p>`,
  });
  return NextResponse.json({ ok: true, queued: true, loginUrl: login });
}

// DELETE ?email=&file=
export async function DELETE(req: NextRequest) {
  const t = await target(req, req.nextUrl.searchParams.get("file"));
  if (t.error) return t.error;
  const email = req.nextUrl.searchParams.get("email") ?? "";
  return removeMember(t.file!, email) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not found" }, { status: 404 });
}
