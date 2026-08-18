import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { generateOtpCode, type SessionRole } from "@/lib/adminAuth";
import { isOnCooldown, issueOtp, OTP_TTL_MS } from "@/lib/adminOtp";
import { isValidLoginEmail } from "@/lib/newClient";
import { isAdmin } from "@/lib/admins";

export async function POST(req: NextRequest) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const secret = process.env.ADMIN_SESSION_SECRET;
  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

  if (!adminEmail || !secret || !gmailUser || !gmailAppPassword) {
    return NextResponse.json({ error: "관리자 인증이 설정되지 않았습니다" }, { status: 500 });
  }

  const { email } = await req.json().catch(() => ({ email: undefined }));
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "이메일을 입력하세요" }, { status: 400 });
  }

  let role: SessionRole;
  let file: string | undefined;

  if (await isAdmin(email)) {
    role = "admin";
    file = email;
  } else {
    // 관리자가 미리 만들어주지 않아도 이메일 인증만으로 고객 계정이 생성된다 (최초 로그인 시 자동 생성)
    if (!isValidLoginEmail(email)) {
      return NextResponse.json({ error: "올바른 이메일 형식이 아닙니다" }, { status: 400 });
    }
    role = "customer";
    file = email;
  }

  if (await isOnCooldown(email)) {
    return NextResponse.json({ error: "잠시 후 다시 시도해주세요" }, { status: 429 });
  }

  const code = generateOtpCode();
  await issueOtp(email, code, secret, role, file);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: gmailUser, pass: gmailAppPassword },
  });

  try {
    await transporter.sendMail({
      from: `Momentree <${gmailUser}>`,
      to: email,
      subject: "[Momentree] 인증 코드",
      html: `<p>인증 코드: <strong style="font-size:20px">${code}</strong></p><p>${OTP_TTL_MS / 60000}분간 유효합니다.</p>`,
    });
  } catch {
    return NextResponse.json({ error: "이메일 발송에 실패했습니다" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
