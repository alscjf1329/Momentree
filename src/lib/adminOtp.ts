import { hmac, type SessionRole } from "@/lib/adminAuth";
import { getDb } from "@/lib/db";

export const OTP_TTL_MS = 5 * 60 * 1000;
const REQUEST_COOLDOWN_MS = 30 * 1000;
const MAX_ATTEMPTS = 5;

interface OtpRow {
  code_hash: string;
  issued_at: number;
  attempts: number;
  role: SessionRole;
  file: string | null;
}

function readOtp(email: string): OtpRow | undefined {
  return getDb().prepare("select code_hash, issued_at, attempts, role, file from otp where email = ?").get(email) as OtpRow | undefined;
}

function clearOtp(email: string) {
  getDb().prepare("delete from otp where email = ?").run(email);
}

// 발급 직후 재요청 스팸 방지용 쿨다운 체크. 아직 유효하면 true를 반환한다.
export async function isOnCooldown(email: string): Promise<boolean> {
  const existing = readOtp(email);
  if (!existing) return false;
  return Date.now() - existing.issued_at < REQUEST_COOLDOWN_MS;
}

export async function issueOtp(
  email: string,
  code: string,
  secret: string,
  role: SessionRole,
  file?: string
): Promise<void> {
  const codeHash = await hmac(code, secret);
  const db = getDb();
  db.prepare(
    `insert into otp (email, code_hash, issued_at, attempts, role, file) values (?, ?, ?, 0, ?, ?)
     on conflict(email) do update set code_hash = excluded.code_hash, issued_at = excluded.issued_at,
       attempts = 0, role = excluded.role, file = excluded.file`
  ).run(email, codeHash, Date.now(), role, file ?? null);
  // 만료된 코드 정리 (다른 사람이 요청하고 쓰지 않은 행이 쌓이지 않게)
  db.prepare("delete from otp where issued_at < ?").run(Date.now() - OTP_TTL_MS);
}

export type VerifyResult =
  | { status: "ok"; role: SessionRole; file?: string }
  | { status: "expired" | "too_many_attempts" | "invalid" | "not_found" };

export async function verifyOtp(email: string, code: string, secret: string): Promise<VerifyResult> {
  const record = readOtp(email);
  if (!record) return { status: "not_found" };

  if (Date.now() - record.issued_at > OTP_TTL_MS) {
    clearOtp(email);
    return { status: "expired" };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    clearOtp(email);
    return { status: "too_many_attempts" };
  }

  const codeHash = await hmac(code, secret);
  if (codeHash !== record.code_hash) {
    getDb().prepare("update otp set attempts = attempts + 1 where email = ?").run(email);
    return { status: "invalid" };
  }

  clearOtp(email);
  return { status: "ok", role: record.role, file: record.file ?? undefined };
}
