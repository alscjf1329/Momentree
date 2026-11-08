import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Database from "better-sqlite3";

process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "momentree-priv-"));
process.env.ENCRYPTION_KEY = Buffer.alloc(32, 5).toString("base64");

test("RSVP·방명록: DB 원본에 평문 없음 + 복호화 왕복 + 고객 삭제 시 연쇄 삭제", async () => {
  const { getDb } = await import("@/lib/db");
  const { addRsvp, listRsvp, updateRsvp, addGuestbook, listGuestbook } = await import("@/lib/entries");
  const { saveCustomer, deleteCustomer } = await import("@/lib/customers");
  const { WEDDING } = await import("@/content");
  saveCustomer("c1", WEDDING, null);
  saveCustomer("c2", WEDDING, null);

  addRsvp("c1", { name: "김하객", attendance: "attending", guests: "3", companionName: "박동반", message: "축하해요", side: "groom" });
  addRsvp("c2", { name: "남의하객", attendance: "attending" });
  addGuestbook("c1", "이방명", "행복하세요");
  updateRsvp("c1", listRsvp("c1")[0].id, { message: "수정된메시지" });

  const raw = JSON.stringify([
    ...getDb().prepare("select * from rsvp_entries").all(),
    ...getDb().prepare("select * from guestbook_entries").all(),
  ]);
  for (const s of ["김하객", "박동반", "수정된메시지", "이방명", "행복하세요"]) assert.ok(!raw.includes(s), s);
  const [r] = listRsvp("c1");
  assert.deepEqual([r.name, r.guests, r.companionName, r.message, r.side], ["김하객", "3", "박동반", "수정된메시지", "groom"]);
  assert.deepEqual(listGuestbook("c1").map((g) => [g.name, g.message]), [["이방명", "행복하세요"]]);

  assert.ok(deleteCustomer("c1"));
  assert.equal(listRsvp("c1").length + listGuestbook("c1").length, 0);
  assert.equal(listRsvp("c2").length, 1); // 다른 고객 데이터는 유지
});

test("마이그레이션 v3: 평문 행 암호화, 재실행·이미 암호화된 행은 그대로(멱등)", async () => {
  const { migrate } = await import("@/lib/db");
  const { encrypt } = await import("@/lib/accountCrypto");
  const db = new Database(":memory:");
  migrate(db);
  db.pragma("user_version = 2"); // v3 이전 상태로 되돌려 평문 행을 직접 넣는다
  const sealed = encrypt("이미암호화");
  db.prepare("insert into rsvp_entries (slug,name,attendance,guests,companion_name,message,submitted_at) values ('s','평문이름','attending','2',NULL,'평문메시지','t')").run();
  db.prepare("insert into rsvp_entries (slug,name,attendance,guests,submitted_at) values ('s',?, 'attending','', 't')").run(sealed);
  db.prepare("insert into guestbook_entries (slug,name,message,submitted_at) values ('s','평문방명','평문글','t')").run();

  migrate(db);
  const snap = () => JSON.stringify([db.prepare("select * from rsvp_entries").all(), db.prepare("select * from guestbook_entries").all()]);
  const after = snap();
  for (const s of ["평문이름", "평문메시지", "평문방명", "평문글"]) assert.ok(!after.includes(s), s);
  assert.ok(after.includes(sealed)); // 이미 암호화된 값은 다시 암호화하지 않음
  assert.equal(db.pragma("user_version", { simple: true }), 4);

  db.pragma("user_version = 2");
  migrate(db); // 재실행해도 변화 없음
  assert.equal(snap(), after);
});
