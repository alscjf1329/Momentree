import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, createSessionToken, sessionCookieOptions } from "@/lib/adminAuth";
import { verifyOtp } from "@/lib/adminOtp";
import { DEFAULT_WEDDING_DATA, upcomingWeddingDate } from "@/lib/newClient";
import { customerExists, saveCustomer } from "@/lib/customers";
import { clientIp, isRateLimited } from "@/lib/rateLimit";

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

  // 이메일별 5회 제한은 코드를 재발급하면 초기화되므로, IP 단위로도 시도 횟수를 제한
  if (isRateLimited(`verify-code:${clientIp(req)}`, 20, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "시도 횟수를 초과했습니다. 잠시 후 다시 시도해주세요" }, { status: 429 });
  }

  const { email, code } = await req.json().catch(() => ({ email: undefined, code: undefined }));
  if (!email || typeof email !== "string" || !code || typeof code !== "string") {
    return NextResponse.json({ error: "이메일과 코드를 입력하세요" }, { status: 400 });
  }

  const result = await verifyOtp(email, code, secret);
  if (result.status !== "ok") {
    const status = result.status === "too_many_attempts" ? 429 : 401;
    return NextResponse.json({ error: ERROR_MESSAGES[result.status] }, { status });
  }

  // 첫 로그인인 고객이면 계정이 아직 없으므로 기본 데이터로 자동 생성 (소유자 = 가입 이메일)
  if (result.role === "customer" && result.file && !customerExists(result.file)) {
    saveCustomer(result.file, { ...DEFAULT_WEDDING_DATA, slug: result.file, date: upcomingWeddingDate() }, result.file);
  }

  const token = await createSessionToken(secret, { role: result.role, file: result.file, email });
  const res = NextResponse.json({ ok: true, role: result.role });
  res.cookies.set(ADMIN_SESSION_COOKIE, token, sessionCookieOptions());
  return res;
}
