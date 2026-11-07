// Edge(미들웨어)와 Node(라우트 핸들러) 양쪽에서 동작해야 하므로 Web Crypto API만 사용한다.
export const ADMIN_SESSION_COOKIE = "admin_session";

const encoder = new TextEncoder();

function base64url(bytes: Uint8Array): string {
  let str = "";
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlToBytes(b64url: string): Uint8Array<ArrayBuffer> {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(b64url.length / 4) * 4, "=");
  const str = atob(b64);
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i);
  return bytes;
}

async function getKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function hmac(value: string, secret: string): Promise<string> {
  const key = await getKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return base64url(new Uint8Array(sig));
}

export function generateOtpCode(): string {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return String(arr[0] % 1_000_000).padStart(6, "0");
}

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7일

export type SessionRole = "admin" | "customer";

export interface SessionPayload {
  exp: number;
  role: SessionRole;
  file?: string; // 고객: 지금 편집 중인 청첩장 / 관리자: 관리자 이메일
  email?: string; // 로그인한 사람의 이메일 (예전 토큰엔 없음 — 그땐 file이 곧 이메일)
  memberRole?: string; // getSession이 DB에서 확인해 채운다 (토큰에는 저장하지 않음)
}

export async function createSessionToken(
  secret: string,
  identity: { role: SessionRole; file?: string; email?: string }
): Promise<string> {
  const payload = JSON.stringify({ exp: Date.now() + SESSION_TTL_MS, ...identity });
  const payloadB64 = base64url(encoder.encode(payload));
  const sig = await hmac(payloadB64, secret);
  return `${payloadB64}.${sig}`;
}

export async function verifySessionToken(
  token: string | undefined,
  secret: string
): Promise<SessionPayload | null> {
  if (!token) return null;
  const [payloadB64, sigB64] = token.split(".");
  if (!payloadB64 || !sigB64) return null;

  try {
    const key = await getKey(secret);
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      base64urlToBytes(sigB64),
      encoder.encode(payloadB64)
    );
    if (!valid) return null;

    const payload = JSON.parse(new TextDecoder().decode(base64urlToBytes(payloadB64)));
    if (
      typeof payload.exp !== "number" ||
      payload.exp <= Date.now() ||
      (payload.role !== "admin" && payload.role !== "customer")
    ) {
      return null;
    }
    return payload as SessionPayload;
  } catch {
    return null;
  }
}
