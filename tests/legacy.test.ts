import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { openDb } from "@/lib/db";
import { importLegacyJson } from "@/lib/legacyImport";
import { applyToEncryptedFields, encrypt } from "@/lib/accountCrypto";
import { getSchemaForTemplate } from "@/lib/templateSchemas";
import { WEDDING } from "@/content";

process.env.ENCRYPTION_KEY = Buffer.alloc(32, 5).toString("base64");

function legacyDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "momentree-legacy-"));
  for (const d of ["clients", "rsvp", "guestbook"]) fs.mkdirSync(path.join(dir, d));
  const w = { ...WEDDING, template: "garden", groom: { ...WEDDING.groom, name: "홍길동", accounts: [{ name: "a", bank: "국민", number: "111-222", holder: "홍" }] } };
  // 예전 방식: 계좌 필드만 암호화 + _meta
  const stored = applyToEncryptedFields(w, getSchemaForTemplate("garden"), encrypt);
  fs.writeFileSync(path.join(dir, "clients", "me@x.com.json"), JSON.stringify({ ...stored, _meta: { owner: "me@x.com", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-02-02T00:00:00.000Z" } }));
  fs.writeFileSync(path.join(dir, "clients", "g0-36d.json"), JSON.stringify(w)); // 이메일 없는 관리자 생성 고객, _meta 없음
  fs.writeFileSync(path.join(dir, "clients", "empty.json"), "{}"); // template 없는 파일은 청첩장 데이터가 아니므로 건너뜀
  fs.writeFileSync(path.join(dir, "clients", "broken.json"), "{not json");
  fs.writeFileSync(path.join(dir, "rsvp", "me@x.com.json"), JSON.stringify([
    { name: "하객1", side: "groom", attendance: "attending", guests: "2", companionName: "동반", message: "축하", submittedAt: "2026-03-01T00:00:00.000Z" },
    { name: "하객2", attendance: "not_attending", guests: "1" },
  ]));
  fs.writeFileSync(path.join(dir, "guestbook", "me@x.com.json"), JSON.stringify([{ name: "누구", message: "행복하세요", submittedAt: "2026-03-02T00:00:00.000Z" }]));
  fs.writeFileSync(path.join(dir, "admins.json"), JSON.stringify(["boss@x.com"]));
  fs.writeFileSync(path.join(dir, "share-index.json"), JSON.stringify({ abc12345: "me@x.com" }));
  return dir;
}

test("기존 JSON 가져오기: 고객(계좌 복호화 후 통째 암호화)·공유 ID 유지·RSVP·방명록·관리자, 원본은 그대로", () => {
  const dir = legacyDir();
  const db = openDb(path.join(dir, "momentree.db"), dir); // 처음 만들 때 자동 실행
  const q = <T>(sql: string, ...p: unknown[]) => db.prepare(sql).all(...p) as T[];

  const c = q<Record<string, string>>("select * from customers order by file");
  assert.deepEqual(c.map((r) => r.file), ["g0-36d", "me@x.com"]); // 깨진 파일은 건너뜀
  const me = c.find((r) => r.file === "me@x.com")!;
  assert.equal(me.email, "me@x.com");
  assert.equal(me.share_id, "abc12345"); // 이미 나간 ?id= 링크 유지
  assert.equal(me.label, "홍길동 ♥ " + WEDDING.bride.name); // 신부 이름은 샘플 기본값
  assert.equal(me.created_at, "2026-01-01T00:00:00.000Z");
  assert.equal(c.find((r) => r.file === "g0-36d")!.email, null);
  assert.ok(me.data_enc.startsWith("enc:v1:") && !me.data_enc.includes("111-222"));

  const rsvp = q<Record<string, string>>("select * from rsvp_entries order by id");
  assert.deepEqual(rsvp.map((r) => r.name), ["하객1", "하객2"]);
  assert.equal(rsvp[0].companion_name, "동반");
  assert.equal(q("select * from guestbook_entries").length, 1);
  assert.deepEqual(q<{ email: string }>("select email from admins").map((r) => r.email), ["boss@x.com"]);

  // 원본 파일은 그대로
  assert.ok(fs.existsSync(path.join(dir, "clients", "me@x.com.json")));
  assert.ok(fs.existsSync(path.join(dir, "rsvp", "me@x.com.json")));

  // 다시 실행해도 중복되지 않음 (멱등)
  const again = importLegacyJson(db, dir);
  assert.deepEqual([again.customers, again.rsvp, again.guestbook, again.admins], [0, 0, 0, 0]);
  assert.equal(q("select * from rsvp_entries").length, 2);
  db.close();
});

test("DB가 이미 있으면(재시작) 다시 가져오지 않는다", () => {
  const dir = legacyDir();
  const file = path.join(dir, "momentree.db");
  openDb(file, dir).close();
  fs.writeFileSync(path.join(dir, "clients", "late.json"), JSON.stringify(WEDDING)); // 이후에 생긴 파일
  const db = openDb(file, dir);
  assert.equal(db.prepare("select count(*) from customers where file='late'").pluck().get(), 0);
  db.close();
});
