import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isValidClientFilename } from "@/lib/newClient";
import { getCustomer, getPlan, paidInfo, setPlan } from "@/lib/customers";
import { countRsvp } from "@/lib/entries";
import { photoLimit, rsvpLimit } from "@/lib/plan";

// 고객은 자기 청첩장, 관리자는 ?file= 지정
function fileOf(session: { role: string; file?: string }, param: string | null) {
  const file = session.role === "admin" ? param : session.file;
  return file && isValidClientFilename(file) ? file : null;
}

// GET /api/plan?file=  → 현재 플랜과 사용량 (Infinity는 JSON에서 null = 무제한)
export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const file = fileOf(session, req.nextUrl.searchParams.get("file"));
  const plan = file && getPlan(file);
  if (!file || !plan) return NextResponse.json({ error: "not found" }, { status: 404 });
  const lim = (n: number) => (Number.isFinite(n) ? n : null);
  return NextResponse.json({
    plan, ...paidInfo(file), photos: getCustomer(file)?.gallery?.length ?? 0, photoLimit: lim(photoLimit(plan)),
    rsvp: countRsvp(file), rsvpLimit: lim(rsvpLimit(plan)),
  });
}

// POST { file, plan } → 수동 업그레이드/되돌리기 (관리자 전용 — 결제 연동 전)
export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (session?.role !== "admin") return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { file, plan } = await req.json().catch(() => ({}));
  if (typeof file !== "string" || !isValidClientFilename(file) || (plan !== "free" && plan !== "paid")) {
    return NextResponse.json({ error: "file, plan required" }, { status: 400 });
  }
  return setPlan(file, plan) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not found" }, { status: 404 });
}
