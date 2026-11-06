import { test, before } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, createSessionToken } from "@/lib/adminAuth";

process.env.ADMIN_SESSION_SECRET = "test-secret";
process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "momentree-test-"));

let route: typeof import("@/app/api/rsvp/route");
let share: typeof import("@/lib/shareId");
let shareId: string; // 청첩장 "couple"의 공개 ID — 하객(비로그인)은 파일명 대신 이걸로 접근한다
before(async () => {
  // DATA_DIR을 읽은 뒤에 로드
  route = await import("@/app/api/rsvp/route");
  share = await import("@/lib/shareId");
  shareId = await share.getOrCreateShareId("couple");
});

const url = "http://localhost/api/rsvp";
async function req(method: string, opts: { body?: unknown; query?: string; session?: { role: "admin" | "customer"; file?: string } } = {}) {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (opts.session) {
    headers.cookie = `${ADMIN_SESSION_COOKIE}=${await createSessionToken("test-secret", opts.session)}`;
  }
  return new NextRequest(url + (opts.query ?? ""), {
    method,
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
}

const guest = (name: string) => ({ slug: shareId, name, attendance: "attending", guests: "1" });

test("제출은 비로그인으로 가능하고 slug 없으면 400", async () => {
  assert.equal((await route.POST(await req("POST", { body: { name: "x" } }))).status, 400);
  assert.equal((await route.POST(await req("POST", { body: guest("하객1") }))).status, 200);
  assert.equal((await route.POST(await req("POST", { body: guest("하객2") }))).status, 200);
  const list = await (await route.GET(await req("GET", { query: `?file=${shareId}` }))).json();
  assert.deepEqual(list.map((e: { name: string }) => e.name), ["하객1", "하객2"]);
});

test("수정/삭제: 비로그인·남의 파일 401, 본인 파일·관리자는 허용", async () => {
  const patch = (session?: { role: "admin" | "customer"; file?: string }) =>
    req("PATCH", { body: { slug: "couple", index: 0, name: "수정됨" }, session });

  assert.equal((await route.PATCH(await patch())).status, 401);
  assert.equal((await route.PATCH(await patch({ role: "customer", file: "other" }))).status, 401);
  assert.equal((await route.PATCH(await patch({ role: "customer", file: "couple" }))).status, 200);
  assert.equal((await route.PATCH(await patch({ role: "admin", file: "admin@x.com" }))).status, 200);
  assert.equal((await route.PATCH(await req("PATCH", { body: { slug: "couple", index: 99 }, session: { role: "admin" } }))).status, 404);

  const del = (session?: { role: "admin" | "customer"; file?: string }) =>
    req("DELETE", { query: "?file=couple&index=0", session });
  assert.equal((await route.DELETE(await del())).status, 401);
  assert.equal((await route.DELETE(await del({ role: "customer", file: "other" }))).status, 401);
  assert.equal((await route.DELETE(await del({ role: "customer", file: "couple" }))).status, 200);

  const list = await (await route.GET(await req("GET", { query: `?file=${shareId}` }))).json();
  assert.deepEqual(list.map((e: { name: string }) => e.name), ["하객2"]);
});

test("slug에 경로 순회 문자가 있으면 거부 (다른 데이터 파일 읽기/쓰기 차단)", async () => {
  fs.mkdirSync(path.join(process.env.DATA_DIR!, "clients"), { recursive: true });
  fs.writeFileSync(path.join(process.env.DATA_DIR!, "clients", "secret.json"), JSON.stringify([{ name: "LEAK" }]));

  assert.equal((await route.GET(await req("GET", { query: "?file=../clients/secret" }))).status, 404);
  assert.equal((await route.POST(await req("POST", { body: { ...guest("x"), slug: "../clients/evil" } }))).status, 400);
  assert.equal(fs.existsSync(path.join(process.env.DATA_DIR!, "clients", "evil.json")), false);
  assert.equal((await route.DELETE(await req("DELETE", { query: "?file=../clients/secret&index=0", session: { role: "admin" } }))).status, 400);
});

test("공유 ID: 발급은 멱등, 파일명(이메일)으로는 비로그인 접근 불가, 목록은 관리자만", async () => {
  assert.equal(await share.getOrCreateShareId("couple"), shareId);
  assert.notEqual(await share.getOrCreateShareId("other@x.com"), shareId);
  assert.equal(await share.resolveShareId(shareId), "couple");
  assert.equal(await share.resolveShareId("nope"), null);
  assert.equal(await share.resolveShareId("__proto__"), null);

  // 비로그인이 파일명으로 읽기/쓰기 → 거부 (이메일을 알아도 하객 응답에 접근 불가)
  assert.equal((await route.GET(await req("GET", { query: "?file=couple" }))).status, 404);
  assert.equal((await route.POST(await req("POST", { body: { ...guest("x"), slug: "couple" } }))).status, 400);
  // 본인·관리자는 파일명도 허용, 남의 파일명은 거부
  assert.equal((await route.GET(await req("GET", { query: "?file=couple", session: { role: "customer", file: "couple" } }))).status, 200);
  assert.equal((await route.GET(await req("GET", { query: "?file=couple", session: { role: "customer", file: "other@x.com" } }))).status, 404);
  assert.equal((await route.GET(await req("GET", { query: "?file=couple", session: { role: "admin" } }))).status, 200);
  // 데모 슬러그는 공유 ID 없이도 동작
  assert.equal((await route.POST(await req("POST", { body: { ...guest("x"), slug: "demo-classic" } }))).status, 200);

  // 전체 목록(파일명=이메일 포함)은 관리자 전용
  assert.equal((await route.GET(await req("GET"))).status, 401);
  assert.equal((await route.GET(await req("GET", { session: { role: "customer", file: "couple" } }))).status, 401);
  const list = await (await route.GET(await req("GET", { session: { role: "admin" } }))).json();
  assert.ok(Array.isArray(list) && list.includes("couple"));
});
