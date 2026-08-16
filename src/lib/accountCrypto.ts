import crypto from "crypto";
import type { FieldSchema, TemplateSchema } from "@/lib/schema";

// 서버 전용 모듈 — API Route / Server Component에서만 import 할 것
const PREFIX = "enc:v1:";
const ALGO = "aes-256-gcm";

function getKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) throw new Error("ENCRYPTION_KEY가 설정되지 않았습니다");
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) throw new Error("ENCRYPTION_KEY는 base64 인코딩된 32바이트여야 합니다");
  return key;
}

export function encrypt(plain: string): string {
  if (!plain) return plain;
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plain, "utf-8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString("base64")}:${tag.toString("base64")}:${ciphertext.toString("base64")}`;
}

// 레거시(암호화 이전) 평문 데이터는 그대로 반환 — 다음 저장 시 자동으로 암호화됨
export function decrypt(value: string): string {
  if (!value || !value.startsWith(PREFIX)) return value;
  try {
    const [ivB64, tagB64, ctB64] = value.slice(PREFIX.length).split(":");
    const key = getKey();
    const decipher = crypto.createDecipheriv(ALGO, key, Buffer.from(ivB64, "base64"));
    decipher.setAuthTag(Buffer.from(tagB64, "base64"));
    const plain = Buffer.concat([decipher.update(Buffer.from(ctB64, "base64")), decipher.final()]);
    return plain.toString("utf-8");
  } catch {
    return value;
  }
}

function getContainer(root: Record<string, unknown>, path: string): [Record<string, unknown>, string] {
  const keys = path.split(".");
  let cur = root;
  for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]] as Record<string, unknown>;
  return [cur, keys[keys.length - 1]];
}

function walkFields(
  fields: FieldSchema[],
  root: Record<string, unknown>,
  basePath: string,
  fn: (s: string) => string
) {
  for (const field of fields) {
    const path = basePath ? `${basePath}.${field.key}` : field.key;
    if (field.type === "array-object") {
      const [container, key] = getContainer(root, path);
      const items = (container[key] as unknown[]) ?? [];
      items.forEach((_, i) => {
        if (field.itemFields) walkFields(field.itemFields, root, `${path}.${i}`, fn);
      });
    } else if (field.type === "encrypted-text") {
      const [container, key] = getContainer(root, path);
      const val = container[key];
      if (typeof val === "string") container[key] = fn(val);
    }
  }
}

// 스키마에서 encrypted-text로 표시된 필드 전부를 찾아 fn(encrypt 또는 decrypt)을 적용한 복사본을 반환.
// array-object 안에 중첩된 경우(계좌 등) 실제 배열 길이만큼 순회한다.
export function applyToEncryptedFields<T>(data: T, schema: TemplateSchema, fn: (s: string) => string): T {
  const clone = structuredClone(data) as Record<string, unknown>;
  for (const section of schema.sections) {
    walkFields(section.fields, clone, "", fn);
  }
  return clone as T;
}
