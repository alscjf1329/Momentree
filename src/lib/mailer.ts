import nodemailer from "nodemailer";
import type { NextRequest } from "next/server";

// Gmail 발송 (OTP·초대 메일 공용). 설정이 없으면 false, 발송 실패도 false.
export async function sendMail(to: string, subject: string, html: string): Promise<boolean> {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return false;
  try {
    await nodemailer.createTransport({ service: "gmail", auth: { user, pass } }).sendMail({ from: `Momentree <${user}>`, to, subject, html });
    return true;
  } catch {
    return false;
  }
}

// 메일 속 링크용 주소. SITE_URL이 있으면 그것, 없으면 프록시 헤더/요청 주소
export function siteUrl(req: NextRequest): string {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") ?? req.nextUrl.protocol.replace(":", "");
  return host ? `${proto}://${host}` : req.nextUrl.origin;
}
