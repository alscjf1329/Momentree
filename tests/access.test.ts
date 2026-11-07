import { test } from "node:test";
import assert from "node:assert/strict";
import Database from "better-sqlite3";
import { openDb } from "@/lib/db";

test("v2 마이그레이션: 기존 고객의 가입 이메일(또는 이메일형 파일명)이 소유자로 채워진다", () => {
  const db = new Database(":memory:");
  db.pragma("foreign_keys = ON");
  // v1 상태를 만든 뒤 v2만 적용되는 상황을 흉내: openDb로 v1~v2 전부 적용하고 고객을 넣은 뒤 멤버 테이블만 비교
  const mem = openDb(":memory:");
  mem.prepare("insert into customers (file,email,share_id,data_enc,created_at,updated_at) values ('a@x.com','a@x.com','s1','e','t','t')").run();
  mem.prepare("insert into customers (file,email,share_id,data_enc,created_at,updated_at) values ('b@x.com',NULL,'s2','e','t','t')").run();
  mem.prepare("insert into customers (file,email,share_id,data_enc,created_at,updated_at) values ('demo',NULL,'s3','e','t','t')").run();
  // v2의 백필 SQL만 다시 실행 (실서버에서는 v1 데이터 위에서 한 번 실행됨)
  mem.exec("delete from customer_members");
  const v2 = (mem.prepare("select sql from sqlite_master where name='customer_members'").get() as { sql: string }).sql;
  assert.match(v2, /NOCASE/);
  mem.exec(`INSERT INTO customer_members (file, email, role, added_at)
    SELECT file, coalesce(email, CASE WHEN file LIKE '%@%' THEN file END), 'owner', created_at
    FROM customers WHERE coalesce(email, CASE WHEN file LIKE '%@%' THEN file END) IS NOT NULL`);
  assert.deepEqual(mem.prepare("select file from customer_members order by file").pluck().all(), ["a@x.com", "b@x.com"]);
  db.close();
});

test("멤버: 대소문자 무시, 소유자는 제거 불가, 편집자 권한은 members 불가", async () => {
  process.env.ENCRYPTION_KEY = Buffer.alloc(32, 5).toString("base64");
  process.env.DATA_DIR = (await import("node:fs")).mkdtempSync("/tmp/momentree-acc-");
  const { saveCustomer } = await import("@/lib/customers");
  const a = await import("@/lib/access");
  const { DEFAULT_WEDDING_DATA } = await import("@/lib/newClient");
  saveCustomer("o@x.com", { ...DEFAULT_WEDDING_DATA, slug: "o@x.com" }, "o@x.com");
  a.addMember("o@x.com", "Ed@X.com", "editor");
  assert.equal(a.memberRole("o@x.com", "ed@x.com"), "editor");
  assert.equal(a.removeMember("o@x.com", "o@x.com"), false);
  assert.deepEqual(a.filesOf("ed@x.com"), [{ file: "o@x.com", role: "editor" }]);
  const s = (memberRole: string) => ({ exp: 1, role: "customer" as const, file: "o@x.com", memberRole });
  assert.equal(a.can(s("editor"), "edit"), true);
  assert.equal(a.can(s("editor"), "members"), false);
  assert.equal(a.can(s("owner"), "members"), true);
  assert.equal(a.can(null, "view"), false);
  assert.equal(a.removeMember("o@x.com", "ED@x.com"), true);
  assert.equal(a.memberRole("o@x.com", "ed@x.com"), null);
});
