import fs from "fs";
import path from "path";
import crypto from "crypto";
import { DATA_DIR } from "@/lib/paths";
import { encrypt, decrypt } from "@/lib/accountCrypto";
import { deliverMail } from "@/lib/mailer";
import { notifyOperator } from "@/lib/notify";

// 메일 발송 파일 큐: DATA_DIR/mail-queue/{pending,sent,failed}/<id>.json
// 선택 이유: 스키마 마이그레이션 없이 상태 = 디렉터리 이동(rename 한 번)으로 표현되는 파일 큐가 SQLite 테이블보다 단순.
//
// !! 민감정보: 수신자 이메일·제목·본문(로그인 코드, 초대 링크)은 개인정보다. payload는 accountCrypto(AES-256-GCM)로
// 암호화해 저장하고, sent로 옮길 때 payload를 지운다(failed는 수동 확인용으로 암호화 상태 유지).
// 이 디렉터리를 백업/로그/에러 보고에 평문으로 노출하지 말 것. 로그에는 id·상태·시도 횟수만 남기고
// 본문/수신자/SMTP 에러 원문은 기록하지 않는다(lastError는 에러 이름만).

export type MailStatus = "pending" | "sent" | "failed";
export interface MailRecord {
  id: string;
  status: MailStatus;
  attempts: number;
  maxAttempts: number;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
  nextAt: number; // epoch ms, 이 시각 이후 시도
  payload?: string; // encrypt(JSON {to,subject,html}); sent 이후엔 제거
}
export interface MailOpts {
  dir?: string;
  send?: (to: string, subject: string, html: string) => Promise<void>;
  now?: () => number;
  baseDelayMs?: number; // 재시도 간격 = base * 2^(attempts-1)
}

const STATUSES: MailStatus[] = ["pending", "sent", "failed"];
export const DEFAULT_MAX_ATTEMPTS = 5;
const inflight = new Set<string>(); // 즉시 시도와 워커의 중복 처리 방지(단일 프로세스 전제)

const root = (o: MailOpts) => o.dir ?? path.join(DATA_DIR, "mail-queue");
const file = (o: MailOpts, s: MailStatus, id: string) => path.join(root(o), s, `${id}.json`);

function write(o: MailOpts, s: MailStatus, r: MailRecord) {
  const f = file(o, s, r.id);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f + ".tmp", JSON.stringify(r), { mode: 0o600 });
  fs.renameSync(f + ".tmp", f);
}

export function readMail(id: string, o: MailOpts = {}): MailRecord | null {
  for (const s of STATUSES) {
    try { return JSON.parse(fs.readFileSync(file(o, s, id), "utf-8")); } catch {}
  }
  return null;
}

// 한 건 처리: 성공→sent, 실패→백오프 후 pending 유지, 횟수 초과→failed. 발송 성공 여부 반환.
async function attempt(id: string, o: MailOpts): Promise<boolean> {
  if (inflight.has(id)) return false;
  inflight.add(id);
  try {
    const f = file(o, "pending", id);
    let r: MailRecord;
    try { r = JSON.parse(fs.readFileSync(f, "utf-8")); } catch { return false; }
    const now = o.now ?? Date.now;
    r.attempts++;
    r.updatedAt = new Date(now()).toISOString();
    try {
      const { to, subject, html } = JSON.parse(decrypt(r.payload!));
      await (o.send ?? deliverMail)(to, subject, html);
      r.status = "sent"; r.lastError = null; delete r.payload;
      write(o, "sent", r); fs.unlinkSync(f);
      return true;
    } catch (e) {
      // 에러 메시지엔 수신자가 섞일 수 있어 이름만 기록
      r.lastError = e instanceof Error ? e.name : "Error";
      if (r.attempts >= r.maxAttempts) {
        r.status = "failed"; write(o, "failed", r); fs.unlinkSync(f);
        // failed로 넘어가는 순간 1회만 알림(id만, 수신자·본문 제외). 재시도 없는 로그인 코드(maxAttempts=1)는 제외
        if (r.maxAttempts > 1) void notifyOperator(`[메일 실패] ${id} — ${r.attempts}회 시도 후 failed`);
      } else {
        r.nextAt = now() + (o.baseDelayMs ?? 30_000) * 2 ** (r.attempts - 1);
        write(o, "pending", r);
      }
      console.warn(`[mail-queue] ${id} ${r.status} attempts=${r.attempts}`);
      return false;
    }
  } finally {
    inflight.delete(id);
  }
}

// 접수. immediate면 즉시 1회 시도하고 발송 성공 여부를 반환, 아니면 접수만 하고 true(워커가 발송).
export async function enqueueMail(
  m: { to: string; subject: string; html: string },
  opts: MailOpts & { immediate?: boolean; maxAttempts?: number } = {}
): Promise<boolean> {
  const now = (opts.now ?? Date.now)();
  const id = `${now}-${crypto.randomBytes(6).toString("hex")}`;
  write(opts, "pending", {
    id, status: "pending", attempts: 0, maxAttempts: opts.maxAttempts ?? DEFAULT_MAX_ATTEMPTS, lastError: null,
    createdAt: new Date(now).toISOString(), updatedAt: new Date(now).toISOString(), nextAt: now,
    payload: encrypt(JSON.stringify(m)),
  });
  if (opts.immediate) return attempt(id, opts);
  startMailWorker(opts); // 접수 즉시 응답, 발송은 워커 몫
  return true;
}

// 기한이 된 pending 전부 처리(워커 한 틱). 처리 건수 반환.
export async function processDue(o: MailOpts = {}): Promise<number> {
  let ids: string[] = [];
  try { ids = fs.readdirSync(path.join(root(o), "pending")).filter((n) => n.endsWith(".json")).map((n) => n.slice(0, -5)); } catch {}
  const now = (o.now ?? Date.now)();
  let n = 0;
  for (const id of ids) {
    const r = readMail(id, o);
    if (r && r.status === "pending" && r.nextAt <= now) { await attempt(id, o); n++; }
  }
  return n;
}

// 서버 프로세스 안의 단순 워커. globalThis 싱글턴이라 HMR/다중 import에도 한 번만 기동.
// ponytail: 재시작 시 pending은 디스크에 남아 다음 enqueue/기동 때 이어 처리됨(부팅 시 자동 기동은 없음 — 필요하면 instrumentation.ts에서 호출).
const g = globalThis as unknown as { __mailWorker?: NodeJS.Timeout };
export function startMailWorker(o: MailOpts = {}, intervalMs = 5000) {
  if (!g.__mailWorker) {
    g.__mailWorker = setInterval(() => void processDue(o).catch(() => {}), intervalMs);
    g.__mailWorker.unref(); // 프로세스 종료를 막지 않는다
  }
  void processDue(o).catch(() => {});
}
