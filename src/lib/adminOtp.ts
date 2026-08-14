import fs from "fs/promises";
import path from "path";
import { hmac } from "@/lib/adminAuth";

const OTP_FILE = path.join(process.cwd(), "data", "admin-otp.json");
export const OTP_TTL_MS = 5 * 60 * 1000;
const REQUEST_COOLDOWN_MS = 30 * 1000;
const MAX_ATTEMPTS = 5;

interface OtpRecord {
  codeHash: string;
  issuedAt: number;
  attempts: number;
}

async function readOtp(): Promise<OtpRecord | null> {
  try {
    return JSON.parse(await fs.readFile(OTP_FILE, "utf-8"));
  } catch {
    return null;
  }
}

async function writeOtp(record: OtpRecord) {
  await fs.mkdir(path.dirname(OTP_FILE), { recursive: true });
  await fs.writeFile(OTP_FILE, JSON.stringify(record), "utf-8");
}

async function clearOtp() {
  await fs.unlink(OTP_FILE).catch(() => {});
}

// 발급 직후 재요청 스팸 방지용 쿨다운 체크. 아직 유효하면 true를 반환한다.
export async function isOnCooldown(): Promise<boolean> {
  const existing = await readOtp();
  if (!existing) return false;
  return Date.now() - existing.issuedAt < REQUEST_COOLDOWN_MS;
}

export async function issueOtp(code: string, secret: string): Promise<void> {
  const codeHash = await hmac(code, secret);
  await writeOtp({ codeHash, issuedAt: Date.now(), attempts: 0 });
}

export type VerifyResult = "ok" | "expired" | "too_many_attempts" | "invalid" | "not_found";

export async function verifyOtp(code: string, secret: string): Promise<VerifyResult> {
  const record = await readOtp();
  if (!record) return "not_found";

  if (Date.now() - record.issuedAt > OTP_TTL_MS) {
    await clearOtp();
    return "expired";
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    await clearOtp();
    return "too_many_attempts";
  }

  const codeHash = await hmac(code, secret);
  if (codeHash !== record.codeHash) {
    await writeOtp({ ...record, attempts: record.attempts + 1 });
    return "invalid";
  }

  await clearOtp();
  return "ok";
}
