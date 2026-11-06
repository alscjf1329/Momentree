import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { openDb, migrate } from "@/lib/db";

test("스키마 생성 + 재실행해도 안전(버전 기록), 파일 DB는 WAL", () => {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "momentree-db-")), "sub", "t.db");
  const db = openDb(file); // 폴더도 만들어진다
  const v = db.pragma("user_version", { simple: true });
  assert.ok((v as number) >= 1);
  migrate(db); // 이미 적용된 버전은 건너뜀
  assert.equal(db.pragma("user_version", { simple: true }), v);
  assert.equal(db.pragma("journal_mode", { simple: true }), "wal");

  const tables = db.prepare("select name from sqlite_master where type='table'").pluck().all();
  for (const t of ["customers", "admins", "otp", "rsvp_entries", "guestbook_entries"]) assert.ok(tables.includes(t), t);

  const now = new Date().toISOString();
  const insert = db.prepare("insert into customers (file, email, share_id, data_enc, created_at, updated_at) values (?,?,?,?,?,?)");
  insert.run("a@x.com", "a@x.com", "s1", "x", now, now);
  assert.throws(() => insert.run("a@x.com", "b@x.com", "s2", "x", now, now), /UNIQUE/); // file 고유
  assert.throws(() => insert.run("b", "a@x.com", "s3", "x", now, now), /UNIQUE/); // 이메일 고유
  insert.run("c1", null, "s4", "x", now, now); // 관리자가 만든 고객: 이메일 없음, 여러 명 가능
  insert.run("c2", null, "s5", "x", now, now);
  db.close();
});
