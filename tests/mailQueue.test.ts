import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { enqueueMail, processDue, readMail } from "@/lib/mailQueue";

process.env.ENCRYPTION_KEY ||= crypto.randomBytes(32).toString("base64");
const mk = () => fs.mkdtempSync(path.join(os.tmpdir(), "momentree-mq-"));
const msg = { to: "guest@example.com", subject: "s", html: "<b>code 123456</b>" };
const ids = (dir: string, s: string) => { try { return fs.readdirSync(path.join(dir, s)); } catch { return []; } };
const idOf = (dir: string, s: string) => ids(dir, s)[0].slice(0, -5);

test("접수→발송 성공: sent로 이동, 본문 제거", async () => {
  const dir = mk(); const sent: string[] = [];
  const o = { dir, send: async (to: string) => void sent.push(to) };
  assert.equal(await enqueueMail(msg, { ...o, immediate: true }), true); // 즉시 1회 시도 경로
  assert.deepEqual(sent, ["guest@example.com"]);
  assert.equal(ids(dir, "pending").length, 0);
  const r = readMail(idOf(dir, "sent"), o)!;
  assert.equal(r.status, "sent"); assert.equal(r.attempts, 1); assert.equal(r.payload, undefined);
});

test("접수만(immediate 없음): 워커 틱이 발송한다", async () => {
  const dir = mk(); const sent: string[] = [];
  const o = { dir, send: async (to: string) => void sent.push(to) };
  await enqueueMail(msg, o); // 워커가 비동기로 처리
  await processDue(o); // 워커 틱과 겹쳐도 inflight 가드로 1회만
  await new Promise((r) => setTimeout(r, 50));
  assert.deepEqual(sent, ["guest@example.com"]);
  assert.equal(ids(dir, "sent").length, 1);
});

test("저장된 payload는 암호화되어 평문 이메일·본문이 없다", async () => {
  const dir = mk();
  await enqueueMail(msg, { dir, send: async () => { throw new Error("x"); }, immediate: true, maxAttempts: 3 });
  const raw = fs.readFileSync(path.join(dir, "pending", ids(dir, "pending")[0]), "utf-8");
  assert.ok(!raw.includes("guest@example.com") && !raw.includes("123456"));
});

test("실패 후 지수 백오프 재시도, 성공하면 sent", async () => {
  const dir = mk(); let t = 0, calls = 0;
  const o = { dir, now: () => t, baseDelayMs: 100, send: async () => { if (++calls < 3) throw new Error("smtp down"); } };
  assert.equal(await enqueueMail(msg, { ...o, immediate: true }), false); // 1차 실패
  const id = idOf(dir, "pending");
  assert.equal(readMail(id, o)!.nextAt, 100);
  assert.equal(await processDue(o), 0); // 기한 전
  t = 100; await processDue(o); // 2차 실패 → 다음은 +200
  assert.equal(readMail(id, o)!.nextAt, 300);
  t = 300; await processDue(o); // 3차 성공
  assert.equal(readMail(id, o)!.status, "sent");
  assert.equal(calls, 3);
});

test("최대 횟수 초과 시 failed, lastError에 수신자 없음", async () => {
  const dir = mk(); let t = 0;
  const o = { dir, now: () => t, baseDelayMs: 1, send: async () => { throw new Error("rejected guest@example.com"); } };
  await enqueueMail(msg, { ...o, immediate: true, maxAttempts: 2 });
  t = 10; await processDue(o);
  assert.equal(ids(dir, "pending").length, 0);
  const r = readMail(idOf(dir, "failed"), o)!;
  assert.equal(r.status, "failed"); assert.equal(r.attempts, 2);
  assert.ok(!r.lastError!.includes("guest@"));
});
