import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { getSchemaForTemplate } from "@/lib/templateSchemas";
import { TEMPLATE_NAMES } from "@/lib/templateNames";

// 템플릿 화면이 실제로 읽는 항목과 편집 폼 항목이 어긋나면 실패한다.
// (한쪽만 고치면 "화면엔 있는데 입력칸이 없다/입력칸은 있는데 화면에 안 나온다"가 생긴다 — MOM-56·57)
const GENERIC = new Set(["name", "title", "src", "from", "to"]); // 여러 곳에서 쓰는 흔한 이름은 구분할 수 없어 제외
const list = (dir: string): string[] => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? list(path.join(dir, e.name)) : e.name.endsWith(".tsx") ? [path.join(dir, e.name)] : []);
const read = (f: string) => fs.readFileSync(f, "utf8");

// 템플릿이 쓰는 소스 = 템플릿 폴더 + 거기서 쓰는 공용 섹션·컴포넌트(정적·동적 import)
function sourceOf(template: string): string {
  const seen = new Set<string>();
  const pending = list(`src/templates/${template}`);
  let out = "";
  while (pending.length) {
    const f = pending.pop()!;
    if (seen.has(f)) continue;
    seen.add(f);
    const s = read(f);
    out += s + "\n";
    for (const m of s.matchAll(/(?:from\s+|import\()\s*"@\/components\/([\w/]+)"/g)) {
      const p = `src/components/${m[1]}.tsx`;
      if (fs.existsSync(p)) pending.push(p);
    }
    for (const m of s.matchAll(/<(\w+Section|BgmPlayer)\b/g)) {
      const p = `src/components/sections/${m[1]}.tsx`;
      if (fs.existsSync(p)) pending.push(p);
    }
  }
  return out;
}

const leaf = (key: string) => key.split(".").at(-1)!;
const reads = (src: string, key: string) => {
  const k = leaf(key);
  return new RegExp(`[.?]${k}\\b`).test(src) || new RegExp(`\\{[^}]*\\b${k}\\b[^}]*\\}\\s*=\\s*(useWedding|w)\\b`).test(src);
};

const schemaKeys: Record<string, string[]> = {};
for (const id of Object.keys(TEMPLATE_NAMES)) schemaKeys[id] = getSchemaForTemplate(id).sections.flatMap((s) => s.fields.map((f) => f.key));
const universe = [...new Set(Object.values(schemaKeys).flat())].filter((k) => !GENERIC.has(leaf(k)));

test("편집 폼에 있는 항목은 그 템플릿 화면이 실제로 읽는다", () => {
  for (const id of Object.keys(TEMPLATE_NAMES)) {
    const src = sourceOf(id);
    const dead = schemaKeys[id].filter((k) => !GENERIC.has(leaf(k)) && !reads(src, k));
    assert.deepEqual(dead, [], `${id}: 입력칸은 있는데 화면에서 쓰지 않는 항목 — 스키마 excludeTemplates 에 추가하세요`);
  }
});

test("템플릿 화면이 읽는 편집 항목은 그 템플릿 편집 폼에 있다", () => {
  for (const id of Object.keys(TEMPLATE_NAMES)) {
    const src = sourceOf(id);
    const missing = universe.filter((k) => reads(src, k) && !schemaKeys[id].includes(k));
    assert.deepEqual(missing, [], `${id}: 화면에선 쓰는데 입력칸이 없는 항목 — 스키마 excludeTemplates 에서 빼세요`);
  }
});
