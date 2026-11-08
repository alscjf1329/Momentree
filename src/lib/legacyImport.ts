import fs from "fs";
import path from "path";
import type Database from "better-sqlite3";
import type { WeddingData } from "@/types";
import { applyToEncryptedFields, decrypt, encrypt } from "@/lib/accountCrypto";
import { getSchemaForTemplate } from "@/lib/templateSchemas";
import { isValidClientFilename, isValidLoginEmail } from "@/lib/newClient";
import { newShareId } from "@/lib/newShareId";

// 파일(JSON) 저장소 → DB 일회성 가져오기. DB를 처음 만들 때 한 번 실행된다.
// 원본 파일은 건드리지 않고 그대로 남겨 둔다 (문제 시 되돌리거나 백업으로 쓸 수 있게).
// 이미 있는 항목은 건너뛰므로(INSERT OR IGNORE) 여러 번 실행해도 안전하다.

export interface ImportResult {
  customers: number;
  rsvp: number;
  guestbook: number;
  admins: number;
  skipped: string[];
}

function readJson<T>(file: string): T | null {
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8")) as T;
  } catch {
    return null;
  }
}

function jsonFiles(dir: string): string[] {
  try {
    return fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  } catch {
    return [];
  }
}

export function importLegacyJson(db: Database.Database, dataDir: string): ImportResult {
  const result: ImportResult = { customers: 0, rsvp: 0, guestbook: 0, admins: 0, skipped: [] };

  // 공유 ID: share-index.json({ id: 파일명 })이 있으면 그 값을 그대로 이어받아 이미 나간 ?id= 링크가 유지된다
  const shareIndex = readJson<Record<string, string>>(path.join(dataDir, "share-index.json")) ?? {};
  const shareIdOf = (file: string) => Object.keys(shareIndex).find((id) => shareIndex[id] === file) ?? newShareId();

  const insertCustomer = db.prepare(
    `insert or ignore into customers (file, email, share_id, label, wedding_date, template, data_enc, created_at, updated_at, plan)
     values (@file, @email, @share_id, @label, @wedding_date, @template, @data_enc, @created_at, @updated_at, 'paid')` // 기존 고객이므로 paid
  );
  for (const name of jsonFiles(path.join(dataDir, "clients"))) {
    const file = name.slice(0, -".json".length);
    const full = path.join(dataDir, "clients", name);
    const parsed = readJson<WeddingData & { _meta?: { owner?: string; createdAt?: string; updatedAt?: string } }>(full);
    // 청첩장 데이터가 아닌 파일(깨진 JSON, template 없음)은 건너뛴다 — 한 파일 때문에 앱 시작이 막히면 안 됨
    if (!parsed || typeof parsed.template !== "string" || !isValidClientFilename(file)) {
      result.skipped.push(`clients/${name}`);
      continue;
    }
    try {
      const { _meta, ...raw } = parsed;
      // 예전 방식(계좌 필드만 암호화)으로 저장된 값을 풀어서, 전체 암호화 형태로 다시 담는다
      const data = applyToEncryptedFields(raw as WeddingData, getSchemaForTemplate(raw.template), decrypt);
      const mtime = fs.statSync(full).mtime.toISOString();
      const email = isValidLoginEmail(file) ? file : _meta?.owner ?? null;
      const info = insertCustomer.run({
        file,
        email,
        share_id: shareIdOf(file),
        label: [data.groom?.name, data.bride?.name].map((n) => n?.trim()).filter(Boolean).join(" ♥ "),
        wedding_date: data.date?.iso ?? "",
        template: data.template,
        data_enc: encrypt(JSON.stringify(data)),
        created_at: _meta?.createdAt ?? mtime,
        updated_at: _meta?.updatedAt ?? mtime,
      });
      result.customers += info.changes;
    } catch (e) {
      result.skipped.push(`clients/${name} (${(e as Error).message})`);
    }
  }

  const insertRsvp = db.prepare(
    `insert into rsvp_entries (slug, name, side, attendance, guests, companion_name, message, submitted_at)
     values (@slug, @name, @side, @attendance, @guests, @companion_name, @message, @submitted_at)`
  );
  for (const name of jsonFiles(path.join(dataDir, "rsvp"))) {
    const slug = name.slice(0, -".json".length);
    if (!isValidClientFilename(slug)) continue;
    const entries = readJson<Record<string, string | undefined>[]>(path.join(dataDir, "rsvp", name)) ?? [];
    // 이미 가져온 슬러그는 건너뛴다 (항목에 고유키가 없어 중복 삽입 방지용)
    if (db.prepare("select 1 from rsvp_entries where slug = ?").get(slug)) continue;
    for (const e of entries) {
      insertRsvp.run({
        slug, name: encrypt(e.name ?? ""), side: e.side ?? null, attendance: e.attendance ?? "attending", guests: encrypt(e.guests ?? ""),
        companion_name: e.companionName ? encrypt(e.companionName) : null, message: e.message ? encrypt(e.message) : null, submitted_at: e.submittedAt ?? new Date().toISOString(),
      });
      result.rsvp++;
    }
  }

  const insertGuestbook = db.prepare(
    "insert into guestbook_entries (slug, name, message, submitted_at) values (@slug, @name, @message, @submitted_at)"
  );
  for (const name of jsonFiles(path.join(dataDir, "guestbook"))) {
    const slug = name.slice(0, -".json".length);
    if (!isValidClientFilename(slug)) continue;
    const entries = readJson<Record<string, string | undefined>[]>(path.join(dataDir, "guestbook", name)) ?? [];
    if (db.prepare("select 1 from guestbook_entries where slug = ?").get(slug)) continue;
    for (const e of entries) {
      insertGuestbook.run({ slug, name: encrypt(e.name ?? ""), message: encrypt(e.message ?? ""), submitted_at: e.submittedAt ?? new Date().toISOString() });
      result.guestbook++;
    }
  }

  const admins = readJson<string[]>(path.join(dataDir, "admins.json")) ?? [];
  for (const email of admins) result.admins += db.prepare("insert or ignore into admins (email) values (?)").run(email).changes;

  return result;
}
