import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { LEGACY_TEMPLATES, TEMPLATE_NAMES, TEMPLATE_TINT } from "@/lib/templateNames";

const page = fs.readFileSync("src/app/page.tsx", "utf8");
const demo = fs.readFileSync("src/components/DemoPhone.tsx", "utf8");

test("랜딩의 템플릿 목록·개수는 TEMPLATE_NAMES 에서 파생되고 하드코딩 색·옛 문구가 없다", () => {
  assert.deepEqual(Object.keys(TEMPLATE_TINT).sort(), Object.keys(TEMPLATE_NAMES).sort());
  assert.match(page, /Object\.entries\(TEMPLATE_NAMES\)/);
  assert.match(demo, /Object\.entries\(TEMPLATE_NAMES\)/);
  assert.match(page, /\$\{TILES\.length\}가지/);
  assert.doesNotMatch(page, /\d+가지/); // 숫자 리터럴 개수 금지
  assert.doesNotMatch(page, /#[0-9a-fA-F]{3,8}\b/);
  assert.doesNotMatch(page, /크림|브라운|골드/);
});

test("랜딩: 모노가 첫 예시, 클래식은 랜딩에서 빠지고 신규 기본은 모노, classic 데이터 경로는 유지", async () => {
  assert.equal(Object.keys(TEMPLATE_NAMES)[0], "mono");
  assert.match(page, /LEGACY_TEMPLATES\.includes/);
  assert.match(demo, /LEGACY_TEMPLATES\.includes/);
  assert.ok(LEGACY_TEMPLATES.includes("classic"));
  const landing = Object.keys(TEMPLATE_NAMES).filter((id) => !LEGACY_TEMPLATES.includes(id));
  assert.equal(landing[0], "mono");
  assert.ok(!landing.includes("classic"));
  assert.equal(landing.length, Object.keys(TEMPLATE_NAMES).length - 1);
  const { DEFAULT_WEDDING_DATA } = await import("@/lib/newClient");
  const { EXAMPLE } = await import("@/example");
  assert.equal(DEFAULT_WEDDING_DATA.template, "mono");
  assert.equal(EXAMPLE.template, "mono");
  // 기존 클래식 고객·링크: 템플릿 파일·맵·데모 슬러그·공유 경로가 그대로
  const { getInvite } = await import("@/invites");
  assert.equal(getInvite("demo-classic")!.template, "classic");
  assert.ok(fs.existsSync("src/templates/classic.tsx") || fs.existsSync("src/templates/classic"));
  assert.match(fs.readFileSync("src/templates/registry.ts", "utf8"), /classic: ClassicTemplate/);
});

test("PC 대응: 모바일 기본 + 확장 접두사가 랜딩·약관에 있다", () => {
  assert.match(page, /grid-cols-3 sm:grid-cols-5/);
  assert.match(page, /lg:flex-row/);
  assert.match(fs.readFileSync("src/components/LegalPage.tsx", "utf8"), /max-w-xl sm:max-w-2xl/);
});

test("랜딩 예시: 모든 템플릿 데모가 EXAMPLE 기반이고 사진·필수 값이 갖춰져 있다", async () => {
  const { EXAMPLE } = await import("@/example");
  const { getInvite } = await import("@/invites");
  assert.equal(getInvite("example"), EXAMPLE);
  const rest = (d: typeof EXAMPLE) => ({ ...d, slug: "", template: "", theme: "" });
  for (const t of Object.keys(TEMPLATE_NAMES)) {
    const d = getInvite(`demo-${t}`);
    assert.ok(d, t);
    assert.equal(d.template, t);
    assert.deepEqual(rest(d), rest(EXAMPLE));
  }
  assert.ok(EXAMPLE.groom.name && EXAMPLE.bride.name && EXAMPLE.venue.address && EXAMPLE.greeting.length);
  assert.equal(EXAMPLE.gallery.length, 5);
  for (const src of [EXAMPLE.introBg, ...EXAMPLE.gallery.map((g) => g.src)]) {
    assert.ok(fs.existsSync(`public${src}`), src);
  }
  // 계좌는 명백한 가짜 번호
  for (const a of [...EXAMPLE.groom.accounts, ...EXAMPLE.bride.accounts]) assert.match(a.number, /^000-00-00000\d$/);
  assert.ok(new Date(EXAMPLE.date.iso) > new Date("2027-01-01")); // 먼 미래 날짜
  assert.doesNotMatch(demo, /"garden"/); // 가든도 랜딩에 나온다
});
