import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { generateOtpCode } from "@/lib/adminAuth";
import { isOnCooldown, issueOtp, OTP_TTL_MS } from "@/lib/adminOtp";

export async function POST() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const secret = process.env.ADMIN_SESSION_SECRET;
  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

  if (!adminEmail || !secret || !gmailUser || !gmailAppPassword) {
    return NextResponse.json({ error: "관리자 인증이 설정되지 않았습니다" }, { status: 500 });
  }

  if (await isOnCooldown()) {
    return NextResponse.json({ error: "잠시 후 다시 시도해주세요" }, { status: 429 });
  }

  const code = generateOtpCode();
  await issueOtp(code, secret);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: gmailUser, pass: gmailAppPassword },
  });

  try {
    await transporter.sendMail({
      from: `Momentree <${gmailUser}>`,
      to: adminEmail,
      subject: "[Momentree] 관리자 인증 코드",
      html: `<p>인증 코드: <strong style="font-size:20px">${code}</strong></p><p>${OTP_TTL_MS / 60000}분간 유효합니다.</p>`,
    });
  } catch {
    return NextResponse.json({ error: "이메일 발송에 실패했습니다" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
