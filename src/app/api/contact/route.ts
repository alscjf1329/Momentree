import { NextRequest, NextResponse } from "next/server";
import { notifyOperator, telegramConfigured } from "@/lib/notify";
import { clientIp, isRateLimited } from "@/lib/rateLimit";

// 사이트 문의 접수 → 텔레그램 전달 전용. 내용은 DB/파일/로그에 저장하지 않는다(개인정보 최소화).
export async function POST(req: NextRequest) {
  if (!telegramConfigured()) return NextResponse.json({ error: "문의 접수가 설정되지 않았습니다" }, { status: 503 });
  if (isRateLimited(`contact:${clientIp(req)}`, 3, 60 * 1000)) {
    return NextResponse.json({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요" }, { status: 429 });
  }
  const b = await req.json().catch(() => null);
  if (!b || typeof b !== "object") return NextResponse.json({ error: "잘못된 요청입니다" }, { status: 400 });
  // 허니팟: 사람 눈에 안 보이는 필드가 채워졌으면 봇 — 성공한 척 응답하고 전달하지 않는다.
  if (b.website) return NextResponse.json({ ok: true });

  const name = typeof b.name === "string" ? b.name.trim().slice(0, 50) : "";
  const email = typeof b.email === "string" ? b.email.trim() : "";
  const message = typeof b.message === "string" ? b.message.trim() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return NextResponse.json({ error: "회신 받을 이메일을 확인해주세요" }, { status: 400 });
  }
  if (!message || message.length > 1000) {
    return NextResponse.json({ error: "내용은 1~1000자로 입력해주세요" }, { status: 400 });
  }
  if (!(await notifyOperator(`[문의] ${name ? `${name} ` : ""}${email}\n${message}`))) {
    return NextResponse.json({ error: "접수에 실패했습니다. 잠시 후 다시 시도해주세요" }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
