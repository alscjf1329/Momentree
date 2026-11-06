import { test, before } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "momentree-auth-"));
process.env.ADMIN_EMAIL = "super@x.com";

let otp: typeof import("@/lib/adminOtp");
let admins: typeof import("@/lib/admins");
let db: typeof import("@/lib/db");
before(async () => {
  otp = await import("@/lib/adminOtp");
  admins = await import("@/lib/admins");
  db = await import("@/lib/db");
});

test("관리자: 슈퍼 관리자는 항상 admin, 추가/삭제/중복 추가 무시", async () => {
  assert.equal(await admins.isAdmin("super@x.com"), true);
  assert.equal(await admins.isAdmin("a@x.com"), false);
  await admins.addAdmin("a@x.com");
  await admins.addAdmin("a@x.com");
  assert.deepEqual(await admins.readAdmins(), ["a@x.com"]);
  assert.equal(await admins.isAdmin("a@x.com"), true);
  await admins.removeAdmin("a@x.com");
  assert.equal(await admins.isAdmin("a@x.com"), false);
});

test("OTP: 발급→검증 성공(일회용), 재요청 쿨다운, 오답 5회 제한, 만료", async () => {
  const S = "secret";
  assert.deepEqual(await otp.verifyOtp("u@x.com", "123456", S), { status: "not_found" });

  await otp.issueOtp("u@x.com", "123456", S, "customer", "u@x.com");
  assert.equal(await otp.isOnCooldown("u@x.com"), true);
  assert.equal(await otp.isOnCooldown("other@x.com"), false);
  assert.deepEqual(await otp.verifyOtp("u@x.com", "123456", S), { status: "ok", role: "customer", file: "u@x.com" });
  assert.deepEqual(await otp.verifyOtp("u@x.com", "123456", S), { status: "not_found" }); // 한 번 쓰면 폐기

  await otp.issueOtp("v@x.com", "111111", S, "admin");
  for (let i = 0; i < 5; i++) assert.deepEqual(await otp.verifyOtp("v@x.com", "000000", S), { status: "invalid" });
  assert.deepEqual(await otp.verifyOtp("v@x.com", "111111", S), { status: "too_many_attempts" }); // 맞는 코드여도 막힘
  assert.deepEqual(await otp.verifyOtp("v@x.com", "111111", S), { status: "not_found" });

  // 재발급하면 시도 횟수가 초기화되고 새 코드로 교체
  await otp.issueOtp("w@x.com", "222222", S, "customer");
  await otp.verifyOtp("w@x.com", "000000", S);
  await otp.issueOtp("w@x.com", "333333", S, "customer");
  assert.deepEqual(await otp.verifyOtp("w@x.com", "222222", S), { status: "invalid" });
  assert.equal((await otp.verifyOtp("w@x.com", "333333", S)).status, "ok");

  // 만료
  await otp.issueOtp("x@x.com", "444444", S, "customer");
  db.getDb().prepare("update otp set issued_at = ? where email = 'x@x.com'").run(Date.now() - otp.OTP_TTL_MS - 1000);
  assert.deepEqual(await otp.verifyOtp("x@x.com", "444444", S), { status: "expired" });
});

test("OTP: 만료된 다른 행은 새 발급 때 정리된다", async () => {
  const d = db.getDb();
  d.prepare("insert into otp (email, code_hash, issued_at, attempts, role) values ('old@x.com', 'h', ?, 0, 'customer')").run(Date.now() - otp.OTP_TTL_MS - 5000);
  await otp.issueOtp("fresh@x.com", "555555", "s", "customer");
  assert.equal(d.prepare("select count(*) from otp where email = 'old@x.com'").pluck().get(), 0);
});
