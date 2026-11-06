import { test, before } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, createSessionToken } from "@/lib/adminAuth";
import { buildMeta, splitMeta } from "@/lib/clientMeta";
import { WEDDING } from "@/content";
import type { WeddingData } from "@/types";

process.env.ADMIN_SESSION_SECRET = "test-secret";
process.env.ENCRYPTION_KEY = Buffer.alloc(32, 9).toString("base64");
process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "momentree-clients-"));

let route: typeof import("@/app/api/clients/route");
before(async () => {
  route = await import("@/app/api/clients/route");
});

type Sess = { role: "admin" | "customer"; file?: string };
async function req(method: string, session: Sess, opts: { body?: unknown; query?: string } = {}) {
  return new NextRequest("http://localhost/api/clients" + (opts.query ?? ""), {
    method,
    headers: {
      "content-type": "application/json",
      cookie: `${ADMIN_SESSION_COOKIE}=${await createSessionToken("test-secret", session)}`,
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
}
const withNames = (groom: string, bride: string): WeddingData => ({
  ...WEDDING,
  groom: { ...WEDDING.groom, name: groom },
  bride: { ...WEDDING.bride, name: bride },
});
const onDisk = (file: string) => JSON.parse(fs.readFileSync(path.join(process.env.DATA_DIR!, "clients", `${file}.json`), "utf-8"));

test("buildMeta: 표시 이름·예식일 계산, createdAt/owner는 이전 값 유지", () => {
  const t1 = new Date("2026-01-01T00:00:00Z");
  const m1 = buildMeta(withNames("홍길동", "김지수"), undefined, "a@b.com", t1);
  assert.equal(m1.label, "홍길동 ♥ 김지수");
  assert.equal(m1.owner, "a@b.com");
  const m2 = buildMeta(withNames("홍길동", " "), m1, undefined, new Date("2026-02-01T00:00:00Z"));
  assert.equal(m2.label, "홍길동"); // 빈 이름은 건너뜀
  assert.equal(m2.owner, "a@b.com");
  assert.equal(m2.createdAt, m1.createdAt);
  assert.notEqual(m2.updatedAt, m1.updatedAt);
  assert.deepEqual(splitMeta({ a: 1, _meta: m1 }), { data: { a: 1 }, meta: m1 });
});

test("저장 시 서버가 _meta 계산, 클라이언트가 보낸 _meta는 무시, 읽기 응답엔 _meta 없음", async () => {
  const customer: Sess = { role: "customer", file: "me@x.com" };
  const forged = { ...withNames("홍길동", "김지수"), _meta: { owner: "evil@x.com", label: "해킹" } };
  assert.equal((await route.POST(await req("POST", customer, { body: { data: forged } }))).status, 200);

  const saved = onDisk("me@x.com");
  assert.equal(saved._meta.owner, "me@x.com");
  assert.equal(saved._meta.label, "홍길동 ♥ 김지수");

  const got = await (await route.GET(await req("GET", customer, { query: "?file=me@x.com" }))).json();
  assert.equal("_meta" in got, false);

  // 관리자가 대신 저장해도 기존 소유자 유지
  const admin: Sess = { role: "admin" };
  await route.POST(await req("POST", admin, { body: { filename: "me@x.com", data: withNames("홍길동", "이영희") } }));
  assert.equal(onDisk("me@x.com")._meta.owner, "me@x.com");
  assert.equal(onDisk("me@x.com")._meta.label, "홍길동 ♥ 이영희");
});

test("목록(detail): 메타 있는 파일은 표시 이름, 오래된 파일은 빈 label + 수정일 대체, 관리자 파일 파라미터 검증", async () => {
  const dir = path.join(process.env.DATA_DIR!, "clients");
  fs.writeFileSync(path.join(dir, "legacy-file.json"), JSON.stringify(withNames("옛날", "고객")));

  const admin: Sess = { role: "admin" };
  const all: { file: string; label: string; owner: string; updatedAt: string }[] = await (
    await route.GET(await req("GET", admin, { query: "?detail=1" }))
  ).json();
  const me = all.find((c) => c.file === "me@x.com")!;
  const legacy = all.find((c) => c.file === "legacy-file")!;
  assert.equal(me.label, "홍길동 ♥ 이영희");
  assert.equal(me.owner, "me@x.com");
  assert.equal(legacy.label, "");
  assert.ok(legacy.updatedAt); // mtime

  // 관리자 file 파라미터도 경로 순회 차단
  assert.equal((await route.GET(await req("GET", admin, { query: "?file=../otp/x" }))).status, 400);
  assert.equal((await route.DELETE(await req("DELETE", admin, { query: "?file=../otp/x" }))).status, 400);
});
