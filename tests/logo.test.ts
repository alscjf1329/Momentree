import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dir = join(process.cwd(), "docs/logo-proposals");
const files = ["a", "b", "c"].flatMap((n) => [`icon-${n}.svg`, `wordmark-${n}.svg`]);

test("적용된 앱 아이콘: public/icon.svg는 B, manifest·layout이 실제 파일을 가리킨다", () => {
  const svg = readFileSync("public/icon.svg", "utf8");
  assert.equal(svg, readFileSync(join(dir, "icon-b.svg"), "utf8"));
  assert.match(svg, /<rect [^>]*fill="#FFFFFF"/);
  const manifest = readFileSync("src/app/manifest.ts", "utf8");
  const srcs = [...manifest.matchAll(/src: "(\/[^"]+)"/g)].map((m) => m[1]);
  assert.ok(srcs.includes("/icon-512-maskable.png"));
  for (const s of srcs) assert.ok(existsSync(join("public", s)), s);
  const png = (f: string) => readFileSync(join("public", f)).subarray(0, 8).toString("hex");
  for (const f of ["icon-192.png", "icon-512.png", "icon-512-maskable.png", "apple-touch-icon.png"])
    assert.equal(png(f), "89504e470d0a1a0a", f);
  assert.match(manifest, /theme_color: "#ffffff"/);
  assert.match(manifest, /background_color: "#ffffff"/);
  const layout = readFileSync("src/app/layout.tsx", "utf8");
  assert.ok(layout.includes('href="/apple-touch-icon.png"'));
  assert.ok(layout.includes('name="theme-color" content="#ffffff"'));
});

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
