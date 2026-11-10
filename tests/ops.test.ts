import { test, before } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, createSessionToken } from "@/lib/adminAuth";
import { WEDDING } from "@/content";
import { notifyOperator, notifyOnce, ERROR_DEDUP_MS } from "@/lib/notify";

process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "momentree-ops-"));

const calls: { url: string; body: { chat_id: string; text: string } }[] = [];
const fakeFetch = (async (url: string, init: RequestInit) => {
  calls.push({ url, body: JSON.parse(init.body as string) });
  return new Response("{}", { status: 200 });
}) as unknown as typeof fetch;
const setEnv = (on: boolean) => {
  if (on) { process.env.TELEGRAM_BOT_TOKEN = "SECRET-TOKEN"; process.env.TELEGRAM_CHAT_ID = "42"; }
  else { delete process.env.TELEGRAM_BOT_TOKEN; delete process.env.TELEGRAM_CHAT_ID; }
};

test("notify: 환경변수 없으면 no-op", async () => {
  setEnv(false); calls.length = 0;
  assert.equal(await notifyOperator("hi", fakeFetch), false);
  assert.equal(calls.length, 0);
});

test("notify: 4096자로 자르고 plain text, 실패는 삼키며 토큰을 로그에 안 남김", async () => {
  setEnv(true); calls.length = 0;
  assert.equal(await notifyOperator("가".repeat(5000), fakeFetch), true);
  assert.equal(calls[0].body.text.length, 4096);
  assert.ok(!("parse_mode" in calls[0].body));
  const logs: string[] = [];
  const orig = console.error; console.error = (...a) => void logs.push(a.join(" "));
  const boom = (async (url: string) => { throw new Error(`fail ${url}`); }) as unknown as typeof fetch;
  try { assert.equal(await notifyOperator("x", boom), false); } finally { console.error = orig; }
  assert.ok(logs.length > 0 && logs.every((l) => !l.includes("SECRET-TOKEN")));
});

test("notifyOnce: 같은 메시지는 10분에 1번", async () => {
  setEnv(true); calls.length = 0;
  assert.equal(await notifyOnce("[오류] /a / boom", 1000, fakeFetch), true);
  assert.equal(await notifyOnce("[오류] /a / boom", 1000 + ERROR_DEDUP_MS - 1, fakeFetch), false);
  assert.equal(await notifyOnce("[오류] /b / boom", 1000, fakeFetch), true); // 다른 메시지
  assert.equal(await notifyOnce("[오류] /a / boom", 1000 + ERROR_DEDUP_MS, fakeFetch), true);
  assert.equal(calls.length, 3);
});

let contact: typeof import("@/app/api/contact/route");
let health: typeof import("@/app/api/health/route");
before(async () => {
  contact = await import("@/app/api/contact/route");
  health = await import("@/app/api/health/route");
});

process.env.ADMIN_SESSION_SECRET = "ops-secret";
process.env.ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");

// 세션 쿠키로 문의를 보낸다. session이 null이면 비로그인.
const post = async (body: unknown, session: { role: "admin" | "customer"; file?: string; email?: string } | null) =>
  contact.POST(new NextRequest("http://x/api/contact", {
    method: "POST",
    headers: session ? { cookie: `${ADMIN_SESSION_COOKIE}=${await createSessionToken("ops-secret", session)}` } : {},
    body: JSON.stringify(body),
  }));
let userN = 0;
// 고객 세션은 DB 멤버십을 확인하므로 실제 고객을 만들어 둔다.
const newCustomer = async () => {
  const email = `u${++userN}@x.com`;
  (await import("@/lib/customers")).saveCustomer(email, WEDDING, email);
  return { role: "customer" as const, file: email, email };
};
const withFetch = async (fn: () => Promise<void>) => {
  setEnv(true); calls.length = 0;
  const realFetch = globalThis.fetch; globalThis.fetch = fakeFetch;
  try { await fn(); } finally { globalThis.fetch = realFetch; }
};

test("contact: 세션 없으면 401", async () => {
  setEnv(true);
  assert.equal((await post({ message: "hi" }, null)).status, 401);
});

test("contact: 텔레그램 미설정이면 503(성공한 척 안 함)", async () => {
  setEnv(false);
  assert.equal((await post({ message: "hi" }, await newCustomer())).status, 503);
});

test("contact: 고객 세션의 이메일·파일이 알림에 들어가고 본문 이메일은 무시", async () => {
  const me = await newCustomer();
  await withFetch(async () => {
    assert.equal((await post({ message: "문의합니다", email: "evil@x.com", file: "other" }, me)).status, 200);
    assert.equal(calls.length, 1);
    const t = calls[0].body.text;
    assert.ok(t.startsWith("[문의]") && t.includes(me.email) && t.includes(`청첩장: ${me.file}`) && t.includes("문의합니다"));
    assert.ok(!t.includes("evil@x.com") && !t.includes("other"));
  });
});

test("contact: 관리자 세션은 관리자로 표시", async () => {
  await withFetch(async () => {
    assert.equal((await post({ message: "x" }, { role: "admin", file: "ad@x.com" })).status, 200);
    assert.ok(calls[0].body.text.includes("[관리자] ad@x.com"));
  });
});

test("contact: 길이 제한·허니팟", async () => {
  const me = await newCustomer();
  await withFetch(async () => {
    assert.equal((await post({ message: "  " }, me)).status, 400);
    assert.equal((await post({ message: "a".repeat(1001) }, me)).status, 400);
    assert.equal(calls.length, 0);
    assert.equal((await post({ message: "x", website: "http://spam" }, me)).status, 200); // 전달 안 함
    assert.equal(calls.length, 0);
  });
});

test("contact: 로그인 사용자당 분당 3회 제한", async () => {
  const me = await newCustomer();
  await withFetch(async () => {
    const codes = [];
    for (let i = 0; i < 4; i++) codes.push((await post({ message: "x" }, me)).status);
    assert.deepEqual(codes, [200, 200, 200, 429]);
  });
});

test("contact: 문의 내용은 DB·데이터 폴더에 저장되지 않음", async () => {
  const me = await newCustomer();
  const secret = "SECRET-INQUIRY-내용-12345";
  await withFetch(async () => { assert.equal((await post({ message: secret }, me)).status, 200); });
  (await import("@/lib/db")).getDb().pragma("wal_checkpoint(TRUNCATE)");
  const walk = (d: string): string[] => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
  for (const f of walk(process.env.DATA_DIR!)) assert.ok(!fs.readFileSync(f).includes(secret), f);
});

test("카카오 채널 환경변수·SupportLink 참조가 src에 남지 않음, /faq는 로그인 안내", () => {
  const walk = (d: string): string[] => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
  for (const f of walk("src")) {
    const t = fs.readFileSync(f, "utf8");
    assert.ok(!/KAKAO_CHANNEL|SupportLink|lib\/support/.test(t), f);
  }
  const faq = fs.readFileSync("src/app/faq/page.tsx", "utf8");
  assert.match(faq, /href="\/admin\/login"/);
  assert.match(faq, /<details/);
  assert.match(faq, /19,900원/);
  assert.match(fs.readFileSync("src/app/page.tsx", "utf8"), /href="\/faq"/);
});

test("health: ok:true, 민감정보 없음", async () => {
  const res = await health.GET();
  assert.equal(res.status, 200);
  const j = await res.json();
  assert.equal(j.ok, true);
  assert.ok(!JSON.stringify(j).includes(process.env.DATA_DIR!));
});
