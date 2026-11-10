import { test } from "node:test";
import assert from "node:assert/strict";
import { setByPath } from "@/lib/schema";
import { getSchemaForTemplate } from "@/lib/templateSchemas";
import { TEMPLATE_NAMES } from "@/lib/templateNames";
import type { FieldSchema } from "@/lib/schema";

test("setByPath: 상위 객체가 없어도 입력된다(옛 데이터)", () => {
  assert.deepEqual(setByPath({}, "bgm.title", "곡"), { bgm: { title: "곡" } });
  assert.deepEqual(setByPath({ bgm: null }, "bgm.src", "/a.mp3"), { bgm: { src: "/a.mp3" } });
  assert.deepEqual(setByPath({}, "info.0.title", "t"), { info: [{ title: "t" }] }); // 숫자 키는 배열
  assert.deepEqual(setByPath({ a: { b: 1 } }, "a.c", 2), { a: { b: 1, c: 2 } }); // 기존 값은 그대로
});

test("모든 템플릿의 모든 필드가 빈 데이터에서도 입력·항목 추가가 된다", () => {
  const ids = Object.keys(TEMPLATE_NAMES);
  const seen = new Set<string>();
  const check = (f: FieldSchema, path: string) => {
    if (f.type === "array-object") {
      const withItem = setByPath({}, path, [{}]);
      for (const sub of f.itemFields ?? []) setByPath(withItem, `${path}.0.${sub.key}`, "x");
    } else setByPath({}, path, f.type === "array" ? ["x"] : "x");
  };
  for (const id of ids) for (const sec of getSchemaForTemplate(id).sections) for (const f of sec.fields) {
    if (seen.has(f.key)) continue;
    seen.add(f.key);
    check(f, f.key);
  }
  assert.ok(seen.size > 20);
});
