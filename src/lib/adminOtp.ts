import fs from "fs/promises";
import path from "path";
import { hmac, type SessionRole } from "@/lib/adminAuth";

const OTP_DIR = path.join(process.cwd(), "data", "otp");
export const OTP_TTL_MS = 5 * 60 * 1000;
const REQUEST_COOLDOWN_MS = 30 * 1000;
const MAX_ATTEMPTS = 5;

interface OtpRecord {
  codeHash: string;
  issuedAt: number;
  attempts: number;
  role: SessionRole;
  file?: string;
}

function otpPath(email: string) {
  return path.join(OTP_DIR, `${encodeURIComponent(email)}.json`);
}

async function readOtp(email: string): Promise<OtpRecord | null> {
  try {
    return JSON.parse(await fs.readFile(otpPath(email), "utf-8"));
  } catch {
    return null;
  }
}

async function writeOtp(email: string, record: OtpRecord) {
  await fs.mkdir(OTP_DIR, { recursive: true });
  await fs.writeFile(otpPath(email), JSON.stringify(record), "utf-8");
}

async function clearOtp(email: string) {
  await fs.unlink(otpPath(email)).catch(() => {});
}

// 발급 직후 재요청 스팸 방지용 쿨다운 체크. 아직 유효하면 true를 반환한다.
export async function isOnCooldown(email: string): Promise<boolean> {
  const existing = await readOtp(email);
  if (!existing) return false;
  return Date.now() - existing.issuedAt < REQUEST_COOLDOWN_MS;
}

export async function issueOtp(
  email: string,
  code: string,
  secret: string,
  role: SessionRole,
  file?: string
): Promise<void> {
  const codeHash = await hmac(code, secret);
  await writeOtp(email, { codeHash, issuedAt: Date.now(), attempts: 0, role, file });
}

export type VerifyResult =
  | { status: "ok"; role: SessionRole; file?: string }
  | { status: "expired" | "too_many_attempts" | "invalid" | "not_found" };

export async function verifyOtp(email: string, code: string, secret: string): Promise<VerifyResult> {
  const record = await readOtp(email);
  if (!record) return { status: "not_found" };

  if (Date.now() - record.issuedAt > OTP_TTL_MS) {
    await clearOtp(email);
    return { status: "expired" };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    await clearOtp(email);
    return { status: "too_many_attempts" };
  }

  const codeHash = await hmac(code, secret);
  if (codeHash !== record.codeHash) {
    await writeOtp(email, { ...record, attempts: record.attempts + 1 });
    return { status: "invalid" };
  }

  await clearOtp(email);
  return { status: "ok", role: record.role, file: record.file };
}
