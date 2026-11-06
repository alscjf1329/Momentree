import { getDb } from "@/lib/db";

// RSVP·방명록 저장소 — 서버 전용. 항목은 고유 id로 수정/삭제한다
// (예전에는 배열 위치(index)를 썼어서, 동시에 지우면 엉뚱한 항목이 지워질 수 있었다).

export interface RsvpEntry {
  id: number;
  name: string;
  side?: "groom" | "bride" | "";
  attendance: "attending" | "not_attending";
  guests: string;
  companionName?: string;
  message?: string;
  submittedAt: string;
}

export interface GuestbookEntry {
  id: number;
  name: string;
  message: string;
  submittedAt: string;
}

type RsvpRow = {
  id: number; name: string; side: string | null; attendance: string; guests: string;
  companion_name: string | null; message: string | null; submitted_at: string;
};

const toRsvp = (r: RsvpRow): RsvpEntry => ({
  id: r.id, name: r.name, side: (r.side ?? "") as RsvpEntry["side"], attendance: r.attendance as RsvpEntry["attendance"],
  guests: r.guests, companionName: r.companion_name ?? undefined, message: r.message ?? undefined, submittedAt: r.submitted_at,
});

export function listRsvp(slug: string): RsvpEntry[] {
  return (getDb().prepare("select * from rsvp_entries where slug = ? order by id").all(slug) as RsvpRow[]).map(toRsvp);
}

export function listRsvpSlugs(): string[] {
  return getDb().prepare("select distinct slug from rsvp_entries order by slug").pluck().all() as string[];
}

export function addRsvp(slug: string, e: Partial<RsvpEntry>): void {
  getDb()
    .prepare(
      `insert into rsvp_entries (slug, name, side, attendance, guests, companion_name, message, submitted_at)
       values (@slug, @name, @side, @attendance, @guests, @companion_name, @message, @submitted_at)`
    )
    .run({
      slug, name: String(e.name ?? ""), side: e.side ?? null, attendance: e.attendance ?? "attending",
      guests: String(e.guests ?? ""), companion_name: e.companionName ?? null, message: e.message ?? null,
      submitted_at: new Date().toISOString(),
    });
}

// 수정 가능한 필드만 반영 (slug·id·제출 시각은 바꿀 수 없다)
const RSVP_EDITABLE: Record<string, string> = {
  name: "name", side: "side", attendance: "attendance", guests: "guests", companionName: "companion_name", message: "message",
};

export function updateRsvp(slug: string, id: number, updates: Record<string, unknown>): boolean {
  const cols = Object.keys(updates).filter((k) => k in RSVP_EDITABLE);
  if (cols.length === 0) return !!getDb().prepare("select 1 from rsvp_entries where id = ? and slug = ?").get(id, slug);
  const set = cols.map((k) => `${RSVP_EDITABLE[k]} = @${k}`).join(", ");
  const params = Object.fromEntries(cols.map((k) => [k, updates[k] == null ? null : String(updates[k])]));
  return getDb().prepare(`update rsvp_entries set ${set} where id = @id and slug = @slug`).run({ ...params, id, slug }).changes > 0;
}

export function deleteRsvp(slug: string, id: number): boolean {
  return getDb().prepare("delete from rsvp_entries where id = ? and slug = ?").run(id, slug).changes > 0;
}

export function listGuestbook(slug: string): GuestbookEntry[] {
  return (getDb().prepare("select id, name, message, submitted_at from guestbook_entries where slug = ? order by id").all(slug) as
    { id: number; name: string; message: string; submitted_at: string }[]).map((r) => ({
    id: r.id, name: r.name, message: r.message, submittedAt: r.submitted_at,
  }));
}

export function addGuestbook(slug: string, name: string, message: string): void {
  getDb()
    .prepare("insert into guestbook_entries (slug, name, message, submitted_at) values (?, ?, ?, ?)")
    .run(slug, name, message, new Date().toISOString());
}

export function deleteGuestbook(slug: string, id: number): boolean {
  return getDb().prepare("delete from guestbook_entries where id = ? and slug = ?").run(id, slug).changes > 0;
}
