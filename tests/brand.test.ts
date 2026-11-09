import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { SERVICE_NAME, SERVICE_NAME_EN } from "@/lib/brand";
import { watermarkText } from "@/lib/plan";

function walk(d: string): string[] {
  return readdirSync(d, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(d, e.name)) : /\.(tsx?|css)$/.test(e.name) ? [join(d, e.name)] : []);
}

test("서비스명은 마당/Madang, 워터마크에 반영", () => {
  assert.equal(SERVICE_NAME, "마당");
  assert.equal(SERVICE_NAME_EN, "Madang");
  assert.equal(watermarkText, "마당으로 만든 청첩장");
});

test("src에 옛 이름이 화면 문구로 남지 않는다 (내부 식별자 예외)", () => {
  // 예외: DB 파일명, localStorage 키, 전역 캐시 키 — 바꾸면 기존 데이터가 끊긴다
  const allowed = /momentree\.db|momentree_[a-z_]+|__momentreeDb/gi;
  for (const f of walk("src")) {
    const rest = readFileSync(f, "utf8").replace(allowed, "").split("\n")
      .filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)).join("\n"); // 주석 줄 제외
    assert.doesNotMatch(rest, /momentree|모멘트리/i, f);
  }
});
