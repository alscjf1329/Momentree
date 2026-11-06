import crypto from "crypto";

// 공개 링크용 짧은 랜덤 ID (8자, URL 안전)
export function newShareId(): string {
  return crypto.randomBytes(6).toString("base64url");
}
