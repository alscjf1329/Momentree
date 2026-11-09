import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { TEMPLATE_NAMES, TEMPLATE_TINT } from "@/lib/templateNames";

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

test("PC 대응: 모바일 기본 + 확장 접두사가 랜딩·약관에 있다", () => {
  assert.match(page, /grid-cols-3 sm:grid-cols-5/);
  assert.match(page, /lg:flex-row/);
  assert.match(fs.readFileSync("src/components/LegalPage.tsx", "utf8"), /max-w-xl sm:max-w-2xl/);
});
