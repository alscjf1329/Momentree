import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import Database from "better-sqlite3";

// 배포 전 점검 스크립트: 숫자가 맞고, DB 파일을 전혀 바꾸지 않는지 확인
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "momentree-pre-"));
const dbFile = path.join(dir, "momentree.db");
const iso = (months: number) => { const d = new Date(); d.setUTCMonth(d.getUTCMonth() + months); return d.toISOString().slice(0, 10); };

test("predeploy-check: 영향 집계 + DB 불변", () => {
  // v4 상태(plan 컬럼 없음)의 DB: 고객 4명, 예시 응답 2건
  const db = new Database(dbFile);
  db.exec(`create table customers (id integer primary key, file text, wedding_date text, retention_notified_at text);
    create table rsvp_entries (id integer primary key, slug text, name text);
    create table guestbook_entries (id integer primary key, slug text, name text);`);
  const c = db.prepare("insert into customers (file, wedding_date) values (?, ?)");
  c.run("c-old", iso(-14)); c.run("c-hidden", iso(-7)); c.run("c-new", iso(1)); c.run("c-none", "");
  db.prepare("insert into rsvp_entries (slug, name) values (?, 'x')").run("c-old");
  db.prepare("insert into rsvp_entries (slug, name) values (?, 'x')").run("example");
  db.prepare("insert into guestbook_entries (slug, name) values (?, 'x')").run("demo-1");
  db.pragma("user_version = 4");
  db.close();

  const before = fs.readFileSync(dbFile);
  const mtime = fs.statSync(dbFile).mtimeMs;
  const run = (env: Record<string, string>) =>
    spawnSync("node", ["bin/predeploy-check.mjs"], { env: { ...process.env, ENCRYPTION_KEY: "", ADMIN_SESSION_SECRET: "", DATA_DIR: dir, ...env }, encoding: "utf8" });

  const secret = "s".repeat(32);
  const r = run({ ENCRYPTION_KEY: Buffer.alloc(32, 1).toString("base64"), ADMIN_SESSION_SECRET: secret });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /고객 4명/);
  assert.match(r.stdout, /기존 고객 4명이 전원 유료로 이관/);
  assert.match(r.stdout, /이미 지난 2명은 배포 즉시 무료/); // c-old, c-hidden
  assert.match(r.stdout, /읽을 수 없는 고객: 1명/);
  assert.match(r.stdout, /\+12개월 지남: 청첩장 1개, 하객 응답·방명록 1건/);
  assert.match(r.stdout, /\+6개월 지남\(공개 숨김\): 1개/);
  assert.match(r.stdout, /rsvp_entries: 1건/);
  assert.match(r.stdout, /guestbook_entries: 1건/);
  assert.ok(!r.stdout.includes(secret), "비밀 값이 출력되면 안 됩니다");

  assert.equal(run({}).status, 1); // 필수 비밀이 없으면 차단

  assert.ok(before.equals(fs.readFileSync(dbFile)), "DB 내용이 바뀌면 안 됩니다");
  assert.equal(fs.statSync(dbFile).mtimeMs, mtime);
  assert.deepEqual(fs.readdirSync(dir), ["momentree.db"], "-wal/-shm 파일이 생기면 안 됩니다");
});
