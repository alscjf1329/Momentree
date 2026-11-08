import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Database from "better-sqlite3";
import { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, createSessionToken } from "@/lib/adminAuth";
import { WEDDING } from "@/content";
import type { WeddingData } from "@/types";
import { planOf, canUseTemplate, photoLimit, rsvpLimit, hasWatermark, canInviteMembers, FREE_TEMPLATES } from "@/lib/plan";

process.env.ADMIN_SESSION_SECRET = "test-secret";
process.env.ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");
process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "momentree-plan-"));

type Sess = { role: "admin" | "customer"; file?: string; email?: string };
const call = async (method: string, route: string, session: Sess | null, body?: unknown, query = "") =>
  new NextRequest(`http://localhost/api/${route}${query}`, {
    method, body: body ? JSON.stringify(body) : undefined,
    headers: { "content-type": "application/json", ...(session ? { cookie: `${ADMIN_SESSION_COOKIE}=${await createSessionToken("test-secret", session)}` } : {}) },
  });
const photos = (n: number) => Array.from({ length: n }, (_, i) => ({ src: `/p${i}.jpg`, alt: "" }));
const wedding = (over: Partial<WeddingData> = {}): WeddingData => ({ ...WEDDING, template: "classic", gallery: photos(5), ...over });

test("마이그레이션 v5: 기존 고객은 paid, 이후 신규는 free, 다시 돌려도 그대로", async () => {
  const { migrate } = await import("@/lib/db"); // 정적 import는 DATA_DIR 설정보다 먼저 평가돼 실제 data/를 건드린다
  const db = new Database(":memory:");
  migrate(db);
  db.pragma("user_version = 4"); // plan 컬럼이 생기기 전 상태로 되돌린다
  db.exec("ALTER TABLE customers DROP COLUMN plan");
  const now = "t";
  const ins = db.prepare("insert into customers (file,email,share_id,data_enc,created_at,updated_at) values (?,?,?,?,?,?)");
  ins.run("old", null, "s1", "x", now, now);
  migrate(db);
  const plan = (f: string) => db.prepare("select plan from customers where file=?").pluck().get(f);
  assert.equal(plan("old"), "paid");
  ins.run("new", null, "s2", "x", now, now);
  assert.equal(plan("new"), "free");
  db.pragma("user_version = 4"); // 컬럼이 이미 있는 채로 재실행해도 새 고객을 paid로 덮지 않는다
  migrate(db);
  assert.equal(plan("new"), "free");
  assert.equal(plan("old"), "paid");
});

test("plan 순수 함수", () => {
  assert.equal(planOf({ plan: "paid" }), "paid");
  assert.equal(planOf({ plan: "x" }), "free");
  assert.equal(planOf(null), "free");
  for (const t of FREE_TEMPLATES) assert.ok(canUseTemplate("free", t));
  assert.ok(!canUseTemplate("free", "luxury"));
  assert.ok(canUseTemplate("paid", "luxury"));
  assert.deepEqual([photoLimit("free"), rsvpLimit("free"), hasWatermark("free"), canInviteMembers("free")], [5, 30, true, false]);
  assert.deepEqual([photoLimit("paid"), rsvpLimit("paid"), hasWatermark("paid"), canInviteMembers("paid")], [Infinity, Infinity, false, true]);
});

