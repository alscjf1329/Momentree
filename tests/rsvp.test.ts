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
before(async () => {
  route = await import("@/app/api/rsvp/route"); // DATA_DIR을 읽은 뒤에 로드
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

const guest = (name: string) => ({ slug: "couple", name, attendance: "attending", guests: "1" });

test("제출은 비로그인으로 가능하고 slug 없으면 400", async () => {
  assert.equal((await route.POST(await req("POST", { body: { name: "x" } }))).status, 400);
  assert.equal((await route.POST(await req("POST", { body: guest("하객1") }))).status, 200);
  assert.equal((await route.POST(await req("POST", { body: guest("하객2") }))).status, 200);
  const list = await (await route.GET(await req("GET", { query: "?file=couple" }))).json();
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

  const list = await (await route.GET(await req("GET", { query: "?file=couple" }))).json();
  assert.deepEqual(list.map((e: { name: string }) => e.name), ["하객2"]);
});

test("slug에 경로 순회 문자가 있으면 거부 (다른 데이터 파일 읽기/쓰기 차단)", async () => {
  fs.mkdirSync(path.join(process.env.DATA_DIR!, "clients"), { recursive: true });
  fs.writeFileSync(path.join(process.env.DATA_DIR!, "clients", "secret.json"), JSON.stringify([{ name: "LEAK" }]));

  assert.equal((await route.GET(await req("GET", { query: "?file=../clients/secret" }))).status, 400);
  assert.equal((await route.POST(await req("POST", { body: { ...guest("x"), slug: "../clients/evil" } }))).status, 400);
  assert.equal(fs.existsSync(path.join(process.env.DATA_DIR!, "clients", "evil.json")), false);
  assert.equal((await route.DELETE(await req("DELETE", { query: "?file=../clients/secret&index=0", session: { role: "admin" } }))).status, 400);
});
