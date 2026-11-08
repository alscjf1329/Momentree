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
let guestbook: typeof import("@/app/api/guestbook/route");
let shareId: string; // 청첩장 "couple"의 공개 ID — 하객(비로그인)은 파일명 대신 이걸로 접근한다
let otherShareId: string;
before(async () => {
  // DATA_DIR을 읽은 뒤에 로드
  process.env.ENCRYPTION_KEY = Buffer.alloc(32, 3).toString("base64");
  route = await import("@/app/api/rsvp/route");
  guestbook = await import("@/app/api/guestbook/route");
  const store = await import("@/lib/customers");
  const { WEDDING: W } = await import("@/content");
  const WEDDING = { ...W, date: { ...W.date, iso: "2099-01-01" } }; // 보관 기간(비공개·삭제)에 걸리지 않게 먼 미래 예식일
  store.saveCustomer("couple", WEDDING, null);
  (await import("@/lib/access")).addMember("couple", "couple", "owner"); // 테스트 세션은 file==이메일
  store.saveCustomer("other@x.com", WEDDING, "other@x.com");
  shareId = store.getShareId("couple")!;
  otherShareId = store.getShareId("other@x.com")!;
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

const ids = async () => (await (await route.GET(await req("GET", { query: `?file=${shareId}` }))).json()).map((e: { id: number }) => e.id);

test("수정/삭제(항목 id 기준): 비로그인·남의 파일 401, 본인 파일·관리자는 허용, 다른 고객 항목은 건드릴 수 없음", async () => {
  const [first, second] = await ids();
  const patch = (session?: { role: "admin" | "customer"; file?: string }, extra: object = {}) =>
    req("PATCH", { body: { slug: "couple", id: first, name: "수정됨", ...extra }, session });

  assert.equal((await route.PATCH(await patch())).status, 401);
  assert.equal((await route.PATCH(await patch({ role: "customer", file: "other" }))).status, 401);
  assert.equal((await route.PATCH(await patch({ role: "customer", file: "couple" }))).status, 200);
  assert.equal((await route.PATCH(await patch({ role: "admin", file: "admin@x.com" }, { companionName: "동반인" }))).status, 200);
  assert.equal((await route.PATCH(await req("PATCH", { body: { slug: "couple", id: 99999 }, session: { role: "admin" } }))).status, 404);
  // 허용되지 않은 필드(제출 시각, slug)는 무시
  assert.equal((await route.PATCH(await patch({ role: "admin" }, { submittedAt: "2000-01-01", slug2: "x" }))).status, 200);

  const mine = await (await route.GET(await req("GET", { query: `?file=${shareId}` }))).json();
  assert.equal(mine[0].name, "수정됨");
  assert.equal(mine[0].companionName, "동반인");
  assert.notEqual(mine[0].submittedAt, "2000-01-01");

  // 다른 고객(other@x.com)의 항목 id로 couple 슬러그를 통해 수정/삭제 시도 → 404 (slug가 일치해야 함)
  await route.POST(await req("POST", { body: { slug: otherShareId, name: "남의 하객", attendance: "attending", guests: "1" } }));
  const otherId = (await (await route.GET(await req("GET", { query: "?file=other@x.com", session: { role: "admin" } }))).json())[0].id;
  assert.equal((await route.PATCH(await req("PATCH", { body: { slug: "couple", id: otherId, name: "침입" }, session: { role: "admin" } }))).status, 404);
  assert.equal((await route.DELETE(await req("DELETE", { query: `?file=couple&id=${otherId}`, session: { role: "admin" } }))).status, 404);

  const del = (session?: { role: "admin" | "customer"; file?: string }) =>
    req("DELETE", { query: `?file=couple&id=${first}`, session });
  assert.equal((await route.DELETE(await del())).status, 401);
  assert.equal((await route.DELETE(await del({ role: "customer", file: "other" }))).status, 401);
  assert.equal((await route.DELETE(await del({ role: "customer", file: "couple" }))).status, 200);
  assert.equal((await route.DELETE(await del({ role: "customer", file: "couple" }))).status, 404); // 이미 삭제됨

  // 위치(index)가 아니라 id로 지우므로, 앞 항목이 지워져도 다른 항목은 그대로
  assert.deepEqual(await ids(), [second]);
});

test("slug에 경로 순회 문자가 있으면 거부 (다른 데이터 파일 읽기/쓰기 차단)", async () => {
  fs.mkdirSync(path.join(process.env.DATA_DIR!, "clients"), { recursive: true });
  fs.writeFileSync(path.join(process.env.DATA_DIR!, "clients", "secret.json"), JSON.stringify([{ name: "LEAK" }]));
  const gb = (q: string) => guestbook.GET(new NextRequest("http://localhost/api/guestbook" + q));

  assert.equal((await route.GET(await req("GET", { query: "?file=../clients/secret" }))).status, 404);
  assert.equal((await route.POST(await req("POST", { body: { ...guest("x"), slug: "../clients/evil" } }))).status, 400);
  assert.equal(fs.existsSync(path.join(process.env.DATA_DIR!, "clients", "evil.json")), false);
  assert.equal((await gb("?file=../clients/secret")).status, 400);
  assert.equal((await route.DELETE(await req("DELETE", { query: "?file=../clients/secret&id=1", session: { role: "admin" } }))).status, 400);
});

test("공유 ID: 파일명(이메일)으로는 비로그인 접근 불가, 목록은 관리자만", async () => {
  const { resolveShareId } = await import("@/lib/shareId");
  assert.notEqual(otherShareId, shareId);
  assert.equal(resolveShareId(shareId), "couple");
  assert.equal(resolveShareId("nope"), null);
  assert.equal(resolveShareId("__proto__"), null);

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

test("방명록: 공유 ID로 작성/조회, 파일명으로는 비로그인 거부, 항목 id로 삭제(권한 필요)", async () => {
  const g = (method: string, opts: { body?: unknown; query?: string; session?: { role: "admin" | "customer"; file?: string } } = {}) =>
    req(method, opts).then((r) => new NextRequest("http://localhost/api/guestbook" + (opts.query ?? ""), { method, headers: r.headers, body: r.body ? JSON.stringify(opts.body) : undefined }));
  assert.equal((await guestbook.POST(await g("POST", { body: { slug: shareId, name: "지인", message: "축하해요" } }))).status, 200);
  assert.equal((await guestbook.POST(await g("POST", { body: { slug: "couple", name: "지인", message: "x" } }))).status, 400);
  assert.equal((await guestbook.POST(await g("POST", { body: { slug: shareId, name: "", message: "x" } }))).status, 400);

  const list = await (await guestbook.GET(await g("GET", { query: `?file=${shareId}` }))).json();
  assert.deepEqual(list.map((m: { message: string }) => m.message), ["축하해요"]);
  assert.equal((await guestbook.GET(await g("GET", { query: "?file=couple" }))).status, 400);

  const id = list[0].id;
  assert.equal((await guestbook.DELETE(await g("DELETE", { query: `?file=couple&id=${id}` }))).status, 401);
  assert.equal((await guestbook.DELETE(await g("DELETE", { query: `?file=couple&id=${id}`, session: { role: "customer", file: "other" } }))).status, 401);
  assert.equal((await guestbook.DELETE(await g("DELETE", { query: `?file=couple&id=${id}`, session: { role: "customer", file: "couple" } }))).status, 200);
  assert.deepEqual(await (await guestbook.GET(await g("GET", { query: `?file=${shareId}` }))).json(), []);
});
