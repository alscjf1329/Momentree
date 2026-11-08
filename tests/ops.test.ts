import { test, before } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { NextRequest } from "next/server";
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

let ipN = 0;
const post = (body: unknown, ip = `10.0.0.${++ipN}`) =>
  contact.POST(new NextRequest("http://x/api/contact", { method: "POST", headers: { "x-forwarded-for": ip }, body: JSON.stringify(body) }));
const valid = { name: "민철", email: "a@b.co", message: "문의합니다" };

test("contact: 텔레그램 미설정이면 503(성공한 척 안 함)", async () => {
  setEnv(false);
  assert.equal((await post(valid)).status, 503);
});

test("contact: 검증·허니팟·전달", async () => {
  setEnv(true);
  const realFetch = globalThis.fetch; globalThis.fetch = fakeFetch; calls.length = 0;
  try {
    assert.equal((await post({ ...valid, email: "nope" })).status, 400);
    assert.equal((await post({ ...valid, message: "" })).status, 400);
    assert.equal((await post({ ...valid, message: "a".repeat(1001) })).status, 400);
    assert.equal(calls.length, 0);
    assert.equal((await post({ ...valid, website: "http://spam" })).status, 200); // 허니팟: 전달 안 함
    assert.equal(calls.length, 0);
    assert.equal((await post(valid)).status, 200);
    assert.equal(calls.length, 1);
    assert.ok(calls[0].body.text.startsWith("[문의]") && calls[0].body.text.includes("a@b.co") && calls[0].body.text.includes("문의합니다"));
  } finally { globalThis.fetch = realFetch; }
});

test("contact: IP당 분당 3회 제한", async () => {
  setEnv(true);
  const realFetch = globalThis.fetch; globalThis.fetch = fakeFetch;
  try {
    const codes = [];
    for (let i = 0; i < 4; i++) codes.push((await post(valid, "9.9.9.9")).status);
    assert.deepEqual(codes, [200, 200, 200, 429]);
  } finally { globalThis.fetch = realFetch; }
});

test("health: ok:true, 민감정보 없음", async () => {
  const res = await health.GET();
  assert.equal(res.status, 200);
  const j = await res.json();
  assert.equal(j.ok, true);
  assert.ok(!JSON.stringify(j).includes(process.env.DATA_DIR!));
});
