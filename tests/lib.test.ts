import { test } from "node:test";
import assert from "node:assert/strict";
import { createSessionToken, verifySessionToken } from "@/lib/adminAuth";
import { encrypt, decrypt, applyToEncryptedFields } from "@/lib/accountCrypto";
import { isRateLimited } from "@/lib/rateLimit";
import { withFileLock } from "@/lib/fileLock";

process.env.ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");

test("세션 토큰: 발급/검증, 변조·만료·다른 secret 거부", async () => {
  const token = await createSessionToken("s1", { role: "customer", file: "a@b.com" });
  assert.deepEqual(
    (({ role, file }) => ({ role, file }))((await verifySessionToken(token, "s1"))!),
    { role: "customer", file: "a@b.com" }
  );
  assert.equal(await verifySessionToken(token, "other"), null);
  assert.equal(await verifySessionToken(undefined, "s1"), null);

  // payload만 admin으로 바꿔치기 → 서명 불일치
  const [, sig] = token.split(".");
  const forged = Buffer.from(JSON.stringify({ exp: Date.now() + 1e6, role: "admin" })).toString("base64url");
  assert.equal(await verifySessionToken(`${forged}.${sig}`, "s1"), null);

  const realNow = Date.now;
  Date.now = () => realNow() + 8 * 24 * 3600 * 1000;
  try {
    assert.equal(await verifySessionToken(token, "s1"), null);
  } finally {
    Date.now = realNow;
  }
});

test("계좌 암호화: 왕복, 평문 레거시 통과, 변조 시 원문 반환(복호화 안 됨)", () => {
  const enc = encrypt("110-123-456789");
  assert.notEqual(enc, "110-123-456789");
  assert.equal(decrypt(enc), "110-123-456789");
  assert.equal(decrypt("110-123-456789"), "110-123-456789"); // 암호화 이전 데이터
  assert.equal(encrypt(""), "");
  assert.equal(decrypt(enc.slice(0, -3) + "AAA"), enc.slice(0, -3) + "AAA"); // 태그 검증 실패
});

test("applyToEncryptedFields: 중첩 array-object 안의 encrypted-text만 변환", () => {
  const schema = {
    name: "t",
    sections: [
      {
        title: "계좌",
        fields: [
          {
            key: "groom.accounts",
            type: "array-object" as const,
            label: "계좌",
            itemFields: [
              { key: "bank", type: "text" as const, label: "은행" },
              { key: "number", type: "encrypted-text" as const, label: "번호" },
            ],
          },
        ],
      },
    ],
  };
  const data = { groom: { accounts: [{ bank: "국민", number: "111" }, { bank: "신한", number: "222" }] } };
  const enc = applyToEncryptedFields(data, schema, encrypt);
  assert.equal(enc.groom.accounts[0].bank, "국민");
  assert.ok(enc.groom.accounts[1].number.startsWith("enc:v1:"));
  assert.deepEqual(applyToEncryptedFields(enc, schema, decrypt), data);
  assert.equal(data.groom.accounts[0].number, "111"); // 원본 불변
});

test("rate limit: 한도 초과 차단, 윈도우 지나면 해제, 키별 독립", () => {
  const t = 1_000_000;
  assert.equal(isRateLimited("k", 2, 1000, t), false);
  assert.equal(isRateLimited("k", 2, 1000, t + 1), false);
  assert.equal(isRateLimited("k", 2, 1000, t + 2), true);
  assert.equal(isRateLimited("other", 2, 1000, t + 2), false);
  assert.equal(isRateLimited("k", 2, 1000, t + 1001), false);
});

test("fileLock: 같은 key의 read-modify-write가 직렬화되어 갱신 유실이 없다", async () => {
  let value = 0;
  await Promise.all(
    Array.from({ length: 20 }, () =>
      withFileLock("k", async () => {
        const v = value;
        await new Promise((r) => setTimeout(r, 1));
        value = v + 1;
      })
    )
  );
  assert.equal(value, 20);
});

test("템플릿별 스키마: 쓰지 않는 필드는 숨기고 쓰는 필드는 유지", async () => {
  const { getSchemaForTemplate } = await import("@/lib/templateSchemas");
  const keys = (t: string) => new Set(getSchemaForTemplate(t).sections.flatMap((s) => s.fields.map((f) => f.key)));

  const garden = keys("garden");
  for (const k of ["mainTitle", "subInfo", "rsvpMessage", "rsvpPopupDelaySec", "info", "bgm.src", "gallery"]) assert.ok(garden.has(k), `garden: ${k}`);
  assert.ok(!garden.has("envelopeClosed")); // garden엔 봉투 UI 없음

  const classic = keys("classic");
  for (const k of ["envelopeClosed", "envelopeOpen", "gallery", "introBg", "groom.nameFull"]) assert.ok(classic.has(k), `classic: ${k}`);
  for (const k of ["mainTitle", "subInfo", "rsvpMessage", "rsvpPopupDelaySec", "info", "bgm.src"]) assert.ok(!classic.has(k), `classic: ${k}`);

  assert.ok(keys("blossom").has("gallery") && !keys("blossom").has("envelopeClosed"));
  assert.ok(!keys("minimal").has("gallery") && keys("minimal").has("groom.nameFull"));
  assert.ok(!keys("editorial").has("groom.nameFull"));
  // 모든 템플릿에 필수 공통 필드는 남는다
  for (const t of ["classic", "editorial", "minimal", "romantic", "twilight", "blossom", "modern", "luxury", "garden", "mono"]) {
    assert.ok(keys(t).has("groom.name") && keys(t).has("date") && keys(t).has("venue.name"), t);
  }
});