test("서버 강제: 템플릿·사진·멤버 초대·RSVP (무료 제한, 유료·관리자 우회)", async () => {
  const clients = await import("@/app/api/clients/route");
  const members = await import("@/app/api/members/route");
  const rsvp = await import("@/app/api/rsvp/route");
  const store = await import("@/lib/customers");
  const access = await import("@/lib/access");

  store.saveCustomer("free@x.com", wedding(), "free@x.com");
  assert.equal(store.getPlan("free@x.com"), "free"); // 신규 기본값
  const me: Sess = { role: "customer", file: "free@x.com", email: "free@x.com" };
  const admin: Sess = { role: "admin", email: "a@x.com" };
  const save = async (s: Sess, data: WeddingData) => (await clients.POST(await call("POST", "clients", s, { filename: "free@x.com", data }))).status;

  // 템플릿
  assert.equal(await save(me, wedding({ template: "romantic" })), 200);
  const r = await clients.POST(await call("POST", "clients", me, { data: wedding({ template: "luxury" }) }));
  assert.equal(r.status, 403);
  assert.match((await r.json()).error, /유료/);
  assert.equal(store.getCustomer("free@x.com")!.template, "romantic");
  // 사진: 5장 OK, 6장 거부
  assert.equal(await save(me, wedding({ gallery: photos(6) })), 403);
  assert.equal(await save(me, wedding({ gallery: photos(5) })), 200);
  // 멤버 초대
  const inv = await members.POST(await call("POST", "members", me, { email: "b@x.com" }));
  assert.equal(inv.status, 403);
  assert.match((await inv.json()).error, /유료/);
  // RSVP: 30건까지 접수, 31번째 거부, 기존 응답 수정은 허용
  const sid = store.getShareId("free@x.com")!;
  const guest = async (n: number, s: Sess | null = null) => (await rsvp.POST(await call("POST", "rsvp", s, { slug: sid, name: `하객${n}`, attendance: "attending", guests: "1" })));
  for (let i = 1; i <= 30; i++) assert.equal((await guest(i)).status, 200);
  const full = await guest(31);
  assert.equal(full.status, 403);
  assert.match((await full.json()).error, /마감/);
  const [first] = (await (await rsvp.GET(await call("GET", "rsvp", me, undefined, `?file=${sid}`))).json()) as { id: number }[];
  assert.equal((await rsvp.PATCH(await call("PATCH", "rsvp", me, { slug: "free@x.com", id: first.id, name: "수정" }))).status, 200);
  assert.equal((await guest(32, admin)).status, 200); // 관리자 대행은 제한 없음

  // 관리자 우회 (대행 편집)
  assert.equal(await save(admin, wedding({ template: "luxury", gallery: photos(9) })), 200);
  assert.equal((await members.POST(await call("POST", "members", admin, { email: "b@x.com", file: "free@x.com" }))).status, 200);

  // 관리자만 플랜 전환 → 유료가 되면 제한 해제
  const plan = (s: Sess | null, p: string) => call("POST", "plan", s, { file: "free@x.com", plan: p });
  const planRoute = await import("@/app/api/plan/route");
  assert.equal((await planRoute.POST(await plan(me, "paid"))).status, 401);
  assert.equal((await planRoute.POST(await plan(admin, "paid"))).status, 200);
  assert.equal(store.getPlan("free@x.com"), "paid");
  assert.equal(await save(me, wedding({ template: "luxury", gallery: photos(9) })), 200);
  assert.equal((await guest(33)).status, 200);
  assert.equal((await members.POST(await call("POST", "members", me, { email: "c@x.com" }))).status, 200);
  assert.ok(access.listMembers("free@x.com").length >= 3);
});

test("워터마크: 무료 고객 청첩장만 (공통부 한 곳)", async () => {
  const { hasWatermark: hw } = await import("@/lib/plan");
  const store = await import("@/lib/customers");
  store.saveCustomer("wm@x.com", wedding(), "wm@x.com");
  assert.ok(hw(store.getPlan("wm@x.com")!));
  store.setPlan("wm@x.com", "paid");
  assert.ok(!hw(store.getPlan("wm@x.com")!));
  assert.equal(store.getPlan("demo-classic"), null); // 데모(고객 아님)는 제한·워터마크 대상이 아니다
  const ctx = fs.readFileSync("src/context/WeddingContext.tsx", "utf8");
  assert.match(ctx, /watermark &&/); // 템플릿 10개가 아니라 Provider 한 곳에서 렌더
});

