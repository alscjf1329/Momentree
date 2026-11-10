import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { notifyOperator, telegramConfigured } from "@/lib/notify";
import { isRateLimited } from "@/lib/rateLimit";

// 로그인 고객/관리자 문의 접수 → 텔레그램 전달 전용. 내용은 DB/파일/로그에 저장하지 않는다(개인정보 최소화).
// 이메일·청첩장 ID는 세션에서만 가져온다(클라이언트 값은 신뢰하지 않음).
export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  if (!telegramConfigured()) return NextResponse.json({ error: "지금은 문의를 받을 수 없어요" }, { status: 503 });
  const email = session.email ?? session.file ?? "";
  if (isRateLimited(`contact:${email}`, 3, 60 * 1000) || isRateLimited(`contact-day:${email}`, 20, 24 * 60 * 60 * 1000)) {
    return NextResponse.json({ error: "문의가 너무 많아요. 잠시 후 다시 시도해 주세요" }, { status: 429 });
  }
  const b = await req.json().catch(() => null);
  if (!b || typeof b !== "object") return NextResponse.json({ error: "잘못된 요청입니다" }, { status: 400 });
  // 허니팟: 사람 눈에 안 보이는 필드가 채워졌으면 봇 — 성공한 척 응답하고 전달하지 않는다.
  if (b.website) return NextResponse.json({ ok: true });

  const message = typeof b.message === "string" ? b.message.trim() : "";
  if (!message || message.length > 1000) {
    return NextResponse.json({ error: "내용은 1~1000자로 입력해 주세요" }, { status: 400 });
  }
  const who = session.role === "admin" ? `[관리자] ${email}` : `${email}\n청첩장: ${session.file}`;
  if (!(await notifyOperator(`[문의] ${who}\n\n${message}`))) {
    return NextResponse.json({ error: "접수하지 못했어요. 잠시 후 다시 시도해 주세요" }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
