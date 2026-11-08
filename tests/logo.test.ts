import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const dir = join(process.cwd(), "docs/logo-proposals");
const files = ["a", "b", "c"].flatMap((n) => [`icon-${n}.svg`, `wordmark-${n}.svg`]);

for (const f of files) {
  test(`로고 시안 ${f}: 단일 svg, viewBox 있음, 외부 참조·script 없음`, () => {
    const s = readFileSync(join(dir, f), "utf8");
    assert.match(s, /^<svg [^>]*xmlns="http:\/\/www\.w3\.org\/2000\/svg"[^>]*viewBox="[^"]+"/);
    assert.ok(s.trim().endsWith("</svg>"));
    assert.equal((s.match(/<svg[\s>]/g) ?? []).length, 1);
    assert.doesNotMatch(s, /<script|<foreignObject|<text|<image|<style|@import|href=|on\w+=/i);
    assert.equal(s.replace('xmlns="http://www.w3.org/2000/svg"', "").match(/https?:\/\//g), null);
    // 태그 균형 (최소한의 XML 유효성)
    const stack: string[] = [];
    for (const [, close, name, self] of s.matchAll(/<(\/?)([a-zA-Z]+)[^>]*?(\/?)>/g)) {
      if (self) continue;
      if (close) assert.equal(stack.pop(), name);
      else stack.push(name);
    }
    assert.equal(stack.length, 0);
  });
}
