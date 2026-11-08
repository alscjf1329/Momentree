import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { DATA_DIR } from "@/lib/paths";
import { importLegacyJson } from "@/lib/legacyImport";
import { encrypt } from "@/lib/accountCrypto";

// 서버 전용. 단일 파일 DB(DATA_DIR/momentree.db) — 컨테이너 1개 전제.
// ponytail: 인스턴스가 여러 개가 되면 Postgres로 이전 (쿼리는 표준 SQL 위주로 유지).

// 스키마 변경은 배열 끝에 추가만 한다 (이미 적용된 항목은 수정 금지). 적용 버전은 PRAGMA user_version에 기록.
const MIGRATIONS: (string | ((db: Database.Database) => void))[] = [
  `
  -- file: 기존 파일명(가입 이메일 또는 관리자가 정한 슬러그). 세션·링크가 이 값을 쓰므로 키로 유지한다.
  CREATE TABLE customers (
    id           INTEGER PRIMARY KEY,
    file         TEXT NOT NULL UNIQUE,
    email        TEXT UNIQUE,                -- 가입 이메일 (관리자가 만든 고객은 NULL)
    share_id     TEXT NOT NULL UNIQUE,       -- 공개 링크용 ID
    label        TEXT NOT NULL DEFAULT '',   -- "홍길동 ♥ 김지수" (청첩장에 공개되는 값이라 평문)
    wedding_date TEXT NOT NULL DEFAULT '',
    template     TEXT NOT NULL DEFAULT 'classic',
    data_enc     TEXT NOT NULL,              -- 청첩장 데이터 전체(JSON)를 통째로 암호화한 값
    created_at   TEXT NOT NULL,
    updated_at   TEXT NOT NULL
  );
  CREATE TABLE admins (email TEXT PRIMARY KEY);
  CREATE TABLE otp (
    email     TEXT PRIMARY KEY,
    code_hash TEXT NOT NULL,
    issued_at INTEGER NOT NULL,
    attempts  INTEGER NOT NULL DEFAULT 0,
    role      TEXT NOT NULL,
    file      TEXT
  );
  -- slug: 고객 file 키 또는 데모 슬러그(demo-*)라 customers에 외래키를 걸지 않는다
  CREATE TABLE rsvp_entries (
    id             INTEGER PRIMARY KEY,
    slug           TEXT NOT NULL,
    name           TEXT NOT NULL,
    side           TEXT,
    attendance     TEXT NOT NULL,
    guests         TEXT NOT NULL DEFAULT '',
    companion_name TEXT,
    message        TEXT,
    submitted_at   TEXT NOT NULL
  );
  CREATE INDEX rsvp_entries_slug ON rsvp_entries(slug, id);
  CREATE TABLE guestbook_entries (
    id           INTEGER PRIMARY KEY,
    slug         TEXT NOT NULL,
    name         TEXT NOT NULL,
    message      TEXT NOT NULL,
    submitted_at TEXT NOT NULL
  );
  CREATE INDEX guestbook_entries_slug ON guestbook_entries(slug, id);
  `,
  // v2: 청첩장별 멤버 (여러 명이 함께 편집). role은 TEXT라 새 역할은 코드(access.ts)만 고치면 된다.
  `
  CREATE TABLE customer_members (
    file     TEXT NOT NULL REFERENCES customers(file) ON DELETE CASCADE ON UPDATE CASCADE,
    email    TEXT NOT NULL COLLATE NOCASE, -- 로그인 때 대소문자가 달라도 같은 사람
    role     TEXT NOT NULL,
    added_at TEXT NOT NULL,
    PRIMARY KEY (file, email)
  );
  CREATE INDEX customer_members_email ON customer_members(email);
  INSERT INTO customer_members (file, email, role, added_at)
    SELECT file, coalesce(email, CASE WHEN file LIKE '%@%' THEN file END), 'owner', created_at
    FROM customers WHERE coalesce(email, CASE WHEN file LIKE '%@%' THEN file END) IS NOT NULL;
  `,
  // v3: 하객 RSVP·방명록 개인정보 암호화. 이미 암호화된 값(enc:v1:)은 건너뛰므로 다시 돌려도 안전.
  (db) => {
    const plain = (v: string | null): v is string => !!v && !v.startsWith("enc:v1:");
    const e = (v: string | null) => (plain(v) ? encrypt(v) : v);
    const upR = db.prepare("update rsvp_entries set name=?, guests=?, companion_name=?, message=? where id=?");
    for (const r of db.prepare("select id, name, guests, companion_name, message from rsvp_entries").all() as
      { id: number; name: string; guests: string; companion_name: string | null; message: string | null }[])
      if ([r.name, r.guests, r.companion_name, r.message].some(plain)) upR.run(e(r.name), e(r.guests), e(r.companion_name), e(r.message), r.id);
    const upG = db.prepare("update guestbook_entries set name=?, message=? where id=?");
    for (const r of db.prepare("select id, name, message from guestbook_entries").all() as { id: number; name: string; message: string }[])
      if (plain(r.name) || plain(r.message)) upG.run(e(r.name), e(r.message), r.id);
  },
];

export function migrate(db: Database.Database): void {
  const current = db.pragma("user_version", { simple: true }) as number;
  for (let v = current; v < MIGRATIONS.length; v++) {
    db.transaction(() => {
      const m = MIGRATIONS[v];
      if (typeof m === "string") db.exec(m);
      else m(db);
      db.pragma(`user_version = ${v + 1}`);
    })();
  }
}

// legacyDir: 파일(JSON) 저장소가 있던 폴더 — DB를 처음 만드는 순간 한 번만 그 내용을 가져온다
export function openDb(file: string, legacyDir?: string): Database.Database {
  if (file !== ":memory:") fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new Database(file);
  db.pragma("journal_mode = WAL"); // 읽기와 쓰기가 서로 막지 않게
  db.pragma("busy_timeout = 5000");
  db.pragma("foreign_keys = ON");
  const fresh = (db.pragma("user_version", { simple: true }) as number) === 0;
  migrate(db);
  if (fresh && legacyDir) {
    const r = db.transaction(() => importLegacyJson(db, legacyDir))();
    console.log(`[db] 기존 JSON 가져오기: 고객 ${r.customers}, RSVP ${r.rsvp}, 방명록 ${r.guestbook}, 관리자 ${r.admins}` +
      (r.skipped.length ? `, 건너뜀 ${r.skipped.join(", ")}` : ""));
  }
  return db;
}

// 개발 서버의 HMR이 모듈을 다시 불러와도 연결을 하나만 유지
const g = globalThis as unknown as { __momentreeDb?: Database.Database };

export function getDb(): Database.Database {
  return (g.__momentreeDb ??= openDb(path.join(DATA_DIR, "momentree.db"), DATA_DIR));
}
