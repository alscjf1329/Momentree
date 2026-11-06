import { test, before } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, createSessionToken } from "@/lib/adminAuth";
import { WEDDING } from "@/content";
import type { WeddingData } from "@/types";

process.env.ADMIN_SESSION_SECRET = "test-secret";
process.env.ENCRYPTION_KEY = Buffer.alloc(32, 9).toString("base64");
process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "momentree-clients-"));

let route: typeof import("@/app/api/clients/route");
let store: typeof import("@/lib/customers");
let db: typeof import("@/lib/db");
before(async () => {
  route = await import("@/app/api/clients/route");
  store = await import("@/lib/customers");
  db = await import("@/lib/db");
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
const wedding = (groom: string, bride: string, iso = "2026-10-18"): WeddingData => ({
  ...WEDDING,
  groom: { ...WEDDING.groom, name: groom, accounts: [{ name: "신랑", bank: "국민", number: "110-123-456789", holder: groom }] },
  bride: { ...WEDDING.bride, name: bride },
  date: { ...WEDDING.date, iso },
});
const raw = (file: string) => db.getDb().prepare("select * from customers where file = ?").get(file) as Record<string, string>;

test("저장/조회 왕복: 계좌 포함 전체가 복원되고, DB에는 통째로 암호화돼 저장", () => {
  const data = wedding("홍길동", "김지수");
  store.saveCustomer("me@x.com", data, "me@x.com");
  assert.deepEqual(store.getCustomer("me@x.com")!.groom.accounts, data.groom.accounts);

  const row = raw("me@x.com");
  assert.ok(row.data_enc.startsWith("enc:v1:"));
  for (const secret of ["110-123-456789", "홍길동", "greeting", WEDDING.greeting[0]]) assert.equal(row.data_enc.includes(secret), false, secret);
  assert.equal(row.label, "홍길동 ♥ 김지수"); // 검색용 컬럼은 평문
  assert.equal(row.wedding_date, "2026-10-18");
  assert.equal(row.email, "me@x.com");
  assert.equal(store.getCustomer("none"), null);
});

test("소유자 이메일은 처음 만들 때만 기록, 다시 저장해도 공유 ID·생성일 유지", () => {
  const before = raw("me@x.com");
  store.saveCustomer("me@x.com", wedding("홍길동", "이영희"), null); // 관리자가 대신 저장
  const after = raw("me@x.com");
  assert.equal(after.email, "me@x.com");
  assert.equal(after.share_id, before.share_id);
  assert.equal(after.created_at, before.created_at);
  assert.equal(after.label, "홍길동 ♥ 이영희");
  assert.equal(store.fileByShareId(before.share_id), "me@x.com");
});

test("목록 검색: 이메일·이름·예식일·파일명, 특수문자는 문자 그대로, 최근 수정 순", () => {
  store.saveCustomer("g0-36d", wedding("관리자", "생성", "2027-03-01"), null);
  const files = (q: string) => store.listCustomers(q).map((c) => c.file);
  assert.deepEqual(files("").sort(), ["g0-36d", "me@x.com"]);
  assert.deepEqual(files("me@x"), ["me@x.com"]);
  assert.deepEqual(files("이영희"), ["me@x.com"]);
  assert.deepEqual(files("2027-03"), ["g0-36d"]);
  assert.deepEqual(files("36d"), ["g0-36d"]);
  assert.deepEqual(files("%"), []); // LIKE 와일드카드로 해석되지 않음
  assert.equal(store.listCustomers("me@x")[0].owner, "me@x.com");
  assert.equal(store.listCustomers("36d")[0].owner, ""); // 이메일 없는 고객
});

test("API: 고객 본인 저장 시 소유자 기록, 응답에 소유자·내부 컬럼 없음, 관리자 목록 검색, 경로 순회 차단", async () => {
  const customer: Sess = { role: "customer", file: "new@x.com" };
  assert.equal((await route.POST(await req("POST", customer, { body: { data: wedding("가", "나") } }))).status, 200);
  assert.equal(raw("new@x.com").email, "new@x.com");

  const got = await (await route.GET(await req("GET", customer))).json();
  assert.equal(got.groom.name, "가");
  assert.equal(JSON.stringify(got).includes("new@x.com"), false);

  const admin: Sess = { role: "admin" };
  const list = await (await route.GET(await req("GET", admin, { query: "?detail=1&q=new@" }))).json();
  assert.deepEqual(list.map((c: { file: string }) => c.file), ["new@x.com"]);
  assert.deepEqual(await (await route.GET(await req("GET", admin))).json(), store.listCustomers().map((c) => c.file));

  assert.equal((await route.GET(await req("GET", admin, { query: "?file=../otp/x" }))).status, 400);
  assert.equal((await route.DELETE(await req("DELETE", admin, { query: "?file=../otp/x" }))).status, 400);
  assert.equal((await route.DELETE(await req("DELETE", customer, { query: "?file=new@x.com" }))).status, 401); // 삭제는 관리자만
  assert.equal((await route.DELETE(await req("DELETE", admin, { query: "?file=new@x.com" }))).status, 200);
  assert.equal(store.customerExists("new@x.com"), false);
});
