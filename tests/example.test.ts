import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, createSessionToken } from "@/lib/adminAuth";

process.env.ADMIN_SESSION_SECRET = "test-secret";
process.env.ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");
process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "momentree-example-"));

const admin = async () => `${ADMIN_SESSION_COOKIE}=${await createSessionToken("test-secret", { role: "admin" })}`;
const post = async (route: string, body: unknown) =>
  new NextRequest(`http://localhost/api/${route}`, { method: "POST", body: JSON.stringify(body), headers: { "content-type": "application/json" } });

test("ensureExampleCustomer: 없으면 만들고(paid·share_id=example), 있으면 덮어쓰지 않는다", async () => {
  const { ensureExampleCustomer } = await import("@/lib/exampleCustomer");
  const { getCustomer, getShareId, getPlan, listCustomers, saveCustomer } = await import("@/lib/customers");
  const { EXAMPLE } = await import("@/example");
  assert.equal(ensureExampleCustomer(), true);
  assert.equal(getCustomer("example")!.groom.name, EXAMPLE.groom.name);
  assert.equal(getShareId("example"), "example");
  assert.equal(getPlan("example"), "paid");
  assert.equal(listCustomers("example")[0].label, "한도윤 ♥ 윤하린");
  saveCustomer("example", { ...getCustomer("example")!, mainTitle: "운영자가 고침" });
  assert.equal(ensureExampleCustomer(), false);
  assert.equal(getCustomer("example")!.mainTitle, "운영자가 고침");
  assert.equal(getShareId("example"), "example");
});

test("example 은 예식일+3개월이 지나도 강등되지 않고 워터마크가 없다", async () => {
  const { effectivePlan, getPlan } = await import("@/lib/customers");
  const { hasWatermark } = await import("@/lib/plan");
  const late = new Date("2099-01-01");
  assert.equal(effectivePlan({ file: "example", plan: "paid", wedding_date: "2027-05-22" }, late), "paid");
  assert.equal(effectivePlan({ file: "c-1", plan: "paid", wedding_date: "2027-05-22" }, late), "free"); // 일반 고객은 강등
  assert.equal(getPlan("example", late), "paid");
  assert.equal(hasWatermark(getPlan("example", late)!), false);
});

test("example 로 RSVP·방명록 POST 는 403 (공유 ID 경유 포함)", async () => {
  const rsvp = await import("@/app/api/rsvp/route");
  const gb = await import("@/app/api/guestbook/route");
  const r = await rsvp.POST(await post("rsvp", { slug: "example", name: "a", attendance: "yes", guests: 1 }));
  assert.equal(r.status, 403);
  const g = await gb.POST(await post("guestbook", { slug: "example", name: "a", message: "hi" }));
  assert.equal(g.status, 403);
});

test("example 삭제는 400, deleteCustomer 도 거부", async () => {
  const { DELETE } = await import("@/app/api/clients/route");
  const { customerExists, deleteCustomer } = await import("@/lib/customers");
  const res = await DELETE(new NextRequest("http://localhost/api/clients?file=example", { method: "DELETE", headers: { cookie: await admin() } }));
  assert.equal(res.status, 400);
  assert.equal(deleteCustomer("example"), false);
  assert.ok(customerExists("example"));
});

test("retention: example 은 안내 메일·삭제 대상이 되지 않는다(소유자 없음, 응답 행 없음)", async () => {
  const { runRetention } = await import("@/lib/retention");
  const sent: unknown[] = [];
  const out = await runRetention(new Date("2099-01-01"), (async (m: unknown) => { sent.push(m); }) as never);
  assert.deepEqual(out.notified, []);
  assert.deepEqual(out.purged, []);
  assert.equal(sent.length, 0);
});

test("AI 문구는 example·demo 경로에서만, 랜딩 링크는 id=example 이고 없으면 demo- 로 대체", async () => {
  const { exampleHref, EXAMPLE_AI_NOTE } = await import("@/lib/exampleInfo");
  assert.equal(exampleHref("mono", true), "/invite/mono?id=example");
  assert.equal(exampleHref("mono", false), "/invite/demo-mono");
  const page = fs.readFileSync("src/app/invite/[slug]/page.tsx", "utf8");
  assert.match(page, /aiNote = file === EXAMPLE_FILE/);
  assert.match(page, /aiNote = slug\.startsWith\("demo-"\)/);
  const ctx = fs.readFileSync("src/context/WeddingContext.tsx", "utf8");
  assert.match(ctx, /aiNote && /);
  assert.ok(EXAMPLE_AI_NOTE);
  for (const f of ["src/app/page.tsx", "src/components/DemoPhone.tsx"]) {
    const s = fs.readFileSync(f, "utf8");
    assert.match(s, /exampleHref\(/);
    assert.doesNotMatch(s, /\/invite\/demo-\$/);
  }
  assert.match(fs.readFileSync("src/instrumentation.ts", "utf8"), /ensureExampleCustomer/);
});
