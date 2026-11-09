import { SERVICE_NAME } from "@/lib/brand";
import { getDb } from "@/lib/db";
import { enqueueMail } from "@/lib/mailQueue";
import { PAID_KEEP_MONTHS } from "@/lib/plan";

// 하객 데이터(RSVP·방명록) 보관 정책 — 서버 전용.
// 예식일 +6개월: 비공개(공개 조회 제외, 고객·편집자는 계속 열람) / +12개월: 행 완전 삭제 / 삭제 30일 전: 소유자에게 안내 메일 1회.
export const HIDE_MONTHS = 6;
export const PURGE_MONTHS = 12;
export const NOTICE_DAYS = 30;
const DAY = 86_400_000;

export type RetentionPhase = "active" | "hidden" | "purge";

function addMonths(t: number, m: number): number {
  const d = new Date(t);
  d.setUTCMonth(d.getUTCMonth() + m);
  return d.getTime();
}

// 예식일이 비었거나 파싱 불가면 null — 호출부는 항상 active(안전한 쪽)로 취급한다
function parse(weddingDate: string | null | undefined): number | null {
  const t = weddingDate ? Date.parse(weddingDate) : NaN;
  return Number.isNaN(t) ? null : t;
}

export function retentionPhase(weddingDate: string | null | undefined, now: Date = new Date()): RetentionPhase {
  const t = parse(weddingDate);
  if (t === null) return "active";
  if (now.getTime() >= addMonths(t, PURGE_MONTHS)) return "purge";
  return now.getTime() >= addMonths(t, HIDE_MONTHS) ? "hidden" : "active";
}

// 삭제 예정 시각(ms)과 예고 시작 시각(ms). 예식일이 없으면 null.
export function purgeAt(weddingDate: string | null | undefined): number | null {
  const t = parse(weddingDate);
  return t === null ? null : addMonths(t, PURGE_MONTHS);
}
export function noticeAt(weddingDate: string | null | undefined): number | null {
  const p = purgeAt(weddingDate);
  return p === null ? null : p - NOTICE_DAYS * DAY;
}

// 유료 만료 시각(ms): 예식일 + PAID_KEEP_MONTHS. 예식일이 없으면 null(만료 없음).
export function paidUntil(weddingDate: string | null | undefined): number | null {
  const t = parse(weddingDate);
  return t === null ? null : addMonths(t, PAID_KEEP_MONTHS);
}

// 공개 조회에서 숨길 파일인가 (고객이 아닌 데모 슬러그 등은 active)
export function isGuestDataHidden(file: string, now: Date = new Date()): boolean {
  const d = getDb().prepare("select wedding_date from customers where file = ?").pluck().get(file) as string | undefined;
  return retentionPhase(d, now) !== "active";
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

// 모든 부작용(삭제·예고 메일·중복 방지 표시)은 여기서만. now와 메일 접수 함수는 주입 가능.
export async function runRetention(
  now: Date = new Date(),
  enqueue: typeof enqueueMail = enqueueMail
): Promise<{ purged: string[]; notified: string[] }> {
  const db = getDb();
  const out = { purged: [] as string[], notified: [] as string[] };
  const rows = db.prepare(
    `select c.file, c.label, c.wedding_date, c.retention_notified_at,
            coalesce(c.email, (select email from customer_members m where m.file = c.file and m.role = 'owner' limit 1)) as owner
     from customers c where c.wedding_date != ''`
  ).all() as { file: string; label: string; wedding_date: string; retention_notified_at: string | null; owner: string | null }[];

  for (const r of rows) {
    const phase = retentionPhase(r.wedding_date, now);
    if (phase === "purge") {
      // 고객 파일·계정은 유지하고 하객 행만 지운다
      const n = db.transaction(() =>
        db.prepare("delete from rsvp_entries where slug = ?").run(r.file).changes +
        db.prepare("delete from guestbook_entries where slug = ?").run(r.file).changes)();
      if (n > 0) out.purged.push(r.file);
    } else if (!r.retention_notified_at && r.owner && now.getTime() >= noticeAt(r.wedding_date)!) {
      const date = new Date(purgeAt(r.wedding_date)!).toISOString().slice(0, 10);
      const site = (process.env.SITE_URL ?? "").replace(/\/$/, "");
      const ok = await enqueue({
        to: r.owner,
        subject: `[${SERVICE_NAME}] 하객 응답·방명록이 곧 삭제됩니다`,
        html: `<p>${esc(r.label || "고객")}님의 청첩장에 모인 하객 참석 응답과 방명록이 <b>${date}</b>에 완전히 삭제됩니다.</p>` +
          `<p>보관이 필요하면 삭제 전에 ${site ? `<a href="${esc(site)}/admin">어드민 하객 화면</a>` : "어드민 하객 화면"}에서 &quot;CSV 내려받기&quot;로 저장해 주세요.</p>`,
      });
      if (ok) {
        db.prepare("update customers set retention_notified_at = ? where file = ?").run(now.toISOString(), r.file);
        out.notified.push(r.file);
      }
    }
  }
  return out;
}

// 하루 1회 인프로세스 워커 (메일 워커와 같은 globalThis 싱글턴 방식). 기동 직후에도 1회 실행.
const g = globalThis as unknown as { __retentionWorker?: NodeJS.Timeout };
export function startRetentionWorker() {
  if (g.__retentionWorker) return;
  const tick = () => void runRetention().catch((e) => console.warn("[retention] 실패", e instanceof Error ? e.name : e));
  g.__retentionWorker = setInterval(tick, DAY);
  g.__retentionWorker.unref();
  tick();
}
