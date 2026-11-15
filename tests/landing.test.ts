import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { TEMPLATE_NAMES, TEMPLATE_TINT } from "@/lib/templateNames";

const page = fs.readFileSync("src/app/page.tsx", "utf8");
const demo = fs.readFileSync("src/components/DemoPhone.tsx", "utf8");

test("랜딩 예시의 템플릿 목록은 TEMPLATE_NAMES 에서 파생되고 하드코딩 색·옛 문구가 없다", () => {
  assert.deepEqual(Object.keys(TEMPLATE_TINT).sort(), Object.keys(TEMPLATE_NAMES).sort());
  assert.match(demo, /Object\.entries\(TEMPLATE_NAMES\)/);
  assert.doesNotMatch(page, /\d+가지/); // 숫자 리터럴 개수 금지
  assert.doesNotMatch(page, /#[0-9a-fA-F]{3,8}\b/);
  assert.doesNotMatch(page, /크림|브라운|골드/);
});

test("랜딩: 템플릿은 모노 하나, 폐기된 옛 템플릿 링크는 모노로 열리고 신규 기본은 모노", async () => {
  assert.equal(Object.keys(TEMPLATE_NAMES)[0], "mono");
  assert.deepEqual(Object.keys(TEMPLATE_NAMES), ["mono"]);
  const { DEFAULT_WEDDING_DATA } = await import("@/lib/newClient");
  const { EXAMPLE } = await import("@/example");
  assert.equal(DEFAULT_WEDDING_DATA.template, "mono");
  assert.equal(EXAMPLE.template, "mono");
  // 옛 클래식 링크는 모노로 열린다
  const { getInvite } = await import("@/invites");
  assert.equal(getInvite("demo-classic")!.template, "mono");
  assert.ok(!fs.existsSync("src/templates/classic"));
  assert.doesNotMatch(fs.readFileSync("src/templates/registry.ts", "utf8"), /classic/);
  assert.match(fs.readFileSync("src/app/invite/[slug]/page.tsx", "utf8"), /slug in TEMPLATE_MAP \? slug : "mono"/);
});

test("PC 대응: 모바일 기본 + 확장 접두사가 랜딩·약관에 있다", () => {
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
});

test("링크 미리보기: OG 이미지 주소 규칙, 고객 청첩장은 noindex, robots.txt 는 관리자·API 를 막는다", async () => {
  const { ogImageUrl, originFrom } = await import("@/lib/ogImage");
  assert.equal(ogImageUrl("https://x.kr", "/uploads/images/a.jpg"), "https://x.kr/_next/image?url=%2Fuploads%2Fimages%2Fa.jpg&w=1200&q=75");
  assert.equal(ogImageUrl("https://x.kr", "/uploads/images/a.gif"), "https://x.kr/uploads/images/a.gif"); // gif 는 원본
  assert.equal(ogImageUrl("https://x.kr", "https://cdn.test/a.png"), "https://cdn.test/a.png");
  const h = (m: Record<string, string>) => ({ get: (k: string) => m[k] ?? null });
  assert.equal(originFrom(h({}), "https://site.kr/"), "https://site.kr");
  assert.equal(originFrom(h({ "x-forwarded-host": "a.kr", "x-forwarded-proto": "https" }), ""), "https://a.kr");
  assert.equal(originFrom(h({ host: "momentree.shop" }), ""), "https://momentree.shop"); // 프로토콜 헤더가 없어도 https
  assert.equal(originFrom(h({ host: "localhost:3000" }), ""), "http://localhost:3000");
  const invite = fs.readFileSync("src/app/invite/[slug]/page.tsx", "utf8");
  assert.match(invite, /isCustomer \? \{ robots: \{ index: false, follow: false \} \}/);
  const { default: robots } = await import("@/app/robots");
  const disallow = (robots().rules as { disallow: string[] }[])[0].disallow;
  for (const p of ["/admin", "/api", "/preview"]) assert.ok(disallow.includes(p), p);
});
