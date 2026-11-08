import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Database from "better-sqlite3";

process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "momentree-ret-"));
process.env.ENCRYPTION_KEY = Buffer.alloc(32, 6).toString("base64");

const D = (s: string) => new Date(s);

test("retentionPhase 경계값 + 예식일 없음/파싱 불가는 active", async () => {
  const { retentionPhase, noticeAt, purgeAt } = await import("@/lib/retention");
  assert.equal(retentionPhase("2025-10-18", D("2026-04-17T23:59:59Z")), "active");
  assert.equal(retentionPhase("2025-10-18", D("2026-04-18T00:00:00Z")), "hidden"); // +6개월 정각
  assert.equal(retentionPhase("2025-10-18", D("2026-10-17T23:59:59Z")), "hidden");
  assert.equal(retentionPhase("2025-10-18", D("2026-10-18T00:00:00Z")), "purge"); // +12개월 정각
  for (const bad of ["", "abc", null, undefined]) assert.equal(retentionPhase(bad, D("2099-01-01")), "active");
  assert.equal(purgeAt("2025-10-18"), Date.parse("2026-10-18"));
  assert.equal(noticeAt("2025-10-18"), Date.parse("2026-09-18")); // 30일 전
  assert.equal(noticeAt("x"), null);
});

test("runRetention: 비공개·삭제·예고 메일 1회·다른 고객 보존", async () => {
  const { saveCustomer, getCustomer, customerExists } = await import("@/lib/customers");
  const { addRsvp, addGuestbook, listRsvp, listGuestbook } = await import("@/lib/entries");
  const { runRetention, isGuestDataHidden } = await import("@/lib/retention");
  const { WEDDING } = await import("@/content");
  const at = (iso: string) => ({ ...WEDDING, date: { ...WEDDING.date, iso } });
  saveCustomer("old@x.com", at("2025-10-18"), "old@x.com");
  saveCustomer("new@x.com", at("2026-06-01"), "new@x.com");
  saveCustomer("nodate@x.com", at(""), "nodate@x.com");
  for (const f of ["old@x.com", "new@x.com", "nodate@x.com"]) { addRsvp(f, { name: "하객" }); addGuestbook(f, "하객", "축하"); }

  const sent: { to: string }[] = [];
  const enqueue = async (m: { to: string }) => { sent.push(m); return true; };

  // 예식 후 약 11개월: 예고만, 삭제 없음
  let r = await runRetention(D("2026-09-20T00:00:00Z"), enqueue as never);
  assert.deepEqual(r, { purged: [], notified: ["old@x.com"] });
  assert.equal(listRsvp("old@x.com").length, 1);
  assert.equal(isGuestDataHidden("old@x.com", D("2026-09-20")), true);
  assert.equal(isGuestDataHidden("new@x.com", D("2026-09-20")), false);

  // 다시 돌려도 중복 발송 없음
  await runRetention(D("2026-09-21T00:00:00Z"), enqueue as never);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].to, "old@x.com");

  // 12개월 후: 하객 행만 삭제, 고객·다른 고객 데이터는 보존
  r = await runRetention(D("2026-10-19T00:00:00Z"), enqueue as never);
  assert.deepEqual(r.purged, ["old@x.com"]);
  assert.equal(listRsvp("old@x.com").length + listGuestbook("old@x.com").length, 0);
  assert.equal(customerExists("old@x.com"), true);
  assert.ok(getCustomer("old@x.com"));
  assert.equal(listRsvp("new@x.com").length, 1);
  assert.equal(listGuestbook("nodate@x.com").length, 1);
  assert.equal(sent.length, 1);
});

test("CSV: BOM·수식 인젝션 방지·따옴표 이스케이프", async () => {
  const { toCsv, csvCell } = await import("@/lib/guestCsv");
  const csv = toCsv([["이름", "메시지"], ["=cmd()", '쉼표,"따옴표"'], ["+1", "@x"], ["-1", "a\nb"]]);
  assert.ok(csv.startsWith("﻿"));
  assert.equal(csvCell("=1+1"), "'=1+1");
  for (const c of ["+", "-", "@"]) assert.equal(csvCell(c + "x"), "'" + c + "x");
  assert.ok(csv.includes('"쉼표,""따옴표"""'));
  assert.ok(csv.includes("'=cmd()") && csv.includes("'+1") && csv.includes("'-1"));
});

test("마이그레이션 v4: retention_notified_at 컬럼 추가, 기존 데이터 유지", async () => {
  const { migrate } = await import("@/lib/db");
  const db = new Database(":memory:");
  migrate(db);
  const cols = (db.pragma("table_info(customers)") as { name: string }[]).map((c) => c.name);
  assert.ok(cols.includes("retention_notified_at"));
  migrate(db); // 재실행 안전
});

test("공개 방명록 조회: 비공개 단계면 빈 목록, active면 노출", async () => {
  const { NextRequest } = await import("next/server");
  const { saveCustomer, getShareId } = await import("@/lib/customers");
  const { addGuestbook } = await import("@/lib/entries");
  const { GET } = await import("@/app/api/guestbook/route");
  const { WEDDING } = await import("@/content");
  const at = (iso: string) => ({ ...WEDDING, date: { ...WEDDING.date, iso } });
  saveCustomer("hid@x.com", at("2020-01-01"), "hid@x.com");
  saveCustomer("act@x.com", at("2099-01-01"), "act@x.com");
  for (const f of ["hid@x.com", "act@x.com"]) addGuestbook(f, "하객", "축하");
  const get = async (f: string) => (await GET(new NextRequest(`http://localhost/api/guestbook?file=${getShareId(f)}`))).json();
  assert.equal((await get("hid@x.com")).length, 0);
  assert.equal((await get("act@x.com")).length, 1);
});
