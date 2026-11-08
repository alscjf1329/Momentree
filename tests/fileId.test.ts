import { test, before } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { NextRequest } from "next/server";

process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "momentree-fid-"));
process.env.ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");
process.env.ADMIN_SESSION_SECRET = "s";

const FORMAT = /^c-\d{6}-[a-z0-9]{6}$/;
let verify: typeof import("@/app/api/admin/auth/verify-code/route");
let store: typeof import("@/lib/customers");
let access: typeof import("@/lib/access");
let otp: typeof import("@/lib/adminOtp");
let nc: typeof import("@/lib/newClient");
let session: typeof import("@/lib/session");
let adminAuth: typeof import("@/lib/adminAuth");

before(async () => {
  verify = await import("@/app/api/admin/auth/verify-code/route");
  store = await import("@/lib/customers");
  access = await import("@/lib/access");
  otp = await import("@/lib/adminOtp");
  nc = await import("@/lib/newClient");
  session = await import("@/lib/session");
  adminAuth = await import("@/lib/adminAuth");
});

// 코드 요청 라우트와 같은 방식(기존/신규 판별 → OTP 발급)으로 로그인하고 세션 파일을 돌려준다
async function login(email: string) {
  await otp.issueOtp(email, "123456", "s", "customer", store.fileForEmail(email) ?? undefined);
  const res = await verify.POST(new NextRequest("http://localhost/x", { method: "POST", body: JSON.stringify({ email, code: "123456" }) }));
  assert.equal(res.status, 200);
  const cookie = res.cookies.get(adminAuth.ADMIN_SESSION_COOKIE)!.value;
  const s = await session.getSession(new NextRequest("http://localhost/x", { headers: { cookie: `${adminAuth.ADMIN_SESSION_COOKIE}=${cookie}` } }));
  return s!.file!;
}

test("신규 가입: c-YYYYMM-난수6 파일 생성 + owner 멤버십, 이메일은 파일명에 없음, 검증 통과", async () => {
  const file = await login("new@x.com");
  assert.match(file, FORMAT);
  assert.ok(!file.includes("new"));
  assert.ok(nc.isValidClientFilename(file));
  assert.ok(store.customerExists(file));
  assert.equal(access.memberRole(file, "new@x.com"), "owner");
  assert.equal(access.filesOf("new@x.com")[0].file, file);
});

test("같은 이메일 재로그인(대소문자 달라도)은 같은 파일, 새 파일 안 만듦", async () => {
  const file = await login("again@x.com");
  assert.equal(await login("again@x.com"), file);
  assert.equal(await login("AGAIN@x.com"), file);
  assert.equal(store.listCustomers("").filter((c) => c.owner.toLowerCase() === "again@x.com").length, 1);
});

test("기존 이메일형 파일 고객 회귀: 파일명 유지, 같은 파일로 로그인", async () => {
  store.saveCustomer("old@x.com", nc.DEFAULT_WEDDING_DATA, "old@x.com");
  assert.equal(await login("old@x.com"), "old@x.com");
  assert.ok(nc.isValidClientFilename("old@x.com"));
});

test("파일명 충돌 시 재시도해 DB에 없는 값을 발급, 계속 충돌하면 실패", () => {
  store.saveCustomer("c-202611-aaaaaa", nc.DEFAULT_WEDDING_DATA, null);
  const seq = ["c-202611-aaaaaa", "c-202611-aaaaaa", "c-202611-bbbbbb"];
  let i = 0;
  assert.equal(store.newCustomerFile(() => seq[i++]), "c-202611-bbbbbb");
  assert.equal(i, 3);
  assert.throws(() => store.newCustomerFile(() => "c-202611-aaaaaa"));
  assert.match(nc.generateFilename(new Date(2026, 10, 8)), /^c-202611-[a-z0-9]{6}$/);
});
