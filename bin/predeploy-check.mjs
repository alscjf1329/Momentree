#!/usr/bin/env node
// 배포 전 점검 — 읽기 전용. DB는 readonly로만 열고 마이그레이션·삭제·수정은 하지 않는다.
// 사용: node bin/predeploy-check.mjs [.env 경로]   (DATA_DIR 환경변수 > .env의 DATA_DIR > ./data)
// 종료 코드: 차단 문제가 있으면 1, 아니면 0. 비밀 값은 출력하지 않는다.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const src = (f) => fs.readFileSync(path.join(root, "src", f), "utf8");
const block = [], warn = [];
const out = (s = "") => console.log(s);
const head = (s) => out(`\n== ${s} ==`);

// 코드의 기준값을 소스에서 직접 읽는다(복제 방지). 못 읽으면 null.
const num = (text, name) => { const m = text.match(new RegExp(`export const ${name} = (\\d+)`)); return m ? +m[1] : null; };
const PAID_KEEP_MONTHS = num(src("lib/plan.ts"), "PAID_KEEP_MONTHS");
const HIDE_MONTHS = num(src("lib/retention.ts"), "HIDE_MONTHS");
const PURGE_MONTHS = num(src("lib/retention.ts"), "PURGE_MONTHS");
const NOTICE_DAYS = num(src("lib/retention.ts"), "NOTICE_DAYS");
// 마이그레이션 개수: db.ts MIGRATIONS 배열의 최상위 항목(`로 시작하는 SQL, (db) => 함수)
const latest = (() => {
  const t = src("lib/db.ts"), i = t.indexOf("const MIGRATIONS"), j = t.indexOf("\n];", i);
  return i < 0 || j < 0 ? null : t.slice(i, j).split("\n").filter((l) => /^  `$/.test(l) || /^  \(db\) =>/.test(l)).length;
})();
if ([PAID_KEEP_MONTHS, HIDE_MONTHS, PURGE_MONTHS, NOTICE_DAYS, latest].includes(null)) warn.push("소스에서 기준값을 읽지 못했습니다. 이 스크립트를 갱신해 주세요.");

// retention.ts의 addMonths/parse와 같은 규칙
const addMonths = (t, m) => { const d = new Date(t); d.setUTCMonth(d.getUTCMonth() + m); return d.getTime(); };
const parse = (s) => { const t = s ? Date.parse(s) : NaN; return Number.isNaN(t) ? null : t; };

// ---- .env ----
function readEnvFile(p) {
  const o = {};
  for (const l of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m) o[m[1]] = m[2].replace(/^(["'])(.*)\1$/, "$2");
  }
  return o;
}
const envPath = process.argv[2];
let fileEnv = {};
if (envPath) {
  try { fileEnv = readEnvFile(envPath); } catch { warn.push(`.env 파일을 읽지 못했습니다: ${envPath}`); }
}
const env = (k) => process.env[k] || fileEnv[k] || "";
const placeholder = (v) => /^(change-me|xxxx|123456)/i.test(v) || /your-/i.test(v) || /@example\.com$/.test(v);

const dataDir = path.resolve(env("DATA_DIR") || "./data");
const dbFile = path.join(dataDir, "momentree.db");

out("Momentree 배포 전 점검 (읽기 전용)");
out(`데이터 폴더: ${dataDir}`);

// ---- DB ----
head("데이터베이스");
let db = null;
if (!fs.existsSync(dbFile)) {
  out("DB 파일이 없습니다. 새 서버라면 정상이고, 아니라면 DATA_DIR을 확인해 주세요.");
  warn.push("DB 파일 없음");
} else {
  try {
    const Database = createRequire(path.join(root, "package.json"))("better-sqlite3");
    db = new Database(dbFile, { readonly: true, fileMustExist: true });
  } catch (e) {
    out(`DB를 열지 못했습니다: ${e.message}`);
    block.push("DB를 열 수 없음");
  }
}
if (db) {
  const one = (sql, ...a) => db.prepare(sql).pluck().get(...a);
  const hasTable = (n) => !!one("select 1 from sqlite_master where type='table' and name=?", n);
  const v = db.pragma("user_version", { simple: true });
  out(`스키마 버전: v${v} (이번 코드는 v${latest})`);
  if (latest !== null && v < latest) out(`-> 배포 시 v${v}에서 v${latest}로 마이그레이션이 자동으로 돌아갑니다. 반드시 먼저 백업해 주세요.`);
  else if (latest !== null && v > latest) { out("-> DB가 이번 코드보다 새 버전입니다. 이전 버전으로 되돌리는 배포가 아닌지 확인해 주세요."); block.push("DB 버전이 코드보다 높음"); }
  else out("-> 마이그레이션 없음.");

  if (!hasTable("customers")) out("고객 테이블이 아직 없습니다.");
  else {
    const hasPlan = db.pragma("table_info(customers)").some((c) => c.name === "plan");
    const rows = db.prepare(`select file, wedding_date${hasPlan ? ", plan" : ""} from customers`).all();
    out(`고객 ${rows.length}명` + (hasPlan ? `: 유료 ${rows.filter((r) => r.plan === "paid").length}, 무료 ${rows.filter((r) => r.plan !== "paid").length}` : ""));
    const now = Date.now();
    const bad = rows.filter((r) => parse(r.wedding_date) === null).length;
    const expired = (r) => { const t = parse(r.wedding_date); return t !== null && now >= addMonths(t, PAID_KEEP_MONTHS); };

    head("플랜 영향");
    if (!hasPlan) {
      const n = rows.filter(expired).length;
      out(`plan 컬럼이 아직 없습니다. 배포 시 기존 고객 ${rows.length}명이 전원 유료로 이관됩니다.`);
      out(`그중 예식일 +${PAID_KEEP_MONTHS}개월이 이미 지난 ${n}명은 배포 즉시 무료로 계산됩니다(템플릿·사진·응답 제한 적용).`);
      if (n) warn.push("배포 즉시 무료로 강등될 고객이 있음");
    } else {
      out(`유료 중 예식일 +${PAID_KEEP_MONTHS}개월이 지나 무료로 계산되는 고객: ${rows.filter((r) => r.plan === "paid" && expired(r)).length}명`);
    }
    out(`예식일이 비었거나 읽을 수 없는 고객: ${bad}명 (만료·보관 정책이 적용되지 않음)`);

    head("하객 데이터 보관 정책");
    const cnt = (file) => ["rsvp_entries", "guestbook_entries"].reduce((s, t) => s + (hasTable(t) ? one(`select count(*) from ${t} where slug=?`, file) : 0), 0);
    const sets = { purge: [], hide: [], soon: [] };
    for (const r of rows) {
      const t = parse(r.wedding_date);
      if (t === null) continue;
      const purgeAt = addMonths(t, PURGE_MONTHS);
      if (now >= purgeAt) sets.purge.push(r);
      else {
        if (now >= addMonths(t, HIDE_MONTHS)) sets.hide.push(r);
        if (purgeAt - now <= NOTICE_DAYS * 86_400_000) sets.soon.push(r);
      }
    }
    const purgeRows = sets.purge.reduce((s, r) => s + cnt(r.file), 0);
    out(`예식일 +${PURGE_MONTHS}개월 지남: 청첩장 ${sets.purge.length}개, 하객 응답·방명록 ${purgeRows}건`);
    if (purgeRows > 0) { out("-> 첫 정리 실행 때 안내 메일 없이 바로 삭제됩니다. 필요하면 먼저 고객에게 알리거나 CSV를 받아 두세요."); warn.push("안내 없이 삭제될 하객 데이터가 있음"); }
    out(`예식일 +${HIDE_MONTHS}개월 지남(공개 숨김): ${sets.hide.length}개`);
    out(`${NOTICE_DAYS}일 안에 +${PURGE_MONTHS}개월이 되는 청첩장: ${sets.soon.length}개`);
  }

  head("예시 슬러그로 쌓인 응답");
  const like = "(slug = 'example' or slug like 'demo-%')";
  let ex = 0;
  for (const t of ["rsvp_entries", "guestbook_entries"]) {
    if (!hasTable(t)) continue;
    const n = one(`select count(*) from ${t} where ${like}`);
    out(`${t}: ${n}건`);
    ex += n;
  }
  if (ex > 0) {
    out("이번 배포부터 예시에는 저장되지 않습니다. 쌓인 테스트 데이터는 백업 후 서버에서 정리해 주세요(이 스크립트는 지우지 않습니다):");
    out(`  sqlite3 ${dbFile} "delete from rsvp_entries where ${like}; delete from guestbook_entries where ${like};"`);
    warn.push("예시 슬러그 테스트 데이터 정리 필요");
  }
  db.close();
}

// ---- 환경변수 ----
head("환경변수 (값은 표시하지 않음)");
const state = (k) => { const v = env(k); return !v ? "없음" : placeholder(v) ? "자리표시자" : "있음"; };
const check = (k, level, note = "") => {
  const s = state(k);
  out(`${k}: ${s}${s !== "있음" && note ? ` - ${note}` : ""}`);
  if (s !== "있음" && level === "block") block.push(`${k} ${s}`);
  else if (s !== "있음" && level === "warn") warn.push(`${k} ${s}`);
};
check("ADMIN_EMAIL", "warn", "어드민 로그인 코드를 받을 수 없음");
check("GMAIL_USER", "warn", "메일을 보낼 수 없음");
check("GMAIL_APP_PASSWORD", "warn", "메일을 보낼 수 없음");
check("ADMIN_SESSION_SECRET", "block", "로그인 세션을 만들 수 없음");
check("ENCRYPTION_KEY", "block", "고객 데이터를 읽고 쓸 수 없음");
if (state("ENCRYPTION_KEY") === "있음") {
  if (Buffer.from(env("ENCRYPTION_KEY"), "base64").length !== 32) { out("  ENCRYPTION_KEY가 base64 32바이트 형식이 아닙니다."); block.push("ENCRYPTION_KEY 형식 오류"); }
  else out("  ENCRYPTION_KEY: base64 32바이트 형식 확인");
}
check("SITE_URL", "warn", "메일 속 링크와 공유 주소가 비게 됨");
check("NEXT_PUBLIC_KAKAO_MAP_KEY", "warn", "지도가 나오지 않음(빌드 시점에 고정)");
check("TELEGRAM_BOT_TOKEN", "warn", "문의 접수 불가(문의하기·서버 오류·메일 실패 알림이 꺼짐)");
check("TELEGRAM_CHAT_ID", "warn", "문의 접수 불가(문의하기·서버 오류·메일 실패 알림이 꺼짐)");
out(`DATA_DIR: ${env("DATA_DIR") ? "지정됨" : "미지정(기본 ./data 사용)"}`);

// ---- 확정 필요 문구 ----
head("공개 문서의 [확정 필요] 항목");
let tbd = 0;
for (const f of ["app/privacy/page.tsx", "app/terms/page.tsx", "app/faq/page.tsx"]) {
  let t;
  try { t = src(f); } catch { continue; }
  const items = [...t.matchAll(/<Tbd>([\s\S]*?)<\/Tbd>/g)].map((m) => m[1].replace(/\s+/g, " ").trim());
  if (!items.length) continue;
  tbd += items.length;
  out(`src/${f}: ${items.length}개`);
  for (const s of items) out(`  - ${s.length > 40 ? s.slice(0, 40) + "…" : s}`);
}
if (!tbd) out("남은 항목 없음");
else warn.push(`[확정 필요] ${tbd}개 남음`);

// ---- 판정 ----
head("요약");
for (const b of block) out(`[차단] ${b}`);
for (const w of warn) out(`[주의] ${w}`);
out(block.length ? "판정: 배포하지 마세요. 차단 항목을 먼저 해결해 주세요." : warn.length ? "판정: 배포할 수 있지만 주의 항목을 확인해 주세요." : "판정: 문제 없습니다.");
process.exit(block.length ? 1 : 0);
