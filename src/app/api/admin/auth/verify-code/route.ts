import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { ADMIN_SESSION_COOKIE, createSessionToken } from "@/lib/adminAuth";
import { verifyOtp } from "@/lib/adminOtp";
import { DEFAULT_WEDDING_DATA } from "@/lib/newClient";
import { applyToEncryptedFields, encrypt } from "@/lib/accountCrypto";
import { getSchemaForTemplate } from "@/lib/templateSchemas";

const CLIENTS_DIR = path.join(process.cwd(), "data", "clients");

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

  const { email, code } = await req.json().catch(() => ({ email: undefined, code: undefined }));
  if (!email || typeof email !== "string" || !code || typeof code !== "string") {
    return NextResponse.json({ error: "이메일과 코드를 입력하세요" }, { status: 400 });
  }

  const result = await verifyOtp(email, code, secret);
  if (result.status !== "ok") {
    const status = result.status === "too_many_attempts" ? 429 : 401;
    return NextResponse.json({ error: ERROR_MESSAGES[result.status] }, { status });
  }

  // 첫 로그인인 고객이면 계정(파일)이 아직 없으므로 기본 데이터로 자동 생성
  if (result.role === "customer" && result.file) {
    await fs.mkdir(CLIENTS_DIR, { recursive: true });
    const filePath = path.join(CLIENTS_DIR, `${result.file}.json`);
    const exists = await fs.access(filePath).then(() => true).catch(() => false);
    if (!exists) {
      const data = { ...DEFAULT_WEDDING_DATA, slug: result.file };
      const schema = getSchemaForTemplate(data.template);
      const toSave = applyToEncryptedFields(data, schema, encrypt);
      await fs.writeFile(filePath, JSON.stringify(toSave, null, 2), "utf-8");
    }
  }

  const token = await createSessionToken(secret, { role: result.role, file: result.file });
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
