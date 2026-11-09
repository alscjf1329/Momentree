import { SERVICE_NAME_EN } from "@/lib/brand";
import nodemailer from "nodemailer";
import type { NextRequest } from "next/server";

// Gmail 발송. 설정이 없거나 SMTP 실패면 throw — 앱 코드는 직접 부르지 말고 mailQueue.enqueueMail을 쓴다.
export async function deliverMail(to: string, subject: string, html: string): Promise<void> {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) throw new Error("mail not configured");
  await nodemailer.createTransport({ service: "gmail", auth: { user, pass } }).sendMail({ from: `${SERVICE_NAME_EN} <${user}>`, to, subject, html });
}

// 메일 속 링크용 주소. SITE_URL이 있으면 그것, 없으면 프록시 헤더/요청 주소
export function siteUrl(req: NextRequest): string {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") ?? req.nextUrl.protocol.replace(":", "");
  return host ? `${proto}://${host}` : req.nextUrl.origin;
}
