import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, createSessionToken } from "@/lib/adminAuth";
import { verifyOtp } from "@/lib/adminOtp";

const ERROR_MESSAGES: Record<string, string> = {
  expired: "코드가 만료되었습니다. 다시 요청해주세요",
  too_many_attempts: "시도 횟수를 초과했습니다. 코드를 다시 요청해주세요",
  invalid: "코드가 올바르지 않습니다",
  not_found: "발급된 코드가 없습니다. 코드를 먼저 요청해주세요",
};

export async function POST(req: NextRequest) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "관리자 인증이 설정되지 않았습니다" }, { status: 500 });
  }

  const { code } = await req.json().catch(() => ({ code: undefined }));
  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "코드를 입력하세요" }, { status: 400 });
  }

  const result = await verifyOtp(code, secret);
  if (result !== "ok") {
    const status = result === "too_many_attempts" ? 429 : 401;
    return NextResponse.json({ error: ERROR_MESSAGES[result] }, { status });
  }

  const token = await createSessionToken(secret);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
